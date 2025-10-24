import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { GET } from './route';

jest.mock('@/lib/db', () => ({
  __esModule: true,
  default: {
    query: jest.fn(),
  },
}));

describe('GET /api/reports/q1-drilldown', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

    // Test 1: returns data when a valid genre is provided
  it('should return JSON data when genre is provided', async () => {
    const mockRows = [
      { game_name: 'Dota 2', total_revenue: 5000000n },
      { game_name: 'CS:GO', total_revenue: 4000000n },
    ];
    (pool.query as jest.Mock).mockResolvedValueOnce({ rows: mockRows });

    const url = new URL('http://localhost/api/reports/q1-drilldown?genre=Action');
    const request = { nextUrl: url } as unknown as NextRequest;

    const response = await GET(request);
    const data = await response.json();

    expect(pool.query).toHaveBeenCalledWith(expect.any(String), ['Action']);
    expect(data).toEqual([
      { game_name: 'Dota 2', total_revenue: '5000000' },
      { game_name: 'CS:GO', total_revenue: '4000000' },
    ]);
    expect(response.status).toBe(200);
  });

  // Test 2: returns 400 when genre parameter is missing
  it('should return 400 if genre parameter is missing', async () => {
    const url = new URL('http://localhost/api/reports/q1-drilldown');
    const request = { nextUrl: url } as unknown as NextRequest;

    const response = await GET(request);
    const data = await response.json();

    expect(pool.query).not.toHaveBeenCalled();
    expect(response.status).toBe(400);
    expect(data).toEqual({ error: 'Genre parameter is required' });
  });

  // Test 3: handles database query errors properly
  it('should handle database query errors gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    (pool.query as jest.Mock).mockRejectedValueOnce(new Error('Database failure'));

    const url = new URL('http://localhost/api/reports/q1-drilldown?genre=Action');
    const request = { nextUrl: url } as unknown as NextRequest;

    const response = await GET(request);
    const data = await response.json();

    expect(data).toEqual({ error: 'Database failure' });
    expect(response.status).toBe(500);
    consoleSpy.mockRestore();
  });
});
