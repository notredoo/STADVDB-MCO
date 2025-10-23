/*
================================================================================
Query 1: Q1 (Roll-up): Total Revenue by Genre
================================================================================
* OLAP Operation: Roll-up
* Purpose: To provide a high-level summary of total revenue by aggregating
* sales data from the individual game level up to the parent genre level.
* How it Works: Joins fact_sales with dim_game and dim_genre, then SUMs
* the revenue_estimate for all games, GROUP BYing the results
* for each genre_name.
*/
SELECT
  g.genre_name,
  SUM(fs.revenue_estimate) AS total_revenue
FROM
  fact_sales fs
  JOIN dim_game gm ON fs.game_id = gm.game_id
  JOIN dim_genre g ON gm.genre_id = g.genre_id
GROUP BY
  g.genre_name
ORDER BY
  total_revenue DESC;


/*
================================================================================
Query 2: Q1 (Drill-down): Total Revenue by Game for a specific Genre
================================================================================
* OLAP Operation: Drill-down
* Purpose: To allow a user to investigate the details of a single genre
* from the "Roll-up" report. It shows which specific games
* contribute to a genre's total revenue.
* How it Works: This query is the second step of the "Roll-up." After a user
* selects a genre (e.g., 'Strategy'), the query filters for
* only that genre using the WHERE clause and then groups
* by game_name to show the revenue for each individual game.
*/
SELECT
  gm.game_name,
  SUM(fs.revenue_estimate) AS total_revenue
FROM
  fact_sales fs
  JOIN dim_game gm ON fs.game_id = gm.game_id
  JOIN dim_genre g ON gm.genre_id = g.genre_id
WHERE
  g.genre_name = 'Action' -- Your web app will replace '?' with the selected genre
GROUP BY
  gm.game_name
ORDER BY
  total_revenue DESC;


/*
================================================================================
Query 3: Q2 (Pivot): Total Estimated Revenue by Platform and Year
================================================================================
* OLAP Operation: Pivot (and Slice)
* Purpose: To analyze revenue trends by comparing platform performance against
* each other over time. This creates a "crosstab" report ideal
* for seeing market changes.
* How it Works: It performs a "pivot" by using conditional aggregation
* (SUM(CASE WHEN fs.year = ...)). It creates a row for each
* platform_name and a separate column for each year.
* The `WHERE fs.year IN (...)` clause "slices" the data.
*/
SELECT
  p.platform_name,
  SUM(
    CASE
      WHEN fs.year = 2014 THEN fs.revenue_estimate
      ELSE 0
    END
  ) AS "2014",
  SUM(
    CASE
      WHEN fs.year = 2015 THEN fs.revenue_estimate
      ELSE 0
    END
  ) AS "2015",
  SUM(
    CASE
      WHEN fs.year = 2016 THEN fs.revenue_estimate
      ELSE 0
    END
  ) AS "2016",
  SUM(
    CASE
      WHEN fs.year = 2021 THEN fs.revenue_estimate
      ELSE 0
    END
  ) AS "2021",
  SUM(fs.revenue_estimate) AS total_revenue
FROM
  fact_sales fs
  JOIN dim_game gm ON fs.game_id = gm.game_id
  JOIN dim_platform p ON gm.platform_id = p.platform_id
WHERE
  fs.year IN (2014, 2015, 2016, 2021)
GROUP BY
  p.platform_name
ORDER BY
  total_revenue DESC;


/*
================================================================================
Query 4: Q2 (Pivot): Average Playtime by Genre and Year
================================================================================
* OLAP Operation: Pivot (and Slice)
* Purpose: To analyze player *engagement* trends. It compares which genres are
* most effective at holding a player's attention and how this has
* changed year-over-year.
* How it Works: Another pivot, using AVG(fs.avg_playtime) as the cell
* value and g.genre_name as the rows. It correctly uses
* NULL in the CASE statement to prevent zeroes from
* skewing the average.
*/
SELECT
  g.genre_name,
  AVG(
    CASE
      WHEN fs.year = 2014 THEN fs.avg_playtime
      ELSE NULL
    END
  ) AS "2014_avg_playtime",
  AVG(
    CASE
      WHEN fs.year = 2015 THEN fs.avg_playtime
      ELSE NULL
    END
  ) AS "2015_avg_playtime",
  AVG(
    CASE
      WHEN fs.year = 2016 THEN fs.avg_playtime
      ELSE NULL
    END
  ) AS "2016_avg_playtime",
  AVG(
    CASE
      WHEN fs.year = 2021 THEN fs.avg_playtime
      ELSE NULL
    END
  ) AS "2021_avg_playtime",
  AVG(fs.avg_playtime) AS overall_avg_playtime
