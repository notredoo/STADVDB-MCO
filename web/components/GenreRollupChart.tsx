'use client';

import { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, TooltipProps
} from 'recharts';
import { ValueType, NameType } from 'recharts/types/component/DefaultTooltipContent';
import { formatCurrency } from '@/components/CurrencyFormatter';
import { chartTheme, chartColors } from '@/components/chartTheme';

interface GenreRevenue {
    genre_name: string;
    total_revenue: number;
}

export default function GenreRollupChart() {
    const [data, setData] = useState<GenreRevenue[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            setIsLoading(true);
            try {
                const response = await fetch('/api/reports/total-revenue-by-genre');
                if (!response.ok) throw new Error(`Failed to fetch: ${response.statusText}`);
                const apiData = await response.json();

                const sortedData = apiData
                    .map((item: any) => ({
                        ...item,
                        total_revenue: Number(item.total_revenue)
                    }))
                    .sort((a: GenreRevenue, b: GenreRevenue) => b.total_revenue - a.total_revenue);

                setData(sortedData);
            } catch (e) {
                setError(e instanceof Error ? e.message : 'An unknown error occurred');
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, []);

    const CustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
        if (active && payload && payload.length) {
            return (
                <div
                    style={{
                        background: chartTheme.tooltip.background,
                        color: chartTheme.tooltip.color,
                        border: `1px solid ${chartTheme.tooltip.border}`,
                        padding: '8px 10px',
                        borderRadius: 6,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    }}
                >
                    <p style={{ fontWeight: 600, marginBottom: 4 }}>{label}</p>
                    <p style={{ color: chartColors.primary }}>
                        Revenue: {formatCurrency(payload[0].value as number)}
                    </p>
                </div>
            );
        }
        return null;
    };

    if (error) {
        return (
            <div className="flex items-center justify-center h-64 text-red-500">
                <p>Error loading chart: {error}</p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-gray-500">Loading chart data...</p>
            </div>
        );
    }

    const dynamicHeight = Math.max(300, data.length * 45 + 60);
    const yAxisWidth = 120;

    return (
        <div style={{ width: '100%', height: dynamicHeight }}>
            <ResponsiveContainer>
                <BarChart
                    layout="vertical"
                    data={data}
                    margin={{ top: 20, right: 20, left: 5, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridColor} />
                    <YAxis
                        dataKey="genre_name"
                        type="category"
                        stroke={chartTheme.axisColor}
                        tick={{ fontSize: chartTheme.fontSize, fill: chartTheme.axisColor }}
                        width={yAxisWidth}
                        padding={{ top: 0, bottom: 20 }}
                    />
                    <XAxis
                        dataKey="total_revenue"
                        type="number"
                        stroke={chartTheme.axisColor}
                        tick={{ fontSize: chartTheme.fontSize, fill: chartTheme.axisColor }}
                        tickFormatter={formatCurrency}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar
                        dataKey="total_revenue"
                        name="Total Revenue"
                        fill={chartColors.primary}
                        radius={[4, 4, 4, 4]}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
