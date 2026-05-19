/**
 * Upload Soil Report Page
 * Complete upload workflow with OCR extraction and AI prediction
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import FileUploader from '../components/upload/FileUploader';
import { FiUpload, FiCheck, FiAlertCircle } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useTranslation } from '../hooks/useTranslation';

const UploadSoilReport = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [extractedData, setExtractedData] = useState(null);
        const [extractedFields, setExtractedFields] = useState([]);
        const [missingFields, setMissingFields] = useState([]);
        
    const [manualData, setManualData] = useState({
        nitrogen: '',
        phosphorus: '',
        potassium: '',
        ph: '',
        temperature: '',
        humidity: '',
        rainfall: '',
    });
    const [useManualEntry, setUseManualEntry] = useState(false);
    const [step, setStep] = useState(1); // 1: Upload, 2: Review, 3: Processing

    const handleFileSelect = (selectedFile) => {
        setFile(selectedFile);
        setExtractedData(null);
    };

    const handleUpload = async () => {
        if (!file) {
            toast.error('Please select a file');
            return;
        }

        try {
            setUploading(true);
            setUploadProgress(0);
            // We stay on step 1 while uploading OCR, just show button spinner

            const formData = new FormData();
            formData.append('soilReport', file);

            // Simulate progress for the button
            const progressInterval = setInterval(() => {
                setUploadProgress((prev) => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return 90;
                    }
                    return prev + 10;
                });
            }, 200);

            const response = await api.post('/soil/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            clearInterval(progressInterval);
            setUploadProgress(100);

            if (response.data.extractedData) {
                setExtractedData(response.data.extractedData);
                setExtractedFields(response.data.extractedFields || []);
                setMissingFields(response.data.missingFields || []);
                
                setManualData({
                    nitrogen: response.data.extractedData.nitrogen || '',
                    phosphorus: response.data.extractedData.phosphorus || '',
                    potassium: response.data.extractedData.potassium || '',
                    ph: response.data.extractedData.ph || '',
                    temperature: response.data.extractedData.temperature || '',
                    humidity: response.data.extractedData.humidity || '',
                    rainfall: response.data.extractedData.rainfall || '',
                });
                toast.success('File processed. Please review the extracted data.');
                setUseManualEntry(true);
                setStep(2);
            } else if (response.data.reportId) {
                toast.success('File uploaded successfully!');
                setTimeout(() => {
                    navigate(`/analysis/${response.data.reportId}`);
                }, 1500);
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error(error.response?.data?.message || 'Upload failed');
            setStep(1);
        } finally {
            setUploading(false);
        }
    };

    const handleManualSubmit = async () => {
        try {
            // Validate required fields
            const requiredFields = ['nitrogen', 'phosphorus', 'potassium', 'ph'];
            const missingRequired = requiredFields.filter(field => manualData[field] === '' || manualData[field] === null);
            
            if (missingRequired.length > 0) {
                toast.error(`Please fill in all required fields: ${missingRequired.join(', ')}`);
                return;
            }
            
            setUploading(true);
            setStep(3);

            const response = await api.post('/soil/manual', manualData);

            toast.success('Soil data submitted successfully!');
            setTimeout(() => {
                if (response.data.reportId) {
                    navigate(`/analysis/${response.data.reportId}`);
                }
            }, 1500);
        } catch (error) {
            console.error('Submit error:', error);
            toast.error(error.response?.data?.message || 'Submission failed');
            setStep(2);
        } finally {
            setUploading(false);
        }
    };

    const handleManualChange = (e) => {
        setManualData({
            ...manualData,
            [e.target.name]: e.target.value,
        });
    };

    const FieldInput = ({ label, name, placeholder, step }) => {
        const isExtracted = extractedFields.includes(name === 'nitrogen' ? 'N' : name === 'phosphorus' ? 'P' : name === 'potassium' ? 'K' : name);
        const isMissing = missingFields.includes(name === 'nitrogen' ? 'N' : name === 'phosphorus' ? 'P' : name === 'potassium' ? 'K' : name);

        return (
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center justify-between">
                    <span>{label}</span>
                    {isExtracted && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Extracted</span>
                    )}
                    {isMissing && manualData[name] === '' && (
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded">Required</span>
                    )}
                </label>
                <input
                    type="number"
                    step={step}
                    name={name}
                    value={manualData[name]}
                    onChange={handleManualChange}
                    className={`input-field ${isMissing && manualData[name] === '' ? 'border-amber-300' : ''}`}
                    placeholder={placeholder}
                    required
                />
            </div>
        );
    };

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {t('uploadSoilReportTitle')}
                    </h1>
                    <p className="text-gray-600">
                        {t('uploadSoilReportDesc')}
                    </p>
                </div>

                {/* Progress Steps */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        {[
                            { num: 1, label: t('uploadStep') },
                            { num: 2, label: t('reviewStep') },
                            { num: 3, label: t('analysisStep') },
                        ].map((s, index) => (
                            <div key={s.num} className="flex items-center flex-1">
                                <div className="flex items-center">
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${step >= s.num
                                                ? 'bg-primary-600 text-white'
                                                : 'bg-gray-200 text-gray-600'
                                            }`}
                                    >
                                        {step > s.num ? <FiCheck /> : s.num}
                                    </div>
                                    <span
                                        className={`ml-2 font-medium ${step >= s.num ? 'text-gray-900' : 'text-gray-500'
                                            }`}
                                    >
                                        {s.label}
                                    </span>
                                </div>
                                {index < 2 && (
                                    <div
                                        className={`flex-1 h-1 mx-4 ${step > s.num ? 'bg-primary-600' : 'bg-gray-200'
                                            }`}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Content */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="upload"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <div className="flex justify-end mb-4">
                                    <button
                                        onClick={() => setStep(2)}
                                        className="text-primary-600 font-medium hover:underline text-sm"
                                    >
                                        {t('skipUpload')}
                                    </button>
                                </div>
                                
                                <FileUploader
                                    onFileSelect={handleFileSelect}
                                    acceptedTypes={{
                                        'application/pdf': ['.pdf'],
                                        'image/*': ['.png', '.jpg', '.jpeg'],
                                    }}
                                    maxSize={10485760}
                                />

                                {file && (
                                    <div className="mt-6 flex justify-end">
                                        <button
                                            onClick={handleUpload}
                                            disabled={uploading}
                                            className="btn-primary flex items-center space-x-2"
                                        >
                                            <FiUpload />
                                            <span>
                                                {uploading ? t('extractingData').replace('{progress}', uploadProgress) : t('uploadAndExtract')}
                                            </span>
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="review"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-gray-800">{t('reviewSoilData')}</h3>
                                    <p className="text-sm text-gray-500 mt-1">{t('reviewSoilDataDesc')}</p>
                                    
                                    {/* Extraction Summary */}
                                    {useManualEntry && (extractedFields.length > 0 || missingFields.length > 0) && (
                                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                            <div className="text-sm">
                                                <p className="font-medium text-blue-900">
                                                    ✓ Extracted {extractedFields.length} fields: {extractedFields.join(', ')}
                                                </p>
                                                {missingFields.length > 0 && (
                                                    <p className="text-amber-700 mt-1">
                                                        ⚠ Missing {missingFields.length} fields: {missingFields.join(', ')} - Please enter values
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <FieldInput label={t('nitrogenLabel')} name="nitrogen" placeholder="e.g., 90" />
                                                <FieldInput label={t('phosphorusLabel')} name="phosphorus" placeholder="e.g., 42" />
                                                <FieldInput label={t('potassiumLabel')} name="potassium" placeholder="e.g., 43" />
                                                <FieldInput label={t('phLabel')} name="ph" placeholder="e.g., 6.5" step="0.1" />
                                                <FieldInput label={t('tempLabel')} name="temperature" placeholder="e.g., 25" step="0.1" />
                                                <FieldInput label={t('humidityLabel')} name="humidity" placeholder="e.g., 70" />
                                                <FieldInput label={t('rainfallLabel')} name="rainfall" placeholder="e.g., 150" />
                                        </div>

                                        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
                                            <button
                                                onClick={() => setStep(1)}
                                                className="text-gray-500 hover:text-gray-800 font-medium text-sm"
                                            >
                                                {t('backToUpload')}
                                            </button>
                                            <button
                                                onClick={handleManualSubmit}
                                                disabled={uploading}
                                                className="btn-primary"
                                            >
                                                {t('submitAndAnalyze')}
                                            </button>
                                        </div>
                                    </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div
                                key="processing"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="text-center py-12"
                            >
                                <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <FiUpload className="w-10 h-10 text-primary-600 animate-pulse" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    {t('processingReport')}
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    {t('extractingSoilData')}
                                </p>

                                {/* Progress Bar */}
                                <div className="max-w-md mx-auto">
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <motion.div
                                            className="bg-primary-600 h-2 rounded-full"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${uploadProgress}%` }}
                                            transition={{ duration: 0.3 }}
                                        />
                                    </div>
                                    <p className="text-sm text-gray-500 mt-2">
                                        {t('completeStr').replace('{progress}', uploadProgress)}
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default UploadSoilReport;