FROM
  fact_sales fs
  JOIN dim_game gm ON fs.game_id = gm.game_id
  JOIN dim_genre g ON gm.genre_id = g.genre_id
WHERE
  fs.year IN (2014, 2015, 2016, 2021)
GROUP BY
  g.genre_name
ORDER BY
  overall_avg_playtime DESC;


/*
================================================================================
Query 5: DICE: Top 10 Games by Average Playtime
================================================================================
* OLAP Operation: Dice (and Rank)
* Purpose: To provide a highly specific, filtered, and ranked report. This query
* "dices" the data cube to answer a narrow, multi-faceted question.
* How it Works: It joins four tables and filters on two different
* dimensions at once (g.genre_name AND p.platform_name).
* This two-dimensional filter is a "dice"
* operation. The ORDER BY and LIMIT 10 provide the final ranking.
*/
SELECT
  gm.game_name,
  fs.year,
  g.genre_name,
  p.platform_name,
  AVG(fs.avg_playtime) AS average_playtime
FROM
  fact_sales fs
  JOIN dim_game gm ON fs.game_id = gm.game_id
  JOIN dim_genre g ON gm.genre_id = g.genre_id
  JOIN dim_platform p ON gm.platform_id = p.platform_id
WHERE
  g.genre_name = ? -- e.g., 'Action'
  AND p.platform_name = ? -- e.g., 'PC'
GROUP BY
  gm.game_name,
  fs.year,
  g.genre_name,
  p.platform_name
ORDER BY
  average_playtime DESC
LIMIT 10;


/*
================================================================================
Query 6: OLAP (Slice and Rank): Top 10 Games by Revenue for a Single Year
================================================================================
* OLAP Operation: Slice (and Rank)
* Purpose: To identify the top 10 most profitable "hit" games from a
* single, specific year.
* How it Works: This query "slices" the fact_sales table by filtering for
* only one `year`. It then ranks the results from that slice
* using ORDER BY and LIMIT 10.
*/
SELECT
  gm.game_name,
  fs.year,
  fs.revenue_estimate
FROM
  fact_sales fs
  JOIN dim_game gm ON fs.game_id = gm.game_id
WHERE
  fs.year = 2022 -- Your app replaces '?' with the selected year (e.g., 2019)
ORDER BY
  fs.revenue_estimate DESC
LIMIT 10;


/*
================================================================================
Query 7: OLAP (Roll-up): Total eSports Prize Pool by Genre
================================================================================
* OLAP Operation: Roll-up
* Purpose: To provide a high-level summary of which game genres have the
* largest eSports financial backing.
* How it Works: It aggregates `total_prize_pool` from `fact_esports`, rolling
* the data up from the individual game level to the parent
* `genre_name`.
*/
SELECT
  g.genre_name,
  SUM(fe.total_prize_pool) AS total_prize_pool,
  SUM(fe.num_tournaments) AS total_tournaments
FROM
  fact_esports fe
  JOIN dim_game gm ON fe.game_id = gm.game_id
  JOIN dim_genre g ON gm.genre_id = g.genre_id
GROUP BY
  g.genre_name
HAVING
  SUM(fe.total_prize_pool) > 0
ORDER BY
  total_prize_pool DESC;


/*
================================================================================
Query 8: OLAP (Drill-down): eSports Prize Pool by Game for a specific Genre
================================================================================
* OLAP Operation: Drill-down
* Purpose: To allow a user to investigate the eSports games *within* a
* specific genre (e.g., "Action") from the roll-up report.
* How it Works: This is the partner to the query above. It filters for a
* single, parameterized `genre_name` and shows the individual
* `game_name` and `total_prize_pool` for each.
*/
SELECT
  gm.game_name,
  fe.total_prize_pool,
  fe.num_tournaments
