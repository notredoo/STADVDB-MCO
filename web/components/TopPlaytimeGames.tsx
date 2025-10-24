'use client';

import { useState, useEffect, useCallback } from 'react';
import Select, { StylesConfig, SingleValue } from 'react-select';
import { ResponsiveCirclePacking } from '@nivo/circle-packing';
import { chartTheme, chartColors } from '@/components/chartTheme';

const ALL_OPTION: SelectOption = { value: 'ALL', label: 'All' };

// --- Interfaces ---
interface SelectOption {
    value: string;
    label: string;
}

interface GamePlaytimeData {
    game_name: string;
    genre_name: string;
    platform_name: string;
    average_playtime: number;
}

interface NivoDataNode {
    name: string;
    children?: NivoDataNode[];
    loc?: number;
    color?: string;
}

// --- Select Dropdown Theme ---
const customSelectStyles: StylesConfig<SelectOption, false> = {
    control: (provided) => ({
        ...provided,
        fontFamily: 'Inter, sans-serif',
        borderColor: chartColors.grid,
        boxShadow: 'none',
        '&:hover': { borderColor: chartColors.primary },
        minHeight: '38px',
        height: '38px',
    }),
    option: (provided, state) => ({
        ...provided,
        fontFamily: 'Inter, sans-serif',
        backgroundColor: state.isSelected
            ? chartColors.primary
            : state.isFocused
                ? `${chartColors.primary}20`
                : chartColors.background,
        color: state.isSelected
            ? chartColors.background
            : chartColors.text,
        '&:active': { backgroundColor: chartColors.primary, color: chartColors.background },
        paddingTop: '8px',
        paddingBottom: '8px',
    }),
    placeholder: (provided) => ({ ...provided, color: chartColors.text }),
};

// --- Utility ---
const formatPlaytime = (minutesInput: number | string | null | undefined): string => {
    const minutes = Number(minutesInput);
    if (isNaN(minutes) || minutes <= 0) return '-';
    const hours = minutes / 60;
    return hours >= 10 ? `${hours.toFixed(0)} hrs` : `${hours.toFixed(1)} hrs`;
};

// --- Data Transformation ---
const transformToNivoData = (data: GamePlaytimeData[]): NivoDataNode => {
    const root: NivoDataNode = { name: 'Games', children: [] };
    const genreMap: { [key: string]: NivoDataNode } = {};

    data.forEach(game => {
        const genreName = game.genre_name || 'Uncategorized';
        if (game.average_playtime <= 0) return;

        if (!genreMap[genreName]) {
            genreMap[genreName] = { name: genreName, children: [] };
            root.children!.push(genreMap[genreName]);
        }

        genreMap[genreName].children!.push({
            name: game.game_name,
            loc: game.average_playtime,
        });
    });

    return root;
};

// --- Custom Label for Circles ---
const getLabel = (node: any) => {
    if (node.depth !== 2) return null;
    const MIN_RADIUS_THRESHOLD = 30;
    if (node.radius < MIN_RADIUS_THRESHOLD) return null;

    const playtime = formatPlaytime(node.data.loc);
    const nameParts = node.id.split(' ');
    const textColor = chartColors.text;

    return (
        <g transform={`translate(0, -5)`}>
            <text textAnchor="middle" fontSize="11px" fontWeight="bold" style={{ fill: textColor }}>
                {nameParts[0]}
            </text>
            {nameParts.length > 1 && (
                <text textAnchor="middle" y={13} fontSize="9px" style={{ fill: textColor }}>
                    {nameParts.slice(1).join(' ')}
                </text>
            )}
            <text textAnchor="middle" y={28} fontSize="10px" style={{ fill: chartColors.secondary }}>
                {playtime}
            </text>
        </g>
    );
};

