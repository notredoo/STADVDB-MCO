import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const query = `
      SELECT DISTINCT g.genre_name
      FROM dim_genre g
      JOIN dim_game gm ON g.genre_id = gm.genre_id
      JOIN fact_sales fs ON gm.game_id = fs.game_id
      WHERE fs.revenue_estimate IS NOT NULL AND fs.revenue_estimate > 0
      ORDER BY g.genre_name;
    `;

    const { rows } = await pool.query(query);
    const genres = rows.map(row => row.genre_name);
    return NextResponse.json(genres);
  } catch (error) {
    console.error('Database query error:', error);
    const errorMessage = (error instanceof Error) ? error.message : 'Unknown database error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

