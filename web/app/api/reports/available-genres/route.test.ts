// web/app/api/reports/available-genres/route.test.ts
import { GET } from '../available-genres/route';
import pool from '@/lib/db'; // Jest automatically uses the mock version
import { NextResponse } from 'next/server';

// Cast the pool to any so we can access the mocked query function
const mockPool = <any>pool;

describe('API: /available-genres', () => {
  const mockData = {
    rows: [
      { genre_name: 'Action' },
      { genre_name: 'RPG' },
      { genre_name: 'Strategy' },
    ],
  };

  // Set the mock implementation for the single test
  mockPool.query.mockResolvedValueOnce(mockData);

  test('should call the database with the correct query and return the list of genres', async () => {
    // 1. Call the GET handler
    const response = await GET();

    // 2. Expect the query function to have been called
    expect(mockPool.query).toHaveBeenCalledTimes(1);

    // 3. Optional: Check the query content
    const expectedQuery = expect.stringContaining('SELECT DISTINCT g.genre_name');
    expect(mockPool.query).toHaveBeenCalledWith(expectedQuery);

    // 4. Check the JSON response content
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data).toEqual(['Action', 'RPG', 'Strategy']);
  });

  test('should return a 500 error if the database query fails', async () => {
    // Override the successful mock for this failure test
    mockPool.query.mockRejectedValueOnce(new Error('Test DB connection error'));

    // 1. Call the GET handler
    const response = await GET();

    // 2. Check the response status and error message
    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toContain('Test DB connection error');
  });
});