import { NextResponse, NextRequest } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const genre = searchParams.get('genre');
    const platform = searchParams.get('platform');

    if (!genre || !platform) {
      return NextResponse.json({ error: 'Genre and platform parameters are required' }, { status: 400 });
    }

    // --- Dynamic Query Construction ---
    let whereClauses = [];
    let queryParams: string[] = [];
    let paramIndex = 1;

    // 1. Handle Genre filter
    if (genre !== 'ALL') {
      whereClauses.push(`g.genre_name = $${paramIndex++}`);
      queryParams.push(genre);
    }

    if (platform !== 'ALL') {
      whereClauses.push(`p.platform_name = $${paramIndex++}`);
      queryParams.push(platform);
    }

    const whereClause = `WHERE ${whereClauses.join(' AND ')}`;

    const sqlQuery = `
      SELECT
        gm.game_name,
        g.genre_name,
        p.platform_name,
        fs.avg_playtime
      FROM
        fact_sales fs
        JOIN dim_game gm ON fs.game_id = gm.game_id
        JOIN dim_genre g ON gm.genre_id = g.genre_id
        JOIN dim_platform p ON gm.platform_id = p.platform_id
      ${whereClause}
      ORDER BY
        fs.avg_playtime DESC
      LIMIT 50;
    `;

    const { rows } = await pool.query(sqlQuery, queryParams);
    return NextResponse.json(rows);

  } catch (error) {
    console.error('Database query error:', error);
    const message = error instanceof Error ? error.message : 'Unknown database error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
