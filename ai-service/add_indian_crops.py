"""
Script to add common Indian agricultural crops to the dataset
Includes vegetables, grains, and pulses commonly grown in India
"""

import pandas as pd
import numpy as np
import os

# Define Indian crop data with typical soil/climate conditions
INDIAN_CROPS = {
    # GRAINS
    'wheat': {
        'N': (80, 120), 'P': (40, 60), 'K': (40, 60),
        'temperature': (15, 25), 'humidity': (40, 60),
        'ph': (6.0, 7.5), 'rainfall': (400, 650)
    },
    'maize': {
        'N': (120, 200), 'P': (60, 90), 'K': (40, 60),
        'temperature': (21, 27), 'humidity': (60, 80),
        'ph': (6.0, 7.0), 'rainfall': (500, 1200)
    },
    'bajra': {  # Pearl Millet
        'N': (40, 80), 'P': (20, 40), 'K': (20, 40),
        'temperature': (25, 35), 'humidity': (30, 50),
        'ph': (6.5, 8.0), 'rainfall': (400, 600)
    },
    'ragi': {  # Finger Millet
        'N': (40, 60), 'P': (20, 40), 'K': (20, 40),
        'temperature': (18, 28), 'humidity': (50, 70),
        'ph': (5.5, 7.5), 'rainfall': (500, 1000)
    },
    'jowar': {  # Sorghum
        'N': (40, 80), 'P': (20, 40), 'K': (20, 40),
        'temperature': (20, 32), 'humidity': (40, 70),
        'ph': (6.0, 8.0), 'rainfall': (400, 700)
    },
    
    # PULSES
    'chickpea': {
        'N': (20, 40), 'P': (50, 80), 'K': (40, 60),
        'temperature': (15, 25), 'humidity': (40, 60),
        'ph': (7.0, 8.0), 'rainfall': (400, 700)
    },
    'lentil': {
        'N': (20, 40), 'P': (50, 70), 'K': (40, 60),
        'temperature': (15, 22), 'humidity': (40, 60),
        'ph': (6.5, 8.0), 'rainfall': (350, 650)
    },
    'pigeonpea': {
        'N': (20, 40), 'P': (40, 70), 'K': (40, 60),
        'temperature': (20, 30), 'humidity': (50, 70),
        'ph': (6.0, 7.5), 'rainfall': (600, 1000)
    },
    
    # VEGETABLES
    'tomato': {
        'N': (100, 150), 'P': (50, 80), 'K': (80, 120),
        'temperature': (20, 28), 'humidity': (60, 80),
        'ph': (6.0, 7.0), 'rainfall': (500, 1000)
    },
    'onion': {
        'N': (80, 120), 'P': (50, 80), 'K': (100, 140),
        'temperature': (13, 24), 'humidity': (50, 70),
        'ph': (6.0, 7.0), 'rainfall': (300, 600)
    },
    'potato': {
        'N': (100, 150), 'P': (80, 120), 'K': (100, 150),
        'temperature': (15, 25), 'humidity': (70, 90),
        'ph': (5.5, 7.0), 'rainfall': (450, 900)
    },
    'cabbage': {
        'N': (80, 120), 'P': (50, 80), 'K': (60, 100),
        'temperature': (15, 25), 'humidity': (70, 90),
        'ph': (6.0, 7.5), 'rainfall': (500, 900)
    },
    'carrot': {
        'N': (80, 120), 'P': (50, 80), 'K': (100, 150),
        'temperature': (15, 20), 'humidity': (60, 80),
        'ph': (6.0, 7.0), 'rainfall': (400, 700)
    },
    'brinjal': {  # Eggplant
        'N': (100, 150), 'P': (50, 80), 'K': (80, 120),
        'temperature': (24, 30), 'humidity': (60, 80),
        'ph': (5.5, 7.0), 'rainfall': (600, 1000)
    },
    'bell_pepper': {
        'N': (100, 150), 'P': (50, 80), 'K': (80, 120),
        'temperature': (21, 29), 'humidity': (60, 80),
        'ph': (6.0, 7.0), 'rainfall': (600, 900)
    },
    'cucumber': {
        'N': (120, 180), 'P': (50, 80), 'K': (100, 150),
        'temperature': (20, 30), 'humidity': (60, 80),
        'ph': (6.0, 7.0), 'rainfall': (400, 800)
    },
    'bottle_gourd': {
        'N': (80, 120), 'P': (40, 70), 'K': (80, 120),
        'temperature': (18, 28), 'humidity': (60, 80),
        'ph': (6.0, 7.5), 'rainfall': (600, 1000)
    },
    'radish': {
        'N': (60, 100), 'P': (40, 70), 'K': (60, 100),
        'temperature': (10, 25), 'humidity': (60, 80),
        'ph': (6.0, 7.0), 'rainfall': (300, 500)
    },
    'spinach': {
        'N': (80, 120), 'P': (40, 70), 'K': (80, 120),
        'temperature': (5, 20), 'humidity': (60, 80),
        'ph': (6.5, 7.5), 'rainfall': (400, 700)
    },
    
    # CASH CROPS
    'cotton': {
        'N': (100, 150), 'P': (40, 70), 'K': (80, 120),
        'temperature': (21, 30), 'humidity': (40, 60),
        'ph': (6.0, 8.0), 'rainfall': (600, 1000)
    },
    'sugarcane': {
        'N': (120, 200), 'P': (60, 100), 'K': (80, 140),
        'temperature': (20, 30), 'humidity': (60, 80),
        'ph': (6.0, 8.0), 'rainfall': (1200, 1600)
    },
    'groundnut': {
        'N': (20, 40), 'P': (40, 70), 'K': (80, 120),
        'temperature': (20, 30), 'humidity': (50, 70),
        'ph': (5.9, 6.8), 'rainfall': (500, 1000)
    },
}

