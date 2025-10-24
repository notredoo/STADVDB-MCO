'use client';

import { useState, useEffect } from 'react';
import Select, { StylesConfig, SingleValue } from 'react-select';
import { formatCurrency } from '@/components/CurrencyFormatter';
import { chartColors, chartTheme } from '@/components/chartTheme';

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
        borderColor: chartColors.grid,
        boxShadow: 'none',
        '&:hover': { borderColor: chartColors.primary },
    }),
    option: (provided, state) => ({
        ...provided,
        fontFamily: 'Inter, sans-serif',
        backgroundColor: state.isSelected
            ? chartColors.primary
            : state.isFocused
                ? '#EFF6FF'
                : chartColors.background,
        color: state.isSelected ? '#ffffff' : chartColors.text,
        '&:active': { backgroundColor: chartColors.secondary, color: '#ffffff' },
        paddingTop: '8px',
        paddingBottom: '8px',
    }),
    placeholder: (provided) => ({
        ...provided,
        color: '#6B7280',
        fontFamily: 'Inter, sans-serif',
    }),
    singleValue: (provided) => ({
        ...provided,
        color: chartColors.text,
        fontFamily: 'Inter, sans-serif',
    }),
    menu: (provided) => ({
        ...provided,
        backgroundColor: chartColors.background,
        borderRadius: '6px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    }),
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
                if (genreOptions.length > 0) setSelectedGenre(genreOptions[0]);
            } catch {
                setError('Could not load genre filter.');
            } finally {
                setIsGenresLoading(false);
            }
        }
        fetchAvailableGenres();
    }, []);

    useEffect(() => {
        if (!selectedGenre) {
            setData([]);
            return;
        }

        async function fetchData() {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch(`/api/reports/total-revenue-by-game-per-genre?genre=${encodeURIComponent(selectedGenre.value)}`);
                if (!response.ok) throw new Error(`Failed to fetch drilldown: ${response.statusText}`);
                const apiData = await response.json();
                const parsedData = apiData.map((row: any) => ({
                    ...row,
                    total_revenue: Number(row.total_revenue),
                }));
                setData(parsedData);
            } catch (e) {
                setError(e instanceof Error ? e.message : 'An unknown error occurred');
            } finally {
                setIsLoading(false);
            }
        }

        fetchData();
    }, [selectedGenre]);

    const handleGenreChange = (selectedOption: SingleValue<GenreOption>) => setSelectedGenre(selectedOption);

    return (
        <div
            className="p-4 rounded-lg border shadow-sm"
            style={{
                backgroundColor: chartColors.background,
                borderColor: chartColors.grid,
                color: chartColors.text,
                fontFamily: 'Inter, sans-serif',
                fontSize: chartTheme.fontSize,
            }}
        >
            {/* --- Filter Dropdown --- */}
            <div className="mb-4">
                <label
                    htmlFor="genre-select"
                    className="font-semibold block mb-2"
                    style={{ color: chartColors.text }}
                >
                    Select Genre:
                </label>
                {isGenresLoading ? (
                    <p style={{ color: chartColors.text }}>Loading genres...</p>
                ) : (
                    <Select
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

            {/* --- Scrollable Table --- */}
            {!isLoading && !error && selectedGenre && data.length > 0 && (
                <div
                    className="overflow-y-auto overflow-x-auto rounded-lg"
                    style={{
                        border: `1px solid ${chartColors.grid}`,
                        maxHeight: '24rem', // scroll area restored
                    }}
                >
                    <table className="min-w-full divide-y" style={{ borderColor: chartColors.grid }}>
                        <thead
                            style={{
                                backgroundColor: '#F9FAFB',
                                color: chartColors.text,
                                position: 'sticky',
                                top: 0,
                                zIndex: 10,
                            }}
                        >
                            <tr>
                                <th className="py-3.5 px-4 text-left text-sm font-semibold">
                                    Game Name
                                </th>
                                <th className="py-3.5 px-4 text-right text-sm font-semibold">
                                    Total Revenue
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y" style={{ borderColor: chartColors.grid }}>
                            {data.map((row) => (
                                <tr key={row.game_name}>
                                    <td className="py-4 px-4 text-sm font-medium">
                                        {row.game_name}
                                    </td>
                                    <td
                                        className="py-4 px-4 text-right text-sm font-semibold"
                                        style={{ color: chartColors.primary }}
                                    >
                                        {formatCurrency(row.total_revenue)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* --- States --- */}
            {isLoading && (
                <p className="text-center py-6" style={{ color: chartColors.text }}>
                    Loading game data for {selectedGenre?.label}...
                </p>
            )}
            {error && !isLoading && (
                <p className="text-center py-6 text-red-500">Error loading table: {error}</p>
            )}
            {!isLoading && !error && !selectedGenre && (
                <p className="text-center py-6 text-gray-500">Please select a genre above.</p>
            )}
            {!isLoading && !error && selectedGenre && data.length === 0 && (
                <p className="text-center py-6 text-gray-500">
                    No game data found for {selectedGenre.label}.
                </p>
            )}
        </div>
    );
}
