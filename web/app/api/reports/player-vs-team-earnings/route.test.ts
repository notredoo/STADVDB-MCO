import { GET } from './route'; // API route handler
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// Mock the database module
jest.mock('@/lib/db', () => ({
  query: jest.fn(),
}));

describe('GET /api/reports/player-vs-team-earnings', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test 1: normal successful fetch
  it('returns player vs team earnings as JSON', async () => {
    const mockRows = [
      { game_name: 'Dota 2', total_player_earnings: 1000000, total_team_earnings: 800000 },
      { game_name: 'League of Legends', total_player_earnings: 500000, total_team_earnings: 600000 },
    ];

    (pool.query as jest.Mock).mockResolvedValueOnce({ rows: mockRows });

    const res = await GET();
    const data = await res.json();

    expect(pool.query).toHaveBeenCalledTimes(1);
    expect(res).toBeInstanceOf(NextResponse);
    expect(data).toEqual(mockRows); // should return the same data from DB
  });

  // Test 2: no rows found
  it('returns an empty array if no data is found', async () => {
    (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

    const res = await GET();
    const data = await res.json();

    expect(data).toEqual([]); // should handle empty result gracefully
  });

  // Test 3: database error
  it('returns 500 and the error message when query fails', async () => {
    (pool.query as jest.Mock).mockRejectedValueOnce(new Error('Database failure'));

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data).toEqual({ error: 'Database failure' }); // should send error JSON
  });
});
