// web/app/api/reports/top-playtime-games/route.test.ts

// Mock NextRequest for passing searchParams
import { NextRequest, NextResponse } from 'next/server';
import { GET } from '../top-playtime-games/route'; 
import pool from '@/lib/db';

const mockPool = pool as any;

describe('API: /top-playtime-games', () => {
  const mockData = {
    rows: [
      { game_name: 'Game A', average_playtime: 150.5 },
      { game_name: 'Game B', average_playtime: 120.0 },
    ],
  };

  // Mock the request object with search parameters
  const createMockRequest = (genre: string, platform: string): NextRequest => {
    // You need to mock the nextUrl.searchParams functionality
    const url = new URL(`http://localhost/api?genre=${genre}&platform=${platform}`);
    return {
        nextUrl: url,
    } as unknown as NextRequest;
  };

  test('should return top games when valid parameters are provided', async () => {
    const genreParam = 'Action';
    const platformParam = 'PC';

    mockPool.query.mockResolvedValueOnce(mockData);
    const request = createMockRequest(genreParam, platformParam);

    const response = await GET(request);

    // 1. Check if query was called with correct parameters
    expect(mockPool.query).toHaveBeenCalledWith(
      expect.stringContaining('WHERE g.genre_name = $1 AND p.platform_name = $2'),
      [genreParam, platformParam]
    );

    // 2. Check the response data
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data).toHaveLength(2);
    expect(data[0].game_name).toBe('Game A');
  });

  test('should return 400 error if parameters are missing', async () => {
    const request = createMockRequest('', 'PC'); // Missing genre
    const response = await GET(request);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain('Genre and platform parameters are required');
  });
});