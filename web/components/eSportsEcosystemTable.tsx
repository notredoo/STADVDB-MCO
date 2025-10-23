'use client';

import { useState, useEffect } from 'react';
import { formatCurrency } from '@/components/CurrencyFormatter';

interface EcosystemData {
    game_name: string;
    tournament_prizes: number | string;
    player_earnings: number | string;
    team_earnings: number | string;
    total_ecosystem_value: number | string;
}

export default function EsportsEcosystemTable() {
    const [data, setData] = useState<EcosystemData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch('/api/reports/esports-ecosystem');
                if (!response.ok) {
                    throw new Error(`Failed to fetch: ${response.statusText}`);
                }
                const apiData = await response.json();

                const parsedData = apiData.map((row: any) => ({
                    ...row,
                    tournament_prizes: Number(row.tournament_prizes),
                    player_earnings: Number(row.player_earnings),
                    team_earnings: Number(row.team_earnings),
                    total_ecosystem_value: Number(row.total_ecosystem_value),
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
                    <p className="text-gray-500">Loading eSports Ecosystem data...</p>
                </div>
            )}
            {error && (
                <div className="flex items-center justify-center h-64 text-red-500">
                    <p>Error loading data: {error}</p>
                </div>
            )}
            {!isLoading && !error && data.length === 0 && (
                <div className="flex items-center justify-center h-64">
                    <p className="text-gray-500">No eSports ecosystem data found.</p>
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
                                    Tournament Prizes
                                </th>
                                <th scope="col" className="py-3.5 px-4 text-right text-sm font-semibold text-gray-900">
                                    Player Earnings
                                </th>
                                <th scope="col" className="py-3.5 px-4 text-right text-sm font-semibold text-gray-900">
                                    Team Earnings
                                </th>
                                <th scope="col" className="py-3.5 px-4 text-right text-sm font-semibold text-gray-900">
                                    Total Ecosystem Value
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
                                        {formatCurrency(row.tournament_prizes as number)}
                                    </td>
                                    <td className="whitespace-nowrap py-4 px-4 text-right text-sm text-gray-500">
                                        {formatCurrency(row.player_earnings as number)}
                                    </td>
                                    <td className="whitespace-nowrap py-4 px-4 text-right text-sm text-gray-500">
                                        {formatCurrency(row.team_earnings as number)}
                                    </td>
                                    <td className="whitespace-nowrap py-4 px-4 text-right text-sm font-semibold text-gray-700">
                                        {formatCurrency(row.total_ecosystem_value as number)}
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