FROM
  fact_esports fe
  JOIN dim_game gm ON fe.game_id = gm.game_id
  JOIN dim_genre g ON gm.genre_id = g.genre_id
WHERE
  g.genre_name = 'Action' -- Your app replaces '?' with the selected genre
ORDER BY
  fe.total_prize_pool DESC;


/*
================================================================================
Query 9: DRILL-ACROSS: Total Player Earnings vs. Total Team Earnings by Game
================================================================================
* OLAP Operation: Drill-Across
* Purpose: To analyze the eSports ecosystem for each game, answering the
* question: "Is this game more profitable for individual pro
* players or for organized teams?"
* How it Works: It uses two Common Table Expressions (CTEs), `PlayerEarnings`
* and `TeamEarnings`, to pre-aggregate data from two different
* tables (dim_player and dim_team). It then joins both
* results to dim_game to present the two metrics side-by-side.
*/
WITH
  PlayerEarnings AS (
    SELECT
      primary_game_id,
      SUM(total_earnings) AS total_player_earnings
    FROM
      dim_player
    WHERE
      primary_game_id IS NOT NULL
    GROUP BY
      primary_game_id
  ),
  TeamEarnings AS (
    SELECT
      primary_game_id,
      SUM(total_earnings) AS total_team_earnings
    FROM
      dim_team
    WHERE
      primary_game_id IS NOT NULL
    GROUP BY
      primary_game_id
  )
SELECT
  gm.game_name,
  COALESCE(pe.total_player_earnings, 0) AS total_player_earnings,
  COALESCE(te.total_team_earnings, 0) AS total_team_earnings
FROM
  dim_game gm
  LEFT JOIN PlayerEarnings pe ON gm.game_id = pe.primary_game_id
  LEFT JOIN TeamEarnings te ON gm.game_id = te.primary_game_id
WHERE
  pe.total_player_earnings > 0
  OR te.total_team_earnings > 0
ORDER BY
  total_player_earnings DESC,
  total_team_earnings DESC;


/*
================================================================================
Query 10: OLAP (Drill-Across): Total eSports Ecosystem Value by Game
================================================================================
* OLAP Operation: Drill-Across
* Purpose: To provide a single, 360-degree financial view of each game's
* entire eSports footprint. This is the most complex analytical report.
* How it Works: This query "drills across" THREE different tables (fact_esports,
* dim_player, dim_team). It uses three CTEs to pre-aggregate
* tournament prizes, player earnings, and team earnings. It then
* joins all three to dim_game and calculates a new metric
* (total_ecosystem_value) by summing the other three.
*/
WITH
  TournamentPrizes AS (
    SELECT
      game_id,
      SUM(total_prize_pool) AS total_tournament_prizes
    FROM
      fact_esports
    GROUP BY
      game_id
  ),
  PlayerEarnings AS (
    SELECT
      primary_game_id,
      SUM(total_earnings) AS total_player_earnings
    FROM
      dim_player
    WHERE
      primary_game_id IS NOT NULL
    GROUP BY
      primary_game_id
  ),
  TeamEarnings AS (
    SELECT
      primary_game_id,
      SUM(total_earnings) AS total_team_earnings
    FROM
      dim_team
    WHERE
      primary_game_id IS NOT NULL
    GROUP BY
      primary_game_id
  )
SELECT
  gm.game_name,
  COALESCE(tp.total_tournament_prizes, 0) AS tournament_prizes,
  COALESCE(pe.total_player_earnings, 0) AS player_earnings,
  COALESCE(te.total_team_earnings, 0) AS team_earnings,
  (
    COALESCE(tp.total_tournament_prizes, 0) + COALESCE(pe.total_player_earnings, 0) + COALESCE(te.total_team_earnings, 0)
  ) AS total_ecosystem_value
FROM
  dim_game gm
  LEFT JOIN TournamentPrizes tp ON gm.game_id = tp.game_id
  LEFT JOIN PlayerEarnings pe ON gm.game_id = pe.primary_game_id
  LEFT JOIN TeamEarnings te ON gm.game_id = te.primary_game_id
WHERE
  tp.total_tournament_prizes > 0
  OR pe.total_player_earnings > 0
  OR te.total_team_earnings > 0
ORDER BY
  total_ecosystem_value DESC
LIMIT 50;
