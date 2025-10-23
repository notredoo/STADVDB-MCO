# STADVDB
## Before Running

Download the RAWG dataset in the G-Drive link below and add it in STADVDB-MCO folder before running.
https://drive.google.com/drive/folders/1ZnUoqlGVtOeOoGNwkP-c8dsBR7WlkXx_?usp=sharing

## How to run

`psql -U postgres -c "CREATE DATABASE videogames_dw;"`
`psql -U postgres -d videogames_dw -f init.sql`

NOTE: Make sure you know your postgres password

Open pgAdmin 4 to check the tables are showing in the schema

cd ..
`python ingest_data.py`

cd sql
`python transform_load.py`

Open and run queries of `queries_to_use.sql` to check dim/facts/tables

TAKE NOTE OF THIS WARNING IF USING HIGHER VERSION OF PANDAS:
FutureWarning: A value is trying to be set on a copy of a DataFrame or Series through chained assignment using an inplace method.
The behavior will change in pandas 3.0. This inplace method will never work because the intermediate object on which we are setting values always behaves as a copy.

For example, when doing 'df[col].method(value, inplace=True)', try using 'df.method({col: value}, inplace=True)' or df[col] = df[col].method(value) instead, to perform the operation inplace on the original object.




