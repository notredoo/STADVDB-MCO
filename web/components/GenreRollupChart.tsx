'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, TooltipProps } from 'recharts';
import { ValueType, NameType } from 'recharts/types/component/DefaultTooltipContent';
import { formatCurrency } from '@/components/CurrencyFormatter';
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
                if (!response.ok) {
                    throw new Error(`Failed to fetch: ${response.statusText}`);
                }
                const apiData = await response.json();

                const formattedData = apiData.map((item: any) => ({
                    ...item,
                    total_revenue: Number(item.total_revenue)
                }));

                setData(formattedData);
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
                <div className="bg-white p-2 border border-gray-300 rounded shadow-lg">
                    <p className="font-bold text-gray-800">{`${label}`}</p>
                    <p className="text-indigo-600">{`Revenue: ${formatCurrency(payload[0].value as number)}`}</p>
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


    return (
        <div style={{ width: '100%', height: 350 }}>
            <ResponsiveContainer>
                <BarChart
                    data={data}
                    margin={{
                        top: 5,
                        right: 0,
                        left: 20,
                        bottom: 70,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />

                    {/* Angled X-Axis Labels */}
                    <XAxis
                        dataKey="genre_name"
                        stroke="#333"
                        interval={0}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        tick={{ fontSize: 12 }}
                    />

                    <YAxis
                        stroke="#333"
                        tickFormatter={formatCurrency}
                        tick={{ fontSize: 12 }}
                    />

                    <Tooltip content={<CustomTooltip />} />

                    <Legend />
                    <Bar
                        dataKey="total_revenue"
                        name="Total Revenue"
                        fill="#4F46E5"
                        radius={[4, 4, 0, 0]}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

