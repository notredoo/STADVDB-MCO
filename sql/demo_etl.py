import pandas as pd
from sqlalchemy import create_engine


db_user = 'postgres'
db_password = 'user'
db_host = 'localhost'
db_port = '5432'
db_name = 'videogames_dw'

db_string = f"postgresql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
engine = create_engine(db_string)


sample_game_names = [
    'Counter-Strike: Global Offensive'
]

print("--- Starting End-to-End Demo ETL ---")

try:
    print(f"Extracting data for: {sample_game_names[0]}")
    game_tuple = tuple(sample_game_names)

    rawg_df = pd.read_sql(f"SELECT * FROM stg_rawg_games WHERE name IN %(games)s", engine, params={'games': game_tuple})
    steamspy_df = pd.read_sql(f"SELECT * FROM stg_steamspy_games WHERE name IN %(games)s", engine, params={'games': game_tuple})
    esports_df = pd.read_sql(f"SELECT * FROM stg_esports_data WHERE \"Game\" IN %(games)s", engine, params={'games': game_tuple})

    print("Extraction successful.")
    print("Transforming data...")

    game_data = rawg_df.iloc[0]
    steam_data = steamspy_df.iloc[0]

    dim_game_demo = pd.DataFrame([{
        'game_name': game_data['name'],
        'developer': game_data['developers'],
        'publisher': game_data['publishers'],
        'release_date': pd.to_datetime(game_data['released']),
        'genre_id': None, # We'll populate this later in the full ETL
        'platform_id': None, # We'll populate this later
        'rating': pd.to_numeric(game_data['rating'], errors='coerce'),
        'metacritic_score': pd.to_numeric(game_data['metacritic'], errors='coerce'),
        'player_count': pd.to_numeric(steam_data['ccu'], errors='coerce'), # Using 'ccu' from steamspy for current players
        'price': pd.to_numeric(steam_data['price'], errors='coerce') / 100, # Price is in cents
        'playtime': pd.to_numeric(steam_data['average_forever'], errors='coerce')
    }])
    
    print("Transformation successful.")
    print("Loading transformed data into dim_game...")

    dim_game_demo.to_sql('dim_game', con=engine, if_exists='append', index=False)
    
    print("Demo ETL complete! Check the dim_game table in pgAdmin.")

except Exception as e:
    print(f"ERROR: The demo process failed. Reason: {e}")