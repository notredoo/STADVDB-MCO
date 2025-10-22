import pandas as pd
from sqlalchemy import create_engine, text

# --- DATABASE CONFIGURATION ---
db_user = 'postgres'
db_password = 'user' # IMPORTANT: Change for other users
db_host = 'localhost'
db_port = '5432'
db_name = 'videogames_dw'

db_string = f"postgresql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
engine = create_engine(db_string)

# --- MAIN ETL PROCESS ---
if __name__ == "__main__":
    print("--- Starting Full ETL Process ---")

    # --- 1. WIPE EXISTING DATA ---
    try:
        with engine.connect() as connection:
            print("Wiping existing data from all warehouse tables...")
            connection.execute(text("TRUNCATE TABLE fact_sales, fact_esports, dim_player, dim_team, dim_game, dim_country, dim_date, dim_genre, dim_platform, dim_region RESTART IDENTITY CASCADE;"))
            connection.commit()
        print("All warehouse tables wiped successfully.")
    except Exception as e:
        print(f"Notice: Could not wipe tables. Reason: {e}")

    # --- 2. POPULATE DIMENSIONS ---
    
    # --- TRANSFORM AND LOAD dim_genre ---
    try:
        print("Populating dim_genre...")
        stg_df = pd.read_sql("SELECT genres FROM stg_rawg_games", engine)
        unique_genres = set()
        for genre_list in stg_df['genres'].dropna():
            for genre in genre_list.split('|'):
                unique_genres.add(genre.strip())
        dim_genre_df = pd.DataFrame(sorted(list(unique_genres)), columns=['genre_name'])
        dim_genre_df.to_sql('dim_genre', con=engine, if_exists='append', index=False)
        print(f"Successfully loaded {len(dim_genre_df)} unique genres into dim_genre.")
    except Exception as e:
        print(f"ERROR: Failed to populate dim_genre. Reason: {e}")

    # --- TRANSFORM AND LOAD dim_platform ---
    try:
        print("Populating dim_platform...")
        stg_df = pd.read_sql("SELECT platforms FROM stg_rawg_games", engine)
        unique_platforms = set()
        for platform_list in stg_df['platforms'].dropna():
            for platform in platform_list.split('|'):
                clean_platform = platform.split(' (')[0].strip()
                unique_platforms.add(clean_platform)
        dim_platform_df = pd.DataFrame(sorted(list(unique_platforms)), columns=['platform_name'])
        dim_platform_df.to_sql('dim_platform', con=engine, if_exists='append', index=False)
        print(f"Successfully loaded {len(dim_platform_df)} unique platforms into dim_platform.")
    except Exception as e:
        print(f"ERROR: Failed to populate dim_platform. Reason: {e}")

    # --- TRANSFORM AND LOAD dim_date ---
    try:
        print("Populating dim_date...")
        stg_df = pd.read_sql("SELECT released FROM stg_rawg_games WHERE released IS NOT NULL", engine)
        stg_df['released'] = pd.to_datetime(stg_df['released'])
        min_date = stg_df['released'].min()
        max_date = pd.to_datetime('today')
        date_series = pd.date_range(min_date, max_date, freq='D')
        dim_date_df = pd.DataFrame(date_series, columns=['full_date'])
        dim_date_df['year'] = dim_date_df['full_date'].dt.year
        dim_date_df['month'] = dim_date_df['full_date'].dt.month
        dim_date_df['day'] = dim_date_df['full_date'].dt.day
        dim_date_df.to_sql('dim_date', con=engine, if_exists='append', index=False)
        print(f"Successfully loaded {len(dim_date_df)} dates into dim_date.")
    except Exception as e:
        print(f"ERROR: Failed to populate dim_date. Reason: {e}")

    # --- TRANSFORM AND LOAD dim_country ---
    try:
        print("Populating dim_country...")
        stg_df = pd.read_sql("SELECT DISTINCT \"Continent_Name\", \"Country_Name\", \"Two_Letter_Country_Code\" FROM stg_countries", engine)
        dim_country_df = pd.DataFrame({
            'country_code': stg_df['Two_Letter_Country_Code'],
            'country_name': stg_df['Country_Name'],
            'continent_name': stg_df['Continent_Name']
        }).dropna(subset=['country_name'])
        dim_country_df.to_sql('dim_country', con=engine, if_exists='append', index=False)
        print(f"Successfully loaded {len(dim_country_df)} countries into dim_country.")
    except Exception as e:
        print(f"ERROR: Failed to populate dim_country. Reason: {e}")

    # --- TRANSFORM AND LOAD dim_region ---
    try:
        print("Populating dim_region...")
        regions = ['North America', 'Europe', 'Japan', 'Rest of World']
        dim_region_df = pd.DataFrame(regions, columns=['region_name'])
        dim_region_df.to_sql('dim_region', con=engine, if_exists='append', index=False)
        print(f"Successfully loaded {len(dim_region_df)} regions into dim_region.")
    except Exception as e:
        print(f"ERROR: Failed to populate dim_region. Reason: {e}")

    # --- TRANSFORM AND LOAD dim_game ---
    try:
        print("Populating the core dimension: dim_game...")
        rawg_df = pd.read_sql("SELECT * FROM stg_rawg_games", engine)
        steamspy_df = pd.read_sql("SELECT name, ccu, price, average_forever FROM stg_steamspy_games", engine)
        genre_map = pd.read_sql("SELECT genre_id, genre_name FROM dim_genre", engine).set_index('genre_name').to_dict()['genre_id']
        platform_map = pd.read_sql("SELECT platform_id, platform_name FROM dim_platform", engine).set_index('platform_name').to_dict()['platform_id']
        
        games_df = rawg_df.drop_duplicates(subset=['name']).copy()
        steamspy_df = steamspy_df.drop_duplicates(subset=['name'])
        
        games_df['genre_id'] = games_df['genres'].str.split('|').str[0].map(genre_map)
        games_df['platform_id'] = games_df['platforms'].str.split('|').str[0].map(platform_map)
        games_df = pd.merge(games_df, steamspy_df, on='name', how='left')
        
        dim_game_df = pd.DataFrame({
            'game_name': games_df['name'].str[:255],
            'developer': games_df['developers'].str.split('|').str[0].str[:255],
            'publisher': games_df['publishers'].str.split('|').str[0].str[:255],
            'release_date': pd.to_datetime(games_df['released'], errors='coerce'),
            'genre_id': games_df['genre_id'],
            'platform_id': games_df['platform_id'],
            'rating': pd.to_numeric(games_df['rating'], errors='coerce'),
            'metacritic_score': pd.to_numeric(games_df['metacritic'], errors='coerce'),
            'player_count': pd.to_numeric(games_df['ccu'], errors='coerce'),
            'price': pd.to_numeric(games_df['price'], errors='coerce') / 100,
            'playtime': pd.to_numeric(games_df['average_forever'], errors='coerce')
        })
        
        dim_game_df.dropna(subset=['game_name'], inplace=True)
        dim_game_df.drop_duplicates(subset=['game_name'], inplace=True)
        
        print("Cleaning dimension/table: Imputing missing values...")
        numerical_cols = ['rating', 'metacritic_score', 'player_count', 'price', 'playtime']
        for col in numerical_cols:
            mean_value = dim_game_df[col].mean().round()
            dim_game_df[col].fillna(mean_value, inplace=True)
            print(f"  - Filled the NULLs in '{col}' with mean value: {mean_value:.2f}")

        categorical_cols = ['developer', 'publisher']
        for col in categorical_cols:
            dim_game_df[col].fillna('Unknown', inplace=True)
        print("  - Filled the NULLs in categorical columns with 'Unknown'.")
        
        dim_game_df.to_sql('dim_game', con=engine, if_exists='append', index=False)
        print(f"Successfully loaded {len(dim_game_df)} cleaned games into dim_game.")
    except Exception as e:
        print(f"ERROR: Failed to populate dim_game. Reason: {e}")

    # --- TRANSFORM AND LOAD dim_team ---
    try:
        print("Populating dim_team...")
        stg_df = pd.read_sql("SELECT * FROM stg_esports_teams", engine)
        game_map = pd.read_sql("SELECT game_id, game_name FROM dim_game", engine).set_index('game_name').to_dict()['game_id']
        teams_df = stg_df.drop_duplicates(subset=['TeamName']).copy()
        teams_df['primary_game_id'] = teams_df['Game'].map(game_map)
        dim_team_df = pd.DataFrame({
            'team_name': teams_df['TeamName'].str[:255],
            'total_earnings': pd.to_numeric(teams_df['TotalUSDPrize'], errors='coerce'),
            'primary_game_id': teams_df['primary_game_id']
        })
        dim_team_df.dropna(axis=1, how='all', inplace=True)
        dim_team_df.to_sql('dim_team', con=engine, if_exists='append', index=False)
        print(f"Successfully loaded {len(dim_team_df)} teams into dim_team.")
    except Exception as e:
        print(f"ERROR: Failed to populate dim_team. Reason: {e}")
    
    # --- TRANSFORM AND LOAD dim_player ---
    try:
        print("Populating dim_player...")
        stg_df = pd.read_sql("SELECT * FROM stg_esports_players", engine)
        country_map = pd.read_sql("SELECT country_id, country_code FROM dim_country", engine).set_index('country_code').to_dict()['country_id']
        game_map = pd.read_sql("SELECT game_id, game_name FROM dim_game", engine).set_index('game_name').to_dict()['game_id']
        players_df = stg_df.drop_duplicates(subset=['PlayerId']).copy()
        players_df['player_name'] = players_df['NameFirst'] + ' ' + players_df['NameLast']
        players_df['country_id'] = players_df['CountryCode'].map(country_map)
        players_df['primary_game_id'] = players_df['Game'].map(game_map)
        dim_player_df = pd.DataFrame({
            'player_name': players_df['player_name'].str[:255],
            'current_handle': players_df['CurrentHandle'].str[:255],
            'country_id': players_df['country_id'],
            'total_earnings': pd.to_numeric(players_df['TotalUSDPrize'], errors='coerce'),
            'primary_game_id': players_df['primary_game_id']
        })
        dim_player_df.dropna(axis=1, how='all', inplace=True)
        dim_player_df.to_sql('dim_player', con=engine, if_exists='append', index=False)
        print(f"Successfully loaded {len(dim_player_df)} players into dim_player.")
    except Exception as e:
        print(f"ERROR: Failed to populate dim_player. Reason: {e}")

    # --- 3. POPULATE FACT TABLES ---
    
    # --- TRANSFORM AND LOAD fact_sales ---
    try:
        print("Populating the fact table: fact_sales...")
        dim_game_df = pd.read_sql("SELECT game_id, game_name, rating, EXTRACT(YEAR FROM release_date) as year FROM dim_game", engine)
        steamspy_df = pd.read_sql("SELECT name, owners, price, average_forever FROM stg_steamspy_games", engine)
        steamspy_df = steamspy_df.drop_duplicates(subset=['name'], keep='first')
        sales_df = pd.merge(dim_game_df, steamspy_df, left_on='game_name', right_on='name', how='inner')
        sales_df['estimated_sales'] = sales_df['owners'].str.split(' .. ').str[0].str.replace(',', '').astype(float)
        sales_df['price_numeric'] = pd.to_numeric(sales_df['price'], errors='coerce') / 100
        sales_df['revenue_estimate'] = sales_df['estimated_sales'] * sales_df['price_numeric']
        fact_sales_df = pd.DataFrame({
            'game_id': sales_df['game_id'],
            'year': sales_df['year'],
            'estimated_sales': sales_df['estimated_sales'],
            'avg_playtime': pd.to_numeric(sales_df['average_forever'], errors='coerce'),
            'rating': sales_df['rating'],
            'revenue_estimate': sales_df['revenue_estimate']
        })
        fact_sales_df.dropna(subset=['game_id', 'year'], inplace=True)
        fact_sales_df['year'] = fact_sales_df['year'].astype(int)
        fact_sales_df.dropna(axis=1, how='all', inplace=True)
        fact_sales_df.to_sql('fact_sales', con=engine, if_exists='append', index=False)
        print(f"Successfully loaded {len(fact_sales_df)} records into fact_sales.")
    except Exception as e:
        print(f"ERROR: Failed to populate fact_sales. Reason: {e}")

    # --- TRANSFORM AND LOAD fact_esports ---
    try:
        print("Populating the final fact table: fact_esports...")
        stg_df = pd.read_sql("SELECT * FROM stg_esports_teams", engine)
        dim_game_df = pd.read_sql("SELECT game_id, game_name, EXTRACT(YEAR FROM release_date) as year FROM dim_game", engine)
        esports_df = pd.merge(stg_df, dim_game_df, left_on='Game', right_on='game_name', how='inner')
        esports_df['total_prize_pool'] = pd.to_numeric(esports_df['TotalUSDPrize'], errors='coerce')
        fact_esports_agg = esports_df.groupby(['game_id', 'year']).agg(
            total_prize_pool=('total_prize_pool', 'sum'),
            num_tournaments=('TeamId', 'count')
        ).reset_index()
        fact_esports_df = pd.DataFrame({
            'game_id': fact_esports_agg['game_id'],
            'year': fact_esports_agg['year'],
            'total_prize_pool': fact_esports_agg['total_prize_pool'],
            'num_tournaments': fact_esports_agg['num_tournaments']
        })
        fact_esports_df.dropna(axis=1, how='all', inplace=True)
        fact_esports_df.to_sql('fact_esports', con=engine, if_exists='append', index=False)
        print(f"Successfully loaded {len(fact_esports_df)} aggregated records into fact_esports.")
    except Exception as e:
        print(f"ERROR: Failed to populate fact_esports. Reason: {e}")

    print("\n--- ETL Process Complete! Your data warehouse is fully populated. ---")