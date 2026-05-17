"""
OCR Service for Soil Report Extraction
Extracts text and data from PDF and image soil reports
"""

import re
import logging
from typing import Dict, Optional, List
from pathlib import Path
import PyPDF2
from PIL import Image
import io

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class OCRService:
    """
    OCR service for extracting soil data from reports
    Supports PDF and image formats
    """
    
    def __init__(self):
        self.nutrient_patterns = {
            'N': [
                r'nitrogen[:\s]+(\d+\.?\d*)',
                r'N[:\s]+(\d+\.?\d*)',
                r'N\s*=\s*(\d+\.?\d*)',
                r'available\s+nitrogen[:\s]+(\d+\.?\d*)'
            ],
            'P': [
                r'phosphorus[:\s]+(\d+\.?\d*)',
                r'P[:\s]+(\d+\.?\d*)',
                r'P\s*=\s*(\d+\.?\d*)',
                r'available\s+phosphorus[:\s]+(\d+\.?\d*)',
                r'P2O5[:\s]+(\d+\.?\d*)'
            ],
            'K': [
                r'potassium[:\s]+(\d+\.?\d*)',
                r'K[:\s]+(\d+\.?\d*)',
                r'K\s*=\s*(\d+\.?\d*)',
                r'available\s+potassium[:\s]+(\d+\.?\d*)',
                r'K2O[:\s]+(\d+\.?\d*)'
            ],
            'ph': [
                r'pH[:\s]+(\d+\.?\d*)',
                r'pH\s*=\s*(\d+\.?\d*)',
                r'soil\s+pH[:\s]+(\d+\.?\d*)'
            ],
            'organic_carbon': [
                r'organic\s+carbon[:\s]+(\d+\.?\d*)',
                r'OC[:\s]+(\d+\.?\d*)',
                r'carbon[:\s]+(\d+\.?\d*)'
            ],
            'moisture': [
                r'moisture[:\s]+(\d+\.?\d*)',
                r'water\s+content[:\s]+(\d+\.?\d*)',
                r'humidity[:\s]+(\d+\.?\d*)'
            ]
        }
    
    def extract_from_pdf(self, pdf_path: str) -> Dict:
        """
        Extract text from PDF file
        
        Args:
            pdf_path: Path to PDF file
            
        Returns:
            Dictionary with extracted data
        """
        logger.info(f"Extracting text from PDF: {pdf_path}")
        
        try:
            with open(pdf_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                text = ""
                
                # Extract text from all pages
                for page_num in range(len(pdf_reader.pages)):
                    page = pdf_reader.pages[page_num]
                    text += page.extract_text() + "\n"
                
                logger.info(f"Extracted {len(text)} characters from PDF")
                
                # Parse extracted text
                soil_data = self.parse_text(text)
                
                return {
                    'success': True,
                    'source': 'pdf',
                    'raw_text': text,
                    'soil_data': soil_data
                }
                
        except Exception as e:
            logger.error(f"Error extracting from PDF: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def extract_from_image(self, image_path: str) -> Dict:
        """
        Extract text from image using OCR
        
        Args:
            image_path: Path to image file
            
        Returns:
            Dictionary with extracted data
        """
        logger.info(f"Extracting text from image: {image_path}")
        
        try:
            # Try to import pytesseract
            try:
                import pytesseract
            except ImportError:
                logger.warning("pytesseract not available. Install tesseract-ocr for image support.")
                return {
                    'success': False,
                    'error': 'OCR not available. Install pytesseract and tesseract-ocr.'
                }
            
            # Open and process image
            image = Image.open(image_path)
            
            # Perform OCR
            text = pytesseract.image_to_string(image)
            
            logger.info(f"Extracted {len(text)} characters from image")
            
            # Parse extracted text
            soil_data = self.parse_text(text)
            
            return {
                'success': True,
                'source': 'image',
                'raw_text': text,
                'soil_data': soil_data
            }
            
        except Exception as e:
            logger.error(f"Error extracting from image: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def parse_text(self, text: str) -> Dict[str, float]:
        """
        Parse text to extract soil parameters
        
        Args:
            text: Raw text from document
            
        Returns:
            Dictionary with soil parameters
        """
        logger.info("Parsing text for soil parameters...")
        
        # Convert to lowercase for easier matching
        text_lower = text.lower()
        
        soil_data = {}
        
        # Extract each nutrient
        for nutrient, patterns in self.nutrient_patterns.items():
            value = self._extract_value(text_lower, patterns)
            if value is not None:
                soil_data[nutrient] = value
                logger.info(f"Found {nutrient}: {value}")
        
        # Map organic_carbon to humidity if needed (approximation)
        if 'organic_carbon' in soil_data and 'moisture' not in soil_data:
            # Rough approximation: OC% * 20 ≈ moisture%
            soil_data['moisture'] = min(100, soil_data['organic_carbon'] * 20)
        
        # Rename moisture to humidity for consistency
        if 'moisture' in soil_data:
            soil_data['humidity'] = soil_data.pop('moisture')
        
        # Remove organic_carbon as it's not in our model
        soil_data.pop('organic_carbon', None)
        
        logger.info(f"Extracted {len(soil_data)} parameters")
        return soil_data
    
    def _extract_value(self, text: str, patterns: List[str]) -> Optional[float]:
        """
        Extract numeric value using regex patterns
        
        Args:
            text: Text to search
            patterns: List of regex patterns
            
        Returns:
            Extracted value or None
        """
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                try:
                    value = float(match.group(1))
                    return value
                except (ValueError, IndexError):
                    continue
        
        return None
    
    def validate_soil_data(self, soil_data: Dict[str, float]) -> Dict:
        """
        Validate extracted soil data
        
        Args:
            soil_data: Extracted soil parameters
            
        Returns:
            Validation result
        """
        required_params = ['N', 'P', 'K', 'ph']
        missing_params = [p for p in required_params if p not in soil_data]
        
        # Validate ranges
        validation_ranges = {
            'N': (0, 200),
            'P': (0, 200),
            'K': (0, 300),
            'ph': (3.0, 10.0),
            'humidity': (0, 100)
        }
        
        out_of_range = []
        for param, value in soil_data.items():
            if param in validation_ranges:
                min_val, max_val = validation_ranges[param]
                if not (min_val <= value <= max_val):
                    out_of_range.append({
                        'parameter': param,
                        'value': value,
                        'expected_range': f"{min_val}-{max_val}"
                    })
        
        is_valid = len(missing_params) == 0 and len(out_of_range) == 0
        
        return {
            'is_valid': is_valid,
            'missing_parameters': missing_params,
            'out_of_range': out_of_range,
            'completeness': (len(required_params) - len(missing_params)) / len(required_params) * 100
        }
    
    def process_soil_report(self, file_path: str) -> Dict:
        """
        Process soil report file (PDF or image)
        
        Args:
            file_path: Path to soil report file
            
        Returns:
            Complete processing result
        """
        logger.info(f"Processing soil report: {file_path}")
        
        file_ext = Path(file_path).suffix.lower()
        
        # Extract based on file type
        if file_ext == '.pdf':
            result = self.extract_from_pdf(file_path)
        elif file_ext in ['.jpg', '.jpeg', '.png', '.tiff', '.bmp']:
            result = self.extract_from_image(file_path)
        else:
            return {
                'success': False,
                'error': f'Unsupported file format: {file_ext}'
            }
        
        if not result['success']:
            return result
        
        # Validate extracted data
        validation = self.validate_soil_data(result['soil_data'])
        result['validation'] = validation
        
        # Add default values for missing parameters
        if not validation['is_valid']:
            result['soil_data_with_defaults'] = self._add_default_values(
                result['soil_data']
            )
        
        return result
    
    def _add_default_values(self, soil_data: Dict[str, float]) -> Dict[str, float]:
        """Add default values for missing parameters"""
        defaults = {
            'N': 50.0,
            'P': 40.0,
            'K': 50.0,
            'ph': 6.5,
            'humidity': 70.0,
            'temperature': 25.0,
            'rainfall': 150.0
        }
        
        complete_data = defaults.copy()
        complete_data.update(soil_data)
        
        return complete_data


# Convenience function
def extract_soil_data_from_file(file_path: str) -> Dict:
    """
    Convenience function to extract soil data from file
    
    Args:
        file_path: Path to soil report file
        
    Returns:
        Extraction result
    """
    ocr_service = OCRService()
    return ocr_service.process_soil_report(file_path)