// --- Main Component ---
export default function TopPlaytimeGames() {
    const [data, setData] = useState<GamePlaytimeData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [availableGenres, setAvailableGenres] = useState<SelectOption[]>([]);
    const [availablePlatforms, setAvailablePlatforms] = useState<SelectOption[]>([]);
    const [filtersLoading, setFiltersLoading] = useState(true);

    const [selectedGenre, setSelectedGenre] = useState<SingleValue<SelectOption>>(null);
    const [selectedPlatform, setSelectedPlatform] = useState<SingleValue<SelectOption>>(null);

    // --- Fetch Genre & Platform Filters ---
    useEffect(() => {
        async function fetchOptions() {
            setFiltersLoading(true);
            try {
                const [genresRes, platformsRes] = await Promise.all([
                    fetch('/api/reports/available-genres'),
                    fetch('/api/reports/available-platforms'),
                ]);

                if (!genresRes.ok || !platformsRes.ok) throw new Error('Failed to fetch filter options');

                const genresData = await genresRes.json();
                const platformsData = await platformsRes.json();

                setAvailableGenres([ALL_OPTION, ...genresData.map((g: string) => ({ value: g, label: g }))]);
                setAvailablePlatforms([ALL_OPTION, ...platformsData.map((p: string) => ({ value: p, label: p }))]);
                setSelectedGenre(ALL_OPTION);
                setSelectedPlatform(ALL_OPTION);
            } catch {
                setError("Could not load filters.");
            } finally {
                setFiltersLoading(false);
            }
        }
        fetchOptions();
    }, []);

    // --- Fetch Chart Data ---
    const fetchData = useCallback(async () => {
        if (!selectedGenre || !selectedPlatform) return setData([]);

        setIsLoading(true);
        setError(null);
        const queryParams = new URLSearchParams({
            genre: selectedGenre.value,
            platform: selectedPlatform.value,
        }).toString();

        try {
            const response = await fetch(`/api/reports/top-playtime-games?${queryParams}`);
            if (!response.ok) throw new Error(`Failed to fetch data: ${response.statusText}`);

            const apiData: GamePlaytimeData[] = await response.json();
            const parsedData = apiData
                .map(item => ({ ...item, average_playtime: Number(item.average_playtime) || 0 }))
                .filter(d => d.average_playtime > 0);

            setData(parsedData);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [selectedGenre, selectedPlatform]);

    useEffect(() => {
        if (!filtersLoading && selectedGenre && selectedPlatform) fetchData();
    }, [fetchData, filtersLoading, selectedGenre, selectedPlatform]);

    const nivoData = transformToNivoData(data);
    const hasData = data.length > 0;

    const ManualLegend = () => (
        <div
            className="flex justify-center items-center space-x-6"
            style={{
                color: chartColors.text,
                marginTop: 15,
                position: 'relative',
            }}
        >
            {/* Item 1: Genre */}
            <div className="flex items-center">
                <div
                    style={{
                        width: 16,
                        height: 16,
                        backgroundColor: chartColors.secondary,
                        borderRadius: '50%',
                        marginRight: 8,
                        border: `1px solid ${chartColors.grid}`
                    }}
                />
                <span>Genre</span>
            </div>

            {/* Item 2: Game */}
            <div className="flex items-center">
                <div
                    style={{
                        width: 16,
                        height: 16,
                        backgroundColor: chartColors.accent,
                        borderRadius: '50%',
                        marginRight: 8,
                        border: `1px solid ${chartColors.grid}`
                    }}
                />
                <span>Game</span>
            </div>
        </div>
    );

    // --- Render ---
    return (
        <div className="p-4 bg-white shadow-lg rounded-lg">
            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                <div>
                    <label className="font-semibold text-sm" style={{ color: chartColors.text }}>Genre:</label>
                    <Select options={availableGenres} value={selectedGenre} onChange={setSelectedGenre}
                        styles={customSelectStyles} isLoading={filtersLoading} isDisabled={filtersLoading} />
                </div>
                <div>
                    <label className="font-semibold text-sm" style={{ color: chartColors.text }}>Platform:</label>
                    <Select options={availablePlatforms} value={selectedPlatform} onChange={setSelectedPlatform}
                        styles={customSelectStyles} isLoading={filtersLoading} isDisabled={filtersLoading} />
                </div>
            </div>

            <div style={{ height: 600, width: '100%', overflowY: 'auto' }}>
                {isLoading && <p className="text-gray-500 text-center">Loading top games...</p>}
                {error && <p className="text-red-500 text-center">Error: {error}</p>}
                {!isLoading && !error && !hasData && (
                    <p className="text-gray-500 text-center">No games found for selected filters.</p>
                )}

                {!isLoading && !error && hasData && (
                    <>
                        <ResponsiveCirclePacking
                            data={nivoData}
                            id="name"
                            value="loc"
                            enableLabel
                            padding={4}
                            margin={{ top: 60, right: 20, bottom: 20, left: 20 }}
                            colors={[chartColors.primary, chartColors.secondary, chartColors.accent]}
                            borderWidth={2}
                            borderColor={{ from: 'color', modifiers: [['darker', 0.6]] }}
                            label={getLabel}
                            labelsFilter={(label) => label.node.depth === 2}
                            tooltip={({ id, value, depth }) => {
                                const tooltipStyle = {
                                    padding: '10px 15px',
                                    background: chartTheme.tooltip.background,
                                    color: chartTheme.tooltip.color,
                                    border: `1px solid ${chartTheme.tooltip.border}`,
                                    borderRadius: '6px',
                                    boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                                    fontSize: chartTheme.fontSize,
                                };

                                if (depth < 2) {
                                    if (id === "Games") { // Big blue circle
                                        return (
                                            <div style={tooltipStyle}>
                                                <strong style={{ color: chartColors.primary }}>{id}</strong>
                                            </div>
                                        );
                                    }

                                    return ( // Genres
                                        <div style={tooltipStyle}>
                                            <strong >Genre: </strong><strong style={{ color: chartColors.primary }}>{id}</strong>
                                        </div>
                                    );
                                }

                                // Individual Games
                                const playtime = formatPlaytime(value);
                                const genre = data.find(d => d.game_name === id)?.genre_name || id;

                                return (
                                    <div style={{ ...tooltipStyle, width: '120px' }}>
                                        <strong style={{ color: chartColors.accent }}>{id}</strong>
                                        <br />
                                        <strong >Genre: </strong><strong style={{ color: chartColors.primary }}>{genre}</strong>
                                        <br />
                                        <span>Avg Playtime: </span><strong><br />{playtime}</strong>
                                    </div>
                                );
                            }} />

                        <ManualLegend />
                    </>
                )}
            </div>
        </div>
    );
}