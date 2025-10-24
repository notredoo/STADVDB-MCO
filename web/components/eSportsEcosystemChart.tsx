'use client';

import { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, TooltipProps
} from 'recharts';
import { ValueType, NameType } from 'recharts/types/component/DefaultTooltipContent';
import { formatCurrency } from '@/components/CurrencyFormatter';
import { chartTheme, chartColors } from '@/components/chartTheme'; // ✅ Import theme

interface EcosystemData {
    game_name: string;
    tournament_prizes: number;
    player_earnings: number;
    team_earnings: number;
    total_ecosystem_value: number;
}

// ✅ Custom Tooltip with consistent theme styling
const CustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
    if (active && payload && payload.length) {
        const totalValue = payload.reduce((sum: number, entry) => sum + (entry.value as number), 0);

        return (
            <div
                style={{
                    background: chartTheme.tooltip.background,
                    color: chartTheme.tooltip.color,
                    border: `1px solid ${chartTheme.tooltip.border}`,
                    padding: '8px 10px',
                    borderRadius: 6,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    fontSize: 13,
                }}
            >
                <p style={{ fontWeight: 600, marginBottom: 4 }}>{label}</p>

                {payload.map((entry, index) => (
                    <p key={index} className="flex justify-between items-center" style={{ color: entry.color }}>
                        <span className="font-medium mr-2">{entry.name}:</span>
                        <span className="font-semibold">{formatCurrency(entry.value as number)}</span>
                    </p>
                ))}

                <p
                    style={{
                        marginTop: 6,
                        paddingTop: 6,
                        borderTop: `1px solid ${chartTheme.tooltip.border}`,
                        fontWeight: 600,
                        color: chartColors.text,
                    }}
                >
                    Total: {formatCurrency(totalValue)}
                </p>
            </div>
        );
    }
    return null;
};

export default function EsportsEcosystemChart() {
    const [data, setData] = useState<EcosystemData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            setIsLoading(true);
            try {
                const response = await fetch('/api/reports/esports-ecosystem');
                if (!response.ok) throw new Error(`Failed to fetch: ${response.statusText}`);
                const apiData = await response.json();

                const formattedData = apiData
                    .map((item: any) => ({
                        game_name: item.game_name,
                        tournament_prizes: Number(item.tournament_prizes),
                        player_earnings: Number(item.player_earnings),
                        team_earnings: Number(item.team_earnings),
                        total_ecosystem_value: Number(item.total_ecosystem_value),
                    }))
                    .filter((item: EcosystemData) => item.total_ecosystem_value > 0);

                setData(formattedData);
            } catch (e) {
                setError(e instanceof Error ? e.message : 'An unknown error occurred');
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, []);

    if (error) {
        return (
            <div className="flex items-center justify-center h-full text-red-500 min-h-[350px]">
                <p>Error loading chart: {error}</p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[350px]">
                <p className="text-gray-500">Loading eSports data...</p>
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="flex items-center justify-center h-full min-h-[350px]">
                <p className="text-gray-500">No eSports ecosystem data available.</p>
            </div>
        );
    }

    const dynamicHeight = Math.max(350, data.length * 60 + 80);

    return (
        <div style={{ width: '100%', height: dynamicHeight }}>
            <ResponsiveContainer>
                <BarChart
                    layout="vertical"
                    data={data}
                    margin={{ top: 10, right: 30, left: 10, bottom: 20 }}
                >
                    {/* ✅ Apply theme colors to grid, axes, and labels */}
                    <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridColor} />
                    <YAxis
                        dataKey="game_name"
                        type="category"
                        stroke={chartTheme.axisColor}
                        tick={{ fontSize: chartTheme.fontSize, fill: chartTheme.axisColor }}
                        width={120}
                        padding={{ top: 10, bottom: 10 }}
                    />
                    <XAxis
                        dataKey="total_ecosystem_value"
                        type="number"
                        stroke={chartTheme.axisColor}
                        tickFormatter={formatCurrency}
                        tick={{ fontSize: chartTheme.fontSize, fill: chartTheme.axisColor }}
                    />

                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                        layout="horizontal"
                        verticalAlign="top"
                        align="center"
                        wrapperStyle={{ top: 0, left: 0, right: 0, height: 40 }}
                    />

                    {/* ✅ Use consistent chart colors */}
                    <Bar dataKey="tournament_prizes" name="Tournament Prizes" stackId="a" fill={chartColors.primary} />
                    <Bar dataKey="player_earnings" name="Player Earnings" stackId="a" fill={chartColors.secondary} />
                    <Bar dataKey="team_earnings" name="Team Earnings" stackId="a" fill={chartColors.accent} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
