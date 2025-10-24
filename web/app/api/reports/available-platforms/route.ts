import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const query = `
      SELECT DISTINCT p.platform_name
      FROM dim_platform p
      JOIN dim_game gm ON p.platform_id = gm.platform_id
      JOIN fact_sales fs ON gm.game_id = fs.game_id
      WHERE fs.revenue_estimate IS NOT NULL AND fs.revenue_estimate > 0 -- Or use avg_playtime
      ORDER BY p.platform_name;
    `;
    const { rows } = await pool.query(query);
    const platforms = rows.map(row => row.platform_name);
    return NextResponse.json(platforms);
  } catch (error) {
    console.error('Database query error:', error);
    const errorMessage = (error instanceof Error) ? error.message : 'Unknown database error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
