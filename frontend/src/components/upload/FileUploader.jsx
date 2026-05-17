/**
 * File Uploader Component
 * File uploader with preview and validation (simplified version without react-dropzone)
 */

import { useState } from 'react';
import { FiUpload, FiFile, FiX, FiCheck } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const FileUploader = ({ onFileSelect, acceptedTypes = {}, maxSize = 10485760 }) => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [error, setError] = useState(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleFileChange = (selectedFile) => {
        setError(null);

        if (!selectedFile) return;

        // Validate file size
        if (selectedFile.size > maxSize) {
            setError(`File is too large. Maximum size is ${maxSize / 1024 / 1024}MB`);
            return;
        }

        // Validate file type
        const fileType = selectedFile.type;
        const fileExtension = '.' + selectedFile.name.split('.').pop().toLowerCase();

        const validExtensions = ['.pdf', '.jpg', '.jpeg', '.png'];
        const isValidType = validExtensions.includes(fileExtension) ||
            fileType.startsWith('image/') ||
            fileType === 'application/pdf';

        if (!isValidType) {
            setError('Invalid file type. Please upload PDF or image files.');
            return;
        }

        setFile(selectedFile);
        onFileSelect(selectedFile);

        // Generate preview for images
        if (selectedFile.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(selectedFile);
        } else {
            setPreview(null);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);

        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            handleFileChange(droppedFile);
        }
    };

    const handleInputChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            handleFileChange(selectedFile);
        }
    };

    const removeFile = () => {
        setFile(null);
        setPreview(null);
        setError(null);
        onFileSelect(null);
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    return (
        <div className="w-full">
            {!file ? (
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragging
                            ? 'border-primary-500 bg-primary-50'
                            : error
                                ? 'border-red-300 bg-red-50'
                                : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
                        }`}
                >
                    <input
                        type="file"
                        onChange={handleInputChange}
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                        id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                        <motion.div
                            initial={{ scale: 1 }}
                            animate={{ scale: isDragging ? 1.1 : 1 }}
                            className="flex flex-col items-center"
                        >
                            <div
                                className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isDragging
                                        ? 'bg-primary-100'
                                        : error
                                            ? 'bg-red-100'
                                            : 'bg-gray-100'
                                    }`}
                            >
                                <FiUpload
                                    className={`w-8 h-8 ${isDragging
                                            ? 'text-primary-600'
                                            : error
                                                ? 'text-red-600'
                                                : 'text-gray-600'
                                        }`}
                                />
                            </div>
                            <p className="text-lg font-medium text-gray-900 mb-2">
                                {isDragging
                                    ? 'Drop the file here'
                                    : 'Drag & drop your soil report'}
                            </p>
                            <p className="text-sm text-gray-500 mb-4">
                                or click to browse files
                            </p>
                            <p className="text-xs text-gray-400">
                                Supported formats: PDF, JPG, PNG (Max {maxSize / 1024 / 1024}MB)
                            </p>
                        </motion.div>
                    </label>
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border-2 border-green-300 bg-green-50 rounded-lg p-6"
                >
                    <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                            {preview ? (
                                <img
                                    src={preview}
                                    alt="Preview"
                                    className="w-20 h-20 object-cover rounded-lg"
                                />
                            ) : (
                                <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                                    <FiFile className="w-8 h-8 text-gray-600" />
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2 mb-1">
                                    <FiCheck className="w-5 h-5 text-green-600" />
                                    <p className="font-medium text-gray-900 truncate">
                                        {file.name}
                                    </p>
                                </div>
                                <p className="text-sm text-gray-500">
                                    {formatFileSize(file.size)}
                                </p>
                                <p className="text-xs text-green-600 mt-2">
                                    File ready for upload
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={removeFile}
                            className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                        >
                            <FiX className="w-5 h-5 text-red-600" />
                        </button>
                    </div>
                </motion.div>
            )}

            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg"
                    >
                        <p className="text-sm text-red-600">{error}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default FileUploader;
