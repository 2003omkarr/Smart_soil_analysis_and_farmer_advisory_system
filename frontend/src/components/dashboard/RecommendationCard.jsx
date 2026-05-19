/**
 * Recommendation Card Component
 * Displays crop and fertilizer recommendations
 */

import { motion } from 'framer-motion';
import { FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { useTranslation } from '../../hooks/useTranslation';

const RecommendationCard = ({ recommendation, type = 'crop' }) => {
    const { t, translateCrop } = useTranslation();
    
    if (!recommendation) {
        return null;
    }

    const getConfidenceColor = (confidence) => {
        if (confidence >= 80) return 'text-green-600 bg-green-50';
        if (confidence >= 60) return 'text-yellow-600 bg-yellow-50';
        return 'text-red-600 bg-red-50';
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm p-6"
        >
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {type === 'crop' ? t('recommendedCrop') : t('fertilizerRecommendations')}
                    </h3>
                    <p className="text-sm text-gray-500">
                        {t('bestMatchForSoil')}
                    </p>
                </div>
                {recommendation.confidence && (
                    <div
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getConfidenceColor(
                            recommendation.confidence
                        )}`}
                    >
                        {recommendation.confidence}% {t('confidence')}
                    </div>
                )}
            </div>

            {type === 'crop' ? (
                <div>
                    <div className="flex items-center space-x-3 mb-3">
                        <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                            <span className="text-2xl">🌾</span>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">
                                {translateCrop(recommendation.crop) || recommendation.crop || 'Unknown crop'}
                            </p>
                            <p className="text-sm text-gray-500">{t('bestSuitedForSoil')}</p>
                        </div>
                    </div>

                    {recommendation.explanation && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-700">{recommendation.explanation}</p>
                        </div>
                    )}

                    {recommendation.alternatives && recommendation.alternatives.length > 0 && (
                        <div className="mt-4">
                            <p className="text-sm font-medium text-gray-700 mb-2">
                                {t('alternativeCrops')}:
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {recommendation.alternatives.map((alt, index) => (
                                    <span
                                        key={index}
                                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                                    >
                                        {translateCrop(alt.crop || alt) || alt.crop || alt || 'Unknown crop'}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div>
                    {recommendation.primaryFertilizers &&
                        recommendation.primaryFertilizers.length > 0 && (
                            <div className="space-y-3">
                                {recommendation.primaryFertilizers.map((fertilizer, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                    >
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {fertilizer.fertilizer}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {fertilizer.type === 'organic'
                                                    ? `🌱 ${t('organic')}`
                                                    : `⚗️ ${t('synthetic')}`}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-gray-900">
                                                {fertilizer.quantity_kg} kg
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {fertilizer.quantity_bags} bags
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                    {recommendation.explanation && (
                        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                            <div className="flex items-start space-x-2">
                                <FiAlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                                <p className="text-sm text-blue-900">
                                    {recommendation.explanation}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </motion.div>
    );
};

export default RecommendationCard;
