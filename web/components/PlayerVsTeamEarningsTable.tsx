'use client';

import { useState, useEffect } from 'react';
import { ResponsiveBar, BarDatum } from '@nivo/bar';
import { formatCurrency } from '@/components/CurrencyFormatter';
import { chartColors, chartTheme } from '@/components/chartTheme';

interface EarningsData extends BarDatum {
    game_name: string;
    total_player_earnings: number;
    total_team_earnings: number;
    percentage_difference: string;
    absolute_difference: number;
}

const formatEarningsForTooltip = (value: number) => {
    if (Math.abs(value) >= 1000000) {
        const formatted = (Math.abs(value) / 1000000).toFixed(1);
        return `$${formatted}M`;
    }
    return formatCurrency(value);
};

export default function PlayerVsTeamEarningsChartFixedTS() {
    const [data, setData] = useState<EarningsData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // --- Fetch Data ---
    useEffect(() => {
        async function fetchData() {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch('/api/reports/player-vs-team-earnings');
                if (!response.ok) throw new Error(`Failed to fetch: ${response.statusText}`);

                const apiData = await response.json();
                const parsedData: EarningsData[] = apiData.map((row: any) => ({
                    game_name: row.game_name,
                    total_player_earnings: Number(row.total_player_earnings),
                    total_team_earnings: Number(row.total_team_earnings),
                    percentage_difference: '',
                    absolute_difference: 0,
                }));

                setData(parsedData);
            } catch (e) {
                setError(e instanceof Error ? e.message : 'An unknown error occurred');
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, []);

    if (isLoading)
        return (
            <div className="flex items-center justify-center h-64" style={{ color: chartColors.text }}>
                Loading Player vs Team Earnings data...
            </div>
        );

    if (error)
        return (
            <div className="flex items-center justify-center h-64 text-red-500">
                Error loading data: {error}
            </div>
        );

    if (data.length === 0)
        return (
            <div className="flex items-center justify-center h-64" style={{ color: chartColors.text }}>
                No player vs team earnings data found.
            </div>
        );

    // --- Chart ---
    return (
        <div
            style={{
                height: 650,
                width: '100%',
                fontFamily: chartTheme.fontFamily,
                backgroundColor: chartColors.background,
                padding: '20px',
                borderRadius: '12px',
                border: `1px solid ${chartColors.grid}`,
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                color: chartColors.text,
            }}
        >
            <h2
                style={{
                    textAlign: 'center',
                    marginBottom: '30px',
                    fontSize: '1.5rem',
                    color: chartColors.text,
                    fontWeight: 600,
                }}
            >
                eSports Player vs. Team Earnings by Game
            </h2>

            <ResponsiveBar
                data={data}
                keys={['total_player_earnings', 'total_team_earnings']}
                indexBy="game_name"
                groupMode="grouped"
                layout="vertical"
                margin={{ top: 30, right: 150, bottom: 220, left: 90 }}
                padding={0.25}
                innerPadding={2}
                valueScale={{ type: 'linear' }}
                indexScale={{ type: 'band', round: true }}
                colors={[chartColors.primary, chartColors.secondary]}
                borderColor={{ from: 'color', modifiers: [['darker', 1.2]] }}
                axisTop={null}
                axisRight={null}
                axisBottom={{
                    tickSize: 0,
                    tickPadding: 10,
                    tickRotation: -40,
                    legend: 'Games',
                    legendPosition: 'middle',
                    legendOffset: 100,
                }}
                axisLeft={{
                    tickSize: 0,
                    tickPadding: 10,
                    tickRotation: 0,
                    format: (value) => formatCurrency(value as number),
                    legend: 'Total Earnings',
                    legendPosition: 'middle',
                    legendOffset: -70,
                }}
                enableLabel={false}
                tooltip={({ id, indexValue }) => {
                    const gameData = data.find((d) => d.game_name === indexValue);
                    if (!gameData) return null;

                    const { total_player_earnings, total_team_earnings, game_name } = gameData;
                    const isPlayer = id === 'total_player_earnings';
                    const isTeam = id === 'total_team_earnings';

                    let diff = 0;
                    let baseValue = 0;
                    let label = '';

                    if (isPlayer) {
                        diff = total_player_earnings - total_team_earnings;
                        baseValue = total_team_earnings;
                        label = 'Difference (Player vs Team):';
                    } else if (isTeam) {
                        diff = total_team_earnings - total_player_earnings;
                        baseValue = total_player_earnings;
                        label = 'Difference (Team vs Player):';
                    }

                    const percentage =
                        baseValue === 0
                            ? diff === 0
                                ? '(0%)'
                                : '(∞%)'
                            : `(${((diff / baseValue) * 100).toFixed(1)}%)`;

                    const diffColor = diff >= 0 ? chartColors.secondary : '#DC2626';

                    const formatDifference = (value: number) => {
                        const formatted = formatEarningsForTooltip(Math.abs(value));
                        const sign = value >= 0 ? '+' : '-';
                        return `${sign}${formatted}`;
                    };

                    return (
                        <div
                            style={{
                                background: chartColors.tooltipBg,
                                color: chartColors.tooltipText,
                                padding: '10px 14px',
                                borderRadius: '8px',
                                boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                                fontSize: '0.9rem',
                                minWidth: 240,
                            }}
                        >
                            <strong style={{ display: 'block', marginBottom: 6 }}>
                                {game_name}
                            </strong>
                            <div style={{ marginBottom: 4 }}>
                                <span style={{ color: chartColors.primary }}>Player:</span>{' '}
                                {formatEarningsForTooltip(total_player_earnings)}
                            </div>
                            <div style={{ marginBottom: 4 }}>
                                <span style={{ color: chartColors.secondary }}>Team:</span>{' '}
                                {formatEarningsForTooltip(total_team_earnings)}
                            </div>
                            <div>
                                {label}{' '}
                                <strong style={{ color: diffColor }}>
                                    {formatDifference(diff)} {percentage}
                                </strong>
                            </div>
                        </div>
                    );
                }}
                legends={[
                    {
                        dataFrom: 'keys',
                        anchor: 'right',
                        direction: 'column',
                        translateX: 140,
                        itemsSpacing: 10,
                        itemWidth: 120,
                        itemHeight: 20,
                        symbolSize: 18,
                        symbolShape: 'square',
                        itemTextColor: chartColors.text,
                        data: [
                            {
                                id: 'total_player_earnings',
                                label: 'Player Earnings',
                                color: chartColors.primary,
                            },
                            {
                                id: 'total_team_earnings',
                                label: 'Team Earnings',
                                color: chartColors.secondary,
                            },
                        ],
                    },
                ]}
                theme={{
                    textColor: chartColors.text,
                    fontSize: chartTheme.fontSize,
                    axis: {
                        ticks: { text: { fill: chartColors.text } },
                        legend: { text: { fill: chartColors.text } },
                    },
                    grid: { line: { stroke: chartColors.grid } },
                    tooltip: {
                        container: {
                            background: chartColors.tooltipBg,
                            color: chartColors.tooltipText,
                            borderRadius: '6px',
                        },
                    },
                }}
                animate
                motionConfig="gentle"
                role="application"
                ariaLabel="eSports Player vs Team Earnings Chart with Themed Colors"
            />
        </div>
    );
}
