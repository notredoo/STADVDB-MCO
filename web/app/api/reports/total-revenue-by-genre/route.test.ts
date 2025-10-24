import { GET } from './route';
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// Mock the database module
jest.mock('@/lib/db', () => ({
  query: jest.fn(),
}));

describe('GET /api/rollup', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test 1: returns data when query succeeds
  it('returns data when the query works', async () => {
    const mockData = [
      { genre_name: 'Action', total_revenue: 120000 },
      { genre_name: 'Adventure', total_revenue: 80000 },
    ];

    (pool.query as jest.Mock).mockResolvedValueOnce({ rows: mockData });

    const response = await GET();
    const data = await response.json();

    expect(pool.query).toHaveBeenCalledTimes(1);
    expect(response).toBeInstanceOf(NextResponse);
    expect(data).toEqual(mockData);
  });

  // Test 2: returns 500 when database query fails
  it('returns 500 if the query fails', async () => {
    (pool.query as jest.Mock).mockRejectedValueOnce(new Error('DB connection failed'));

    const response = await GET();
    const data = await response.json();

    expect(data).toEqual({ error: 'DB connection failed' });
    expect(response.status).toBe(500);
  });

  // Test 3: handles non-Error exceptions properly
  it('handles unknown errors', async () => {
    (pool.query as jest.Mock).mockRejectedValueOnce('random error');

    const response = await GET();
    const data = await response.json();

    expect(data).toEqual({ error: 'An unknown error occurred' });
    expect(response.status).toBe(500);
  });
});
