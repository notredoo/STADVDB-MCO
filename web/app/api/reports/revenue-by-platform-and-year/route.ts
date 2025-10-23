import { NextResponse, NextRequest } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const years = searchParams.getAll('year');

    const validYears = years.filter(year => /^\d{4}$/.test(year));

    if (validYears.length === 0) {
      return NextResponse.json([]);
    }

    const pivotColumns = validYears
      .map(year => {
        return `
          SUM(
            CASE
              WHEN fs.year = ${year} THEN fs.revenue_estimate
              ELSE 0
            END
          ) AS "${year}"
        `;
      })
      .join(',\n');

    const whereInClause = validYears.join(', ');

    const sqlQuery = `
      SELECT
        p.platform_name,
        ${pivotColumns},
        SUM(fs.revenue_estimate) AS total_revenue
      FROM
        fact_sales fs
        JOIN dim_game gm ON fs.game_id = gm.game_id
        JOIN dim_platform p ON gm.platform_id = p.platform_id
      WHERE
        fs.year IN (${whereInClause})
      GROUP BY
        p.platform_name
      ORDER BY
        total_revenue DESC;
    `;

    const { rows } = await pool.query(sqlQuery);
    const data = rows.map(row => {
      const newRow: { [key: string]: any } = {};
      for (const key in row) {
        const value = row[key];
        newRow[key] = typeof value === 'bigint' ? value.toString() : value;
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

