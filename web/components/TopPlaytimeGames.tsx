'use client';

import { useState, useEffect, useCallback } from 'react';
import Select, { StylesConfig, SingleValue } from 'react-select'; // Import SingleValue type
import { formatCurrency } from '@/components/CurrencyFormatter'; // Assuming playtime uses similar formatting needs? Maybe adjust.

// --- Component Props & State ---
interface SelectOption {
    value: string;
    label: string;
}

interface GamePlaytimeData {
    game_name: string;
    genre_name: string;
    platform_name: string;
    average_playtime: number | string; // Allow string initially from API
}

// --- Custom Styles for react-select (can be shared) ---
const customSelectStyles: StylesConfig<SelectOption, false> = { // false for single select
    control: (provided) => ({
        ...provided, fontFamily: 'Inter, sans-serif', borderColor: '#D1D5DB',
        boxShadow: 'none', '&:hover': { borderColor: '#9CA3AF' }, minHeight: '38px', height: '38px',
    }),
    option: (provided, state) => ({
        ...provided, fontFamily: 'Inter, sans-serif',
        backgroundColor: state.isSelected ? '#4F46E5' : state.isFocused ? '#E0E7FF' : 'white',
        color: state.isSelected ? 'white' : state.isFocused ? '#1F2937' : '#374151',
        '&:active': { backgroundColor: '#4338CA', color: 'white' }, paddingTop: '8px', paddingBottom: '8px',
    }),
    placeholder: (provided) => ({ ...provided, fontFamily: 'Inter, sans-serif', color: '#6B7280' }),
    input: (provided) => ({ ...provided, margin: '0px' }),
    valueContainer: (provided) => ({ ...provided, height: '38px', padding: '0 6px' }),
    indicatorsContainer: (provided) => ({ ...provided, height: '38px' }),
    menu: (provided) => ({ ...provided, marginTop: '4px', borderRadius: '6px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }),
};

const formatPlaytime = (minutesInput: number | string | null | undefined): string => {
    const minutes = Number(minutesInput);

    if (isNaN(minutes) || minutes === 0) return '-';

    const hours = minutes / 60;

    return `${hours.toFixed(1)} hrs`;
};


export default function TopPlaytimeGames() {
    const [data, setData] = useState<GamePlaytimeData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [availableGenres, setAvailableGenres] = useState<SelectOption[]>([]);
    const [availablePlatforms, setAvailablePlatforms] = useState<SelectOption[]>([]);
    const [filtersLoading, setFiltersLoading] = useState(true);

    const [selectedGenre, setSelectedGenre] = useState<SingleValue<SelectOption>>(null);
    const [selectedPlatform, setSelectedPlatform] = useState<SingleValue<SelectOption>>(null);

    useEffect(() => {
        async function fetchOptions() {
            setFiltersLoading(true);
            try {
                const [genresRes, platformsRes] = await Promise.all([
                    fetch('/api/reports/available-genres'),
                    fetch('/api/reports/available-platforms'),
                ]);

                if (!genresRes.ok || !platformsRes.ok) {
                    throw new Error('Failed to fetch filter options');
                }

                const genresData: string[] = await genresRes.json();
                const platformsData: string[] = await platformsRes.json();

                setAvailableGenres(genresData.map(g => ({ value: g, label: g })));
                setAvailablePlatforms(platformsData.map(p => ({ value: p, label: p })));

                if (genresData.length > 0) setSelectedGenre({ value: genresData[0], label: genresData[0] });
                if (platformsData.length > 0) setSelectedPlatform({ value: platformsData[0], label: platformsData[0] });

            } catch (e) {
                console.error("Failed to fetch filter options:", e);
                setError("Could not load filters.");
            } finally {
                setFiltersLoading(false);
            }
        }
        fetchOptions();
    }, []);

    const fetchData = useCallback(async () => {
        if (!selectedGenre || !selectedPlatform) {
            setData([]);
            return;
        }

        setIsLoading(true);
        setError(null);

        const queryParams = new URLSearchParams({
            genre: selectedGenre.value,
            platform: selectedPlatform.value,
        }).toString();

        const apiUrl = `/api/reports/top-playtime-games?${queryParams}`;

        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error(`Failed to fetch data: ${response.statusText}`);
            }
            const apiData: GamePlaytimeData[] = await response.json();
            const parsedData = apiData.map(item => ({
                ...item,
                average_playtime: Number(item.average_playtime)
            }));
            setData(parsedData);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'An unknown error occurred fetching data.');
        } finally {
            setIsLoading(false);
        }
    }, [selectedGenre, selectedPlatform]);

    useEffect(() => {
        if (!filtersLoading && selectedGenre && selectedPlatform) {
            fetchData();
        }
        if (!filtersLoading && (!selectedGenre || !selectedPlatform)) {
            setData([]);
        }
    }, [fetchData, filtersLoading, selectedGenre, selectedPlatform]);

    return (
        <div>
            {/* --- Filter Dropdowns --- */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                <div>
                    <label htmlFor="genre-select-dice" className="font-semibold text-gray-700 block mb-1 text-sm">Genre:</label>
                    <Select<SelectOption, false>
                        instanceId="genre-select-dice"
                        options={availableGenres}
                        value={selectedGenre}
                        onChange={(option) => setSelectedGenre(option)}
                        styles={customSelectStyles}
                        placeholder="Select genre..."
                        isLoading={filtersLoading}
                        isDisabled={filtersLoading}
                    />
                </div>
                <div>
                    <label htmlFor="platform-select-dice" className="font-semibold text-gray-700 block mb-1 text-sm">Platform:</label>
                    <Select<SelectOption, false>
                        instanceId="platform-select-dice"
                        options={availablePlatforms}
                        value={selectedPlatform}
                        onChange={(option) => setSelectedPlatform(option)}
                        styles={customSelectStyles}
                        placeholder="Select platform..."
                        isLoading={filtersLoading}
                        isDisabled={filtersLoading}
                    />
                </div>
            </div>

            {/* --- Loading State for Table --- */}
            {isLoading && (
                <div className="flex items-center justify-center h-48">
                    <p className="text-gray-500">Loading top games...</p>
                </div>
            )}

            {/* --- Error State for Table --- */}
            {error && (
                <div className="flex items-center justify-center h-48 text-red-500">
                    <p>Error loading data: {error}</p>
                </div>
            )}

            {/* --- Prompt to select filters --- */}
            {/* Update prompt message */}
            {!filtersLoading && (!selectedGenre || !selectedPlatform) && !isLoading && (
                <div className="flex items-center justify-center h-48">
                    <p className="text-gray-500">Please select a Genre and Platform to see results.</p>
                </div>
            )}


            {/* --- No Data State for Table --- */}
            {/* Update condition */}
            {!isLoading && !error && data.length === 0 && selectedGenre && selectedPlatform && (
                <div className="flex items-center justify-center h-48">
                    <p className="text-gray-500">No games found matching the selected filters.</p>
                </div>
            )}

            {/* --- Data Table --- */}
            {!isLoading && !error && data.length > 0 && (
                <div className="overflow-x-auto">
                    <h3 className="text-md font-medium text-gray-600 mb-2">Top 10 Games by Average Playtime</h3>
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100"><tr>
                            <th scope="col" className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Game</th>
                            <th scope="col" className="py-3 px-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Avg Playtime</th>
                        </tr></thead>
                        <tbody className="divide-y divide-gray-200 bg-white">{
                            data.map((row, index) => (
                                <tr key={`${row.game_name}-${index}`}>
                                    <td className="whitespace-nowrap py-3 px-4 text-sm font-medium text-gray-900">{row.game_name}</td>
                                    <td className="whitespace-nowrap py-3 px-4 text-right text-sm text-gray-500">{formatPlaytime(row.average_playtime)}</td>
                                </tr>
                            ))
                        }</tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

