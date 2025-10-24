import { NextResponse, NextRequest } from 'next/server';
import pool from '@/lib/db';
import { GET } from './route';

// Mock the database module
jest.mock('@/lib/db', () => ({
  __esModule: true,
  default: {
    query: jest.fn(),
  },
}));

describe('GET /api/reports/platform-revenue', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test 1: successful fetch with valid years
  it('returns platform revenue data as JSON when valid years are given', async () => {
    const mockRows = [
      { platform_name: 'PC', '2022': 120000, '2023': 150000, total_revenue: 270000 },
    ];
    (pool.query as jest.Mock).mockResolvedValueOnce({ rows: mockRows });

    const url = new URL('http://localhost/api/reports/platform-revenue?year=2022&year=2023');
    const req = { nextUrl: url } as unknown as NextRequest;

    const res = await GET(req);
    const data = await res.json();

    expect(pool.query).toHaveBeenCalledTimes(1);
    expect(res).toBeInstanceOf(NextResponse);
    expect(data).toEqual(mockRows); // should return the same data from DB
    expect(res.status).toBe(200);
  });

  // Test 2: no valid years provided
  it('returns an empty array when no valid years are given', async () => {
    const url = new URL('http://localhost/api/reports/platform-revenue?year=abcd&year=20x3');
    const req = { nextUrl: url } as unknown as NextRequest;

    const res = await GET(req);
    const data = await res.json();

    expect(pool.query).not.toHaveBeenCalled();
    expect(data).toEqual([]); // should handle invalid params gracefully
    expect(res.status).toBe(200);
  });

  // Test 3: database error
  it('returns 500 and error message when query fails', async () => {
    (pool.query as jest.Mock).mockRejectedValueOnce(new Error('Database failure'));
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const url = new URL('http://localhost/api/reports/platform-revenue?year=2022');
    const req = { nextUrl: url } as unknown as NextRequest;

    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data).toEqual({ error: 'Database failure' }); // should return error JSON
    consoleSpy.mockRestore();
  });
});
