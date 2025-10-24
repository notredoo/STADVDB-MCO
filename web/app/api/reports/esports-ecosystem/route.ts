import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  const sqlQuery = `
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
        COALESCE(tp.total_tournament_prizes, 0) +
        COALESCE(pe.total_player_earnings, 0) +
        COALESCE(te.total_team_earnings, 0)
      ) AS total_ecosystem_value
    FROM
      dim_game gm
      LEFT JOIN TournamentPrizes tp ON gm.game_id = tp.game_id
      LEFT JOIN PlayerEarnings pe ON gm.game_id = pe.primary_game_id
      LEFT JOIN TeamEarnings te ON gm.game_id = te.primary_game_id
    WHERE
      COALESCE(tp.total_tournament_prizes, 0) > 0
      OR COALESCE(pe.total_player_earnings, 0) > 0
      OR COALESCE(te.total_team_earnings, 0) > 0
    ORDER BY
      total_ecosystem_value DESC;
  `;

  try {
    const { rows } = await pool.query(sqlQuery);

    const data = rows.map(row => {
      const newRow: { [key: string]: any } = {};
      for (const key in row) {
        const value = row[key];
        newRow[key] = (value !== null && typeof value === 'object' && typeof value.toString === 'function')
                        ? value.toString()
                        : value;
      }
      return newRow;
    });


    return NextResponse.json(data);

  } catch (error) {
    console.error('Database query error:', error);
    const errorMessage = (error instanceof Error) ? error.message : 'Unknown database error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
