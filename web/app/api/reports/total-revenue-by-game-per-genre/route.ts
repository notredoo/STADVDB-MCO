import { NextResponse, NextRequest } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const genre = searchParams.get('genre');

    if (!genre) {
      return NextResponse.json({ error: 'Genre parameter is required' }, { status: 400 });
    }


    const sqlQuery = `
      SELECT
        gm.game_name,
        SUM(fs.revenue_estimate) AS total_revenue
      FROM
        fact_sales fs
        JOIN dim_game gm ON fs.game_id = gm.game_id
        JOIN dim_genre g ON gm.genre_id = g.genre_id
      WHERE
        g.genre_name = $1 -- The placeholder for the genre
      GROUP BY
        gm.game_name
      HAVING
        SUM(fs.revenue_estimate) IS NOT NULL AND SUM(fs.revenue_estimate) > 0
      ORDER BY
        total_revenue DESC
      LIMIT 50;
    `;

    const { rows } = await pool.query(sqlQuery, [genre]);

    const data = rows.map(row => ({
      ...row,
      total_revenue: typeof row.total_revenue === 'bigint'
        ? row.total_revenue.toString()
        : Number(row.total_revenue),
    }));

    return NextResponse.json(data);

  } catch (error) {
    console.error('Database query error in q1-drilldown:', error);
    const errorMessage = (error instanceof Error) ? error.message : 'Unknown database error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

