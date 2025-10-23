'use client';

import { useState, useEffect } from 'react';
import { formatCurrency } from '@/components/CurrencyFormatter';


interface EarningsData {
    game_name: string;
    total_player_earnings: number | string;
    total_team_earnings: number | string;
}

export default function PlayerVsTeamEarningsTable() {
    const [data, setData] = useState<EarningsData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch('/api/reports/player-vs-team-earnings');
                if (!response.ok) {
                    throw new Error(`Failed to fetch: ${response.statusText}`);
                }
                const apiData = await response.json();

                const parsedData = apiData.map((row: any) => ({
                    ...row,
                    total_player_earnings: Number(row.total_player_earnings),
                    total_team_earnings: Number(row.total_team_earnings),
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

    return (
        <div>
            {isLoading && (
                <div className="flex items-center justify-center h-64">
                    <p className="text-gray-500">Loading Player vs Team Earnings data...</p>
                </div>
            )}
            {error && (
                <div className="flex items-center justify-center h-64 text-red-500">
                    <p>Error loading data: {error}</p>
                </div>
            )}
            {!isLoading && !error && data.length === 0 && (
                <div className="flex items-center justify-center h-64">
                    <p className="text-gray-500">No player vs team earnings data found.</p>
                </div>
            )}
            {!isLoading && !error && data.length > 0 && (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                            <tr>
                                <th scope="col" className="py-3.5 px-4 text-left text-sm font-semibold text-gray-900">
                                    Game
                                </th>
                                <th scope="col" className="py-3.5 px-4 text-right text-sm font-semibold text-gray-900">
                                    Total Player Earnings
                                </th>
                                <th scope="col" className="py-3.5 px-4 text-right text-sm font-semibold text-gray-900">
                                    Total Team Earnings
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {data.map((row) => (
                                <tr key={row.game_name}>
                                    <td className="whitespace-nowrap py-4 px-4 text-sm font-medium text-gray-900">
                                        {row.game_name}
                                    </td>
                                    <td className="whitespace-nowrap py-4 px-4 text-right text-sm text-gray-500">
                                        {formatCurrency(row.total_player_earnings as number)}
                                    </td>
                                    <td className="whitespace-nowrap py-4 px-4 text-right text-sm text-gray-500">
                                        {formatCurrency(row.total_team_earnings as number)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
