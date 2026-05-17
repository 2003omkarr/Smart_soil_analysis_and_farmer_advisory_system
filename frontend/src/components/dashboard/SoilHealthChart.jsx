/**
 * Soil Health Chart Component
 * Displays soil health metrics using charts
 */

import {
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    ResponsiveContainer,
    Tooltip,
} from 'recharts';
import { useTranslation } from '../../hooks/useTranslation';

const SoilHealthChart = ({ data }) => {
    const { t } = useTranslation();

    // Transform data for radar chart
    const chartData = [
        { parameter: t('nitrogen'), value: data?.N || 0, fullMark: 140 },
        { parameter: t('phosphorus'), value: data?.P || 0, fullMark: 145 },
        { parameter: t('potassium'), value: data?.K || 0, fullMark: 205 },
        { parameter: t('ph'), value: (data?.ph || 0) * 10, fullMark: 140 },
        { parameter: t('humidity'), value: data?.humidity || 0, fullMark: 100 },
    ];

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {t('soilHealthParameters')}
            </h3>
            <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={chartData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="parameter" />
                    <PolarRadiusAxis angle={90} domain={[0, 'dataMax']} />
                    <Radar
                        name={t('currentValues')}
                        dataKey="value"
                        stroke="#10b981"
                        fill="#10b981"
                        fillOpacity={0.6}
                    />
                    <Tooltip />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default SoilHealthChart;
