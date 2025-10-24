import { NextRequest, NextResponse } from 'next/server';
import { GET } from './route';
import pool from '@/lib/db';

const mockPool = pool as any;

describe('GET /api/reports/top-playtime-games', () => {
  const mockData = {
    rows: [
      { game_name: 'Game A', average_playtime: 150.5 },
      { game_name: 'Game B', average_playtime: 120.0 },
    ],
  };

  const createMockRequest = (genre: string, platform: string): NextRequest => {
    const url = new URL(`http://localhost/api?genre=${genre}&platform=${platform}`);
    return { nextUrl: url } as unknown as NextRequest;
  };

  // Test 1: successful fetch with valid genre and platform
  it('returns top games when valid parameters are provided', async () => {
    const genre = 'Action';
    const platform = 'PC';

    mockPool.query.mockResolvedValueOnce(mockData);
    const req = createMockRequest(genre, platform);

    const res = await GET(req);
    const data = await res.json();

    expect(mockPool.query).toHaveBeenCalledWith(
      expect.stringContaining('WHERE g.genre_name = $1 AND p.platform_name = $2'),
      [genre, platform]
    );
    expect(res.status).toBe(200);
    expect(data).toHaveLength(2); // should return 2 rows
    expect(data[0].game_name).toBe('Game A');
  });

  // Test 2: missing required parameters
  it('returns 400 if genre or platform is missing', async () => {
    const req = createMockRequest('', 'PC'); // missing genre
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toContain('Genre and platform parameters are required');
  });
});
