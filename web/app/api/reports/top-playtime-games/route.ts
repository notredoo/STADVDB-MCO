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

    // 2. Handle Platform filter
    if (platform !== 'ALL') {
      whereClauses.push(`p.platform_name = $${paramIndex++}`);
      queryParams.push(platform);
    }

    const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const sqlQuery = `
      SELECT
        gm.game_name,
        g.genre_name,
        p.platform_name,
        AVG(fs.avg_playtime) AS average_playtime
      FROM
        fact_sales fs
        JOIN dim_game gm ON fs.game_id = gm.game_id
        JOIN dim_genre g ON gm.genre_id = g.genre_id
        JOIN dim_platform p ON gm.platform_id = p.platform_id
      ${whereClause}
      GROUP BY
        gm.game_name,
        g.genre_name,
        p.platform_name
      HAVING AVG(fs.avg_playtime) IS NOT NULL AND AVG(fs.avg_playtime) > 0
      ORDER BY
        average_playtime DESC
      LIMIT 50;
    `;

    const { rows } = await pool.query(sqlQuery, queryParams);

    const data = rows.map(row => {
      const newRow: { [key: string]: any } = {};
      for (const key in row) {
        const value = row[key];
        newRow[key] = (typeof value === 'object' && value !== null && typeof value.toFixed === 'function')
          ? parseFloat(value.toFixed(2))
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