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
                                </div>
                                
                                <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    {t('nitrogenLabel')}
                                                </label>
                                                <input
                                                    type="number"
                                                    name="nitrogen"
                                                    value={manualData.nitrogen}
                                                    onChange={handleManualChange}
                                                    className="input-field"
                                                    placeholder="e.g., 90"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    {t('phosphorusLabel')}
                                                </label>
                                                <input
                                                    type="number"
                                                    name="phosphorus"
                                                    value={manualData.phosphorus}
                                                    onChange={handleManualChange}
                                                    className="input-field"
                                                    placeholder="e.g., 42"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    {t('potassiumLabel')}
                                                </label>
                                                <input
                                                    type="number"
                                                    name="potassium"
                                                    value={manualData.potassium}
                                                    onChange={handleManualChange}
                                                    className="input-field"
                                                    placeholder="e.g., 43"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    {t('phLabel')}
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    name="ph"
                                                    value={manualData.ph}
                                                    onChange={handleManualChange}
                                                    className="input-field"
                                                    placeholder="e.g., 6.5"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    {t('tempLabel')}
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    name="temperature"
                                                    value={manualData.temperature}
                                                    onChange={handleManualChange}
                                                    className="input-field"
                                                    placeholder="e.g., 25"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    {t('humidityLabel')}
                                                </label>
                                                <input
                                                    type="number"
                                                    name="humidity"
                                                    value={manualData.humidity}
                                                    onChange={handleManualChange}
                                                    className="input-field"
                                                    placeholder="e.g., 70"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    {t('rainfallLabel')}
                                                </label>
                                                <input
                                                    type="number"
                                                    name="rainfall"
                                                    value={manualData.rainfall}
                                                    onChange={handleManualChange}
                                                    className="input-field"
                                                    placeholder="e.g., 150"
                                                    required
                                                />
                                            </div>
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
