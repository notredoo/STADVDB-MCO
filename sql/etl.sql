CREATE TABLE stg_rawg_games (
    id TEXT,
    slug TEXT,
    name TEXT,
    metacritic TEXT,
    released TEXT,
    tba TEXT,
    updated TEXT,
    website TEXT,
    rating TEXT,
    rating_top TEXT,
    playtime TEXT,
    achievements_count TEXT,
    suggestions_count TEXT,
    game_series_count TEXT,
    reviews_count TEXT,
    platforms TEXT,
    developers TEXT,
    genres TEXT,
    publishers TEXT,
    esrb_rating TEXT
);

-- Staging table for the eSports Tournament Prize Money CSV
CREATE TABLE stg_esports_data (
    Game TEXT,
    PrizeMoney TEXT,
    Players TEXT,
    Tournaments TEXT
);

-- Staging table for the SteamSpy API JSON data
CREATE TABLE stg_steamspy_games (
    appid TEXT,
    name TEXT,
    developer TEXT,
    publisher TEXT,
    score_rank TEXT,
    positive TEXT,
    negative TEXT,
    userscore TEXT,
    owners TEXT,
    average_forever TEXT,
    average_2weeks TEXT,
    median_forever TEXT,
    median_2weeks TEXT,
    price TEXT,
    initialprice TEXT,
    discount TEXT,
    ccu TEXT
);

-- Drop the old combined table
DROP TABLE IF EXISTS stg_esports_data;

-- Create new, separate staging tables for each eSports file
DROP TABLE IF EXISTS stg_countries, stg_esports_players, stg_esports_teams CASCADE;

CREATE TABLE stg_countries (
    "Continent_Name" TEXT, "Continent_Code" TEXT, "Country_Name" TEXT,
    "Two_Letter_Country_Code" TEXT, "Three_Letter_Country_Code" TEXT, "Country_Number" TEXT
);

CREATE TABLE stg_esports_players (
    "PlayerId" TEXT, "NameFirst" TEXT, "NameLast" TEXT, "CurrentHandle" TEXT,
    "Country" TEXT, "TotalUSDPrize" TEXT, "Game" TEXT, "Genre" TEXT
);

CREATE TABLE stg_esports_teams (
    "TeamId" TEXT, "TeamName" TEXT, "TotalUSDPrize" TEXT,
    "TotalPlayers" TEXT, "Game" TEXT, "Genre" TEXT
);