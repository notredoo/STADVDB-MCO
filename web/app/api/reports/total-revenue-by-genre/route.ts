import { NextResponse } from 'next/server';
import pool from '@/lib/db';

const sqlQuery = `
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
`;

export async function GET() {
  try {
    const result = await pool.query(sqlQuery);
    return NextResponse.json(result.rows);

  } catch (error) {
    if (error instanceof Error) {
        console.error('Database query failed:', error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: 'An unknown error occurred' },
      { status: 500 }
    );
  }
}