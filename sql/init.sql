DROP TABLE IF EXISTS fact_sales, fact_esports, dim_game, dim_genre, dim_platform,
                     dim_date, dim_country, dim_region, dim_team, dim_player CASCADE;

-- =======================================================
-- DIMENSION TABLES

-- genre Dimension
CREATE TABLE dim_genre (
    genre_id SERIAL PRIMARY KEY,
    genre_name VARCHAR(100) UNIQUE NOT NULL
);

-- platform Dimension
CREATE TABLE dim_platform (
    platform_id SERIAL PRIMARY KEY,
    platform_name VARCHAR(50) UNIQUE NOT NULL
);

-- date Dimension
CREATE TABLE dim_date (
    date_id SERIAL PRIMARY KEY,
    full_date DATE,
    year INT,
    month INT,
    day INT
);

-- country Dimension
CREATE TABLE dim_country (
    country_id SERIAL PRIMARY KEY,
    country_code VARCHAR(10),
    country_name VARCHAR(100),
    continent_name VARCHAR(50)
);

-- game Dimension
CREATE TABLE dim_game (
    game_id SERIAL PRIMARY KEY,
    game_name VARCHAR(255) UNIQUE NOT NULL,
    developer VARCHAR(255),
    publisher VARCHAR(255),
    release_date DATE,
    genre_id INT REFERENCES dim_genre(genre_id),
    platform_id INT REFERENCES dim_platform(platform_id),
    rating FLOAT,
    metacritic_score FLOAT,
    player_count BIGINT,
    price NUMERIC(10,2),
    playtime INT
);

-- team Dimension
CREATE TABLE dim_team (
    team_id SERIAL PRIMARY KEY,
    team_name VARCHAR(255) UNIQUE NOT NULL,
    total_earnings NUMERIC(15,2),
    primary_game_id INT REFERENCES dim_game(game_id)
);

-- player Dimension
CREATE TABLE dim_player (
    player_id SERIAL PRIMARY KEY,
    player_name VARCHAR(255) NOT NULL,
    current_handle VARCHAR(255),
    total_earnings NUMERIC(15,2),
    primary_game_id INT REFERENCES dim_game(game_id)
);

-- region Dimension
CREATE TABLE dim_region (
    region_id SERIAL PRIMARY KEY,
    region_name VARCHAR(50) UNIQUE NOT NULL
);

-- =======================================================
-- FACT TABLES

-- sales Fact Table
CREATE TABLE fact_sales (
    sales_id SERIAL PRIMARY KEY,
    game_id INT REFERENCES dim_game(game_id),
    year INT,
    estimated_sales NUMERIC(15,2),
    avg_playtime INT,
    rating FLOAT, 
    revenue_estimate NUMERIC(15,2) 
);

-- eSports Fact Table
CREATE TABLE fact_esports (
    esports_id SERIAL PRIMARY KEY,
    game_id INT REFERENCES dim_game(game_id),
    year INT,
    total_prize_pool NUMERIC(15,2),
    num_tournaments INT
);
