'use client';

import { useState, useEffect } from 'react';
import Select, { StylesConfig, SingleValue } from 'react-select';
import { formatCurrency } from '@/components/CurrencyFormatter';

interface DrilldownData {
    game_name: string;
    total_revenue: number;
}

interface GenreOption {
    value: string;
    label: string;
}

const customSelectStyles: StylesConfig<GenreOption, false> = {
    control: (provided) => ({
        ...provided,
        fontFamily: 'Inter, sans-serif',
        borderColor: '#D1D5DB',
        boxShadow: 'none',
        '&:hover': { borderColor: '#9CA3AF' },
    }),
    option: (provided, state) => ({
        ...provided,
        fontFamily: 'Inter, sans-serif',
        backgroundColor: state.isSelected ? '#4F46E5' : state.isFocused ? '#E0E7FF' : 'white',
        color: state.isSelected ? 'white' : state.isFocused ? '#1F2937' : '#374151',
        '&:active': { backgroundColor: '#4338CA', color: 'white' },
        paddingTop: '8px', paddingBottom: '8px',
    }),
    placeholder: (provided) => ({ ...provided, fontFamily: 'Inter, sans-serif', color: '#6B7280' }),
    singleValue: (provided) => ({ ...provided, fontFamily: 'Inter, sans-serif', color: '#1F2937' }),
    menu: (provided) => ({ ...provided, marginTop: '4px', borderRadius: '6px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }),
};

export default function GenreDrilldownTable() {
    const [data, setData] = useState<DrilldownData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [availableGenres, setAvailableGenres] = useState<GenreOption[]>([]);
    const [isGenresLoading, setIsGenresLoading] = useState(true);
    const [selectedGenre, setSelectedGenre] = useState<GenreOption | null>(null);

    useEffect(() => {
        async function fetchAvailableGenres() {
            setIsGenresLoading(true);
            try {
                const response = await fetch('/api/reports/available-genres-for-revenue');
                if (!response.ok) throw new Error(`Failed to fetch genres: ${response.statusText}`);
                const genresData: string[] = await response.json();
                const genreOptions = genresData.map(genre => ({ value: genre, label: genre }));
                setAvailableGenres(genreOptions);
                if (genreOptions.length > 0) {
                    setSelectedGenre(genreOptions[0]);
                }
            } catch (e) {
                console.error("Failed to fetch available genres:", e);
                setError("Could not load genre filter.");
            } finally {
                setIsGenresLoading(false);
            }
        }
        fetchAvailableGenres();
    }, []);

    useEffect(() => {
        if (!selectedGenre) {
            setData([]);
            setIsLoading(false);
            return;
        }

        async function fetchData() {
            setIsLoading(true);
            setError(null);

            try {
                if (selectedGenre) {
                    const apiUrl = `/api/reports/total-revenue-by-game-per-genre?genre=${encodeURIComponent(selectedGenre.value)}`;

                    const response = await fetch(apiUrl);
                    if (!response.ok) throw new Error(`Failed to fetch drilldown: ${response.statusText}`);
                    const apiData = await response.json();

                    const parsedData = apiData.map((row: any) => ({
                        ...row,
                        total_revenue: Number(row.total_revenue),
                    }));
                    setData(parsedData);
                }
            } catch (e) {
                setError(e instanceof Error ? e.message : 'An unknown error occurred');
            } finally {
                setIsLoading(false);
            }
        }

        fetchData();
    }, [selectedGenre]);

    const handleGenreChange = (selectedOption: SingleValue<GenreOption>) => {
        setSelectedGenre(selectedOption);
    };

    return (
        <div>
            {/* --- Filter Dropdown --- */}
            <div className="mb-4">
                <label htmlFor="genre-select" className="font-semibold text-gray-700 block mb-2">Select Genre:</label>
                {isGenresLoading ? (
                    <p className="text-gray-500 text-sm">Loading genres...</p>
                ) : (
                    <Select<GenreOption, false>
                        instanceId="genre-select"
                        options={availableGenres}
                        value={selectedGenre}
                        onChange={handleGenreChange}
                        styles={customSelectStyles}
                        placeholder="Select a genre to drill down..."
                        isClearable
                    />
                )}
            </div>

            {/* --- Loading State for Table --- */}
            {isLoading && (
                <div className="flex items-center justify-center h-48">
                    <p className="text-gray-500">Loading game data for {selectedGenre?.label}...</p>
                </div>
            )}

            {/* --- Error State for Table --- */}
            {error && !isLoading && (
                <div className="flex items-center justify-center h-48 text-red-500">
                    <p>Error loading table: {error}</p>
                </div>
            )}

            {/* --- Initial / No Selection State --- */}
            {!isLoading && !error && !selectedGenre && (
                <div className="flex items-center justify-center h-48">
                    <p className="text-gray-400">Please select a genre above.</p>
                </div>
            )}

            {/* --- No Data State for Table --- */}
            {!isLoading && !error && selectedGenre && data.length === 0 && (
                <div className="flex items-center justify-center h-48">
                    <p className="text-gray-500">No game data found for {selectedGenre.label}.</p>
                </div>
            )}


            {/* --- Data Table --- */}
            {!isLoading && !error && selectedGenre && data.length > 0 && (
                <div className="overflow-x-auto max-h-96">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100 sticky top-0">
                            <tr>
                                <th scope="col" className="py-3.5 px-4 text-left text-sm font-semibold text-gray-900">
                                    Game Name
                                </th>
                                <th scope="col" className="py-3.5 px-4 text-right text-sm font-semibold text-gray-900">
                                    Total Revenue
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {data.map((row) => (
                                <tr key={row.game_name}>
                                    <td className="whitespace-nowrap py-4 px-4 text-sm font-medium text-gray-900">
                                        {row.game_name}
                                    </td>
                                    <td className="whitespace-nowrap py-4 px-4 text-right text-sm font-semibold text-gray-700">
                                        {formatCurrency(row.total_revenue)}
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

