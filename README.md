# STADVDB
## Before Running

Download the RAWG dataset in the G-Drive link below and add it in data folder before running.
https://drive.google.com/drive/folders/1ZnUoqlGVtOeOoGNwkP-c8dsBR7WlkXx_?usp=sharing

## How to run

```bash
cd sql
psql -U postgres -c "CREATE DATABASE videogames_dw;"
psql -U postgres -d videogames_dw -f init.sql
```

NOTE: Make sure you know your postgres password

Open pgAdmin 4 to check the tables are showing in the schema

---

NEXT: To install all the modules you need run these commands

```bash
cd ..
pip install -r requirements.txt
```

Then to fill the tables with data, run these commands (make sure you were able to successfuly download the modules from above)

NOTE: Make sure to create a .env file in the root directory `STADVD-MCO`

Input the following inside the file:
```bash
DB_USER=<DB_USER>
DB_PASSWORD=<DB_PASSWORD>
DB_HOST=<DB_HOST>
DB_PORT=<DB_PORT>
DB_NAME=<DB_NAME>
```

```bash
cd data
python ingest_data.py
```

```bash
cd sql
python transform_load.py
```

Open and run queries from `queries_to_use.sql` in pgAdmin 4 to check dim/facts/tables

---

TAKE NOTE OF THIS WARNING IF USING HIGHER VERSION OF PANDAS:
FutureWarning: A value is trying to be set on a copy of a DataFrame or Series through chained assignment using an inplace method.
The behavior will change in pandas 3.0. This inplace method will never work because the intermediate object on which we are setting values always behaves as a copy.

For example, when doing 'df[col].method(value, inplace=True)', try using 'df.method({col: value}, inplace=True)' or df[col] = df[col].method(value) instead, to perform the operation inplace on the original object.

---

## To Run the Web-App

First install the modules needed

```bash
cd web
npm i
```

NOTE: Make sure to create a .env.local file inside the `web` folder

Input the following inside the file:
```bash
DB_USER=<DB_USER>
DB_PASSWORD=<DB_PASSWORD>
DB_HOST=<DB_HOST>
DB_PORT=<DB_PORT>
DB_NAME=<DB_NAME>
```

Run the app with:
```bash
npm run dev
```


Open http://localhost:3000 with your browser to see the result.