def generate_synthetic_crop_data(crop_name, crop_params, samples=100):
    """
    Generate synthetic data for a crop based on typical parameters
    
    Args:
        crop_name: Name of the crop
        crop_params: Dictionary with parameter ranges
        samples: Number of samples to generate
        
    Returns:
        DataFrame with synthetic crop data
    """
    data = []
    
    for _ in range(samples):
        record = {
            'N': np.random.uniform(*crop_params['N']),
            'P': np.random.uniform(*crop_params['P']),
            'K': np.random.uniform(*crop_params['K']),
            'temperature': np.random.uniform(*crop_params['temperature']),
            'humidity': np.random.uniform(*crop_params['humidity']),
            'ph': np.random.uniform(*crop_params['ph']),
            'rainfall': np.random.uniform(*crop_params['rainfall']),
            'label': crop_name
        }
        data.append(record)
    
    return pd.DataFrame(data)

def main():
    """Main function to add Indian crops to the dataset"""
    
    print("=" * 80)
    print("ADDING COMMON INDIAN AGRICULTURAL CROPS TO THE DATASET")
    print("=" * 80)
    
    # Load existing dataset
    csv_path = "Crop_recommendation.csv"
    print(f"\nLoading existing dataset from {csv_path}...")
    existing_df = pd.read_csv(csv_path)
    print(f"Existing dataset shape: {existing_df.shape}")
    print(f"Existing crops: {sorted(existing_df['label'].unique())}")
    
    # Generate new Indian crops data
    print("\nGenerating synthetic data for Indian crops...")
    new_crops_data = []
    
    for crop_name, crop_params in INDIAN_CROPS.items():
        print(f"  - Generating {crop_name} data (100 samples)...")
        crop_df = generate_synthetic_crop_data(crop_name, crop_params, samples=100)
        new_crops_data.append(crop_df)
    
    # Combine all new crops
    new_crops_combined = pd.concat(new_crops_data, ignore_index=True)
    print(f"\nTotal new records generated: {len(new_crops_combined)}")
    print(f"New crops: {sorted(new_crops_combined['label'].unique())}")
    
    # Combine with existing dataset
    enhanced_df = pd.concat([existing_df, new_crops_combined], ignore_index=True)
    print(f"\nEnhanced dataset shape: {enhanced_df.shape}")
    print(f"Total crops: {enhanced_df['label'].nunique()}")
    print(f"Crops distribution:\n{enhanced_df['label'].value_counts().sort_index()}")
    
    # Save enhanced dataset
    backup_path = "Crop_recommendation_backup.csv"
    if not os.path.exists(backup_path):
        existing_df.to_csv(backup_path, index=False)
        print(f"\nBackup saved to {backup_path}")
    
    enhanced_df.to_csv(csv_path, index=False)
    print(f"\nEnhanced dataset saved to {csv_path}")
    
    # Print crop categories
    print("\n" + "=" * 80)
    print("CROP CATEGORIES ADDED:")
    print("=" * 80)
    
    print("\nGRAINS/CEREALS:")
    grains = ['wheat', 'maize', 'bajra', 'ragi', 'jowar']
    for crop in grains:
        if crop in enhanced_df['label'].unique():
            print(f"  ✓ {crop}")
    
    print("\nPULSES/LEGUMES:")
    pulses = ['chickpea', 'lentil', 'pigeonpea']
    for crop in pulses:
        if crop in enhanced_df['label'].unique():
            print(f"  ✓ {crop}")
    
    print("\nVEGETABLES:")
    vegetables = ['tomato', 'onion', 'potato', 'cabbage', 'carrot', 'brinjal', 
                  'bell_pepper', 'cucumber', 'bottle_gourd', 'radish', 'spinach']
    for crop in vegetables:
        if crop in enhanced_df['label'].unique():
            print(f"  ✓ {crop}")
    
    print("\nCASH CROPS:")
    cash_crops = ['cotton', 'sugarcane', 'groundnut']
    for crop in cash_crops:
        if crop in enhanced_df['label'].unique():
            print(f"  ✓ {crop}")
    
    print("\n" + "=" * 80)
    print("✓ Dataset enhancement complete! Now run train_model.py to retrain the model")
    print("=" * 80)

if __name__ == "__main__":
    main()
