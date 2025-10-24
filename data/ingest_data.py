import pandas as pd
import requests
from sqlalchemy import create_engine
from dotenv import load_dotenv
import os

load_dotenv()

DB_USER = os.getenv("DB_USER")         # default: postgres
DB_PASSWORD = os.getenv("DB_PASSWORD") # default: N/A
DB_HOST = os.getenv("DB_HOST")         # default: localhost
DB_PORT = os.getenv("DB_PORT")         # default: 5432
DB_NAME = os.getenv("DB_NAME")         # default: videogames_dw

# --- DATABASE CONFIGURATION ---
db_user = DB_USER
db_password = DB_PASSWORD
db_host = DB_HOST
db_port = DB_PORT
db_name = DB_NAME

db_string = f"postgresql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
engine = create_engine(db_string)

# --- FILE AND API LOCATIONS ---
rawg_csv_path = 'rawg-games-dataset.csv'
esports_csv_paths = [
    'country-and-continent-codes-list.csv',
    'highest_earning_players.csv',
    'highest_earning_teams.csv',
]
steamspy_api_url = 'https://steamspy.com/api.php?request=all&page=0'

# --- DATA INGESTION FUNCTIONS ---
def ingest_csv_to_staging(file_path, table_name, db_engine):
    try:
        print(f"Reading data from {file_path}...")
        df = pd.read_csv(file_path)
        print(f"Loading {len(df)} rows into staging table '{table_name}'...")
        df.to_sql(table_name, con=db_engine, if_exists='replace', index=False)
        print(f"Successfully loaded data into '{table_name}'.")
    except Exception as e:
        print(f"ERROR: Failed to process {file_path}. Reason: {e}")

def ingest_steamspy_api_to_staging(api_url, table_name, db_engine):
    try:
        print(f"Requesting data from SteamSpy API: {api_url}...")
        response = requests.get(api_url)
        response.raise_for_status()

        print("API request successful. Parsing JSON data.")
        api_data = response.json()

        games_list = list(api_data.values())
        df = pd.DataFrame(games_list)

        print(f"Loading {len(df)} rows into staging table '{table_name}'...")
        df.to_sql(table_name, con=db_engine, if_exists='replace', index=False)
        print(f"Successfully loaded data into '{table_name}'.")
    except Exception as e:
        print(f"ERROR: Failed to process SteamSpy API. Reason: {e}")

def ingest_multiple_csvs_to_staging(file_paths, table_name, db_engine):
    try:
        all_dfs = []
        for file_path in file_paths:
            print(f"Reading data from {file_path}...")
            df = pd.read_csv(file_path)
            all_dfs.append(df)

        print("Combining all eSports data into a single table...")
        combined_df = pd.concat(all_dfs, ignore_index=True)

        print(f"Loading {len(combined_df)} total rows into staging table '{table_name}'...")
        combined_df.to_sql(table_name, con=db_engine, if_exists='replace', index=False)
        print(f"Successfully loaded combined data into '{table_name}'.")
    except Exception as e:
        print(f"ERROR: Failed to process multiple CSVs. Reason: {e}")

# --- MAIN EXECUTION ---

if __name__ == "__main__":
    countries_csv = 'country-and-continent-codes-list.csv'
    players_csv = 'highest_earning_players.csv'
    teams_csv = 'highest_earning_teams.csv'

    ingest_csv_to_staging(rawg_csv_path, 'stg_rawg_games', engine)

    print("\n--- Ingesting eSports Data ---")
    ingest_csv_to_staging(countries_csv, 'stg_countries', engine)
    ingest_csv_to_staging(players_csv, 'stg_esports_players', engine)
    ingest_csv_to_staging(teams_csv, 'stg_esports_teams', engine)

    print("\n--- Ingesting SteamSpy API Data ---")
    ingest_steamspy_api_to_staging(steamspy_api_url, 'stg_steamspy_games', engine)

    print("\n--- All ingestion tasks complete. ---")
