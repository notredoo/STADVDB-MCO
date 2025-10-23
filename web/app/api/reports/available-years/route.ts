import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const sqlQuery = `
      SELECT DISTINCT year
      FROM fact_sales
      ORDER BY year DESC;
    `;

      const { rows } = await pool.query(sqlQuery);

    const years = rows.map(row => String(row.year));

    return NextResponse.json(years);

  } catch (error) {
    console.error('Database query error:', error);
    const errorMessage = (error instanceof Error) ? error.message : 'Unknown database error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
