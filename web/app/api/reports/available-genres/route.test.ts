import { GET } from './route'; // Import the handler
import pool from '@/lib/db'; // Import DB pool to mock
import { NextResponse } from 'next/server';

// Mock DB connection setup
const mockPool = pool as jest.Mocked<typeof pool>;
const mockQuery = mockPool.query as jest.Mock;

describe('API: /available-genres (GET Handler)', () => {

  // Reset mocks before each test
  beforeEach(() => {
    mockQuery.mockClear();
  });

  // Clear all mocks after each test
  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test 1: Should return genre list with status 200
  test('should call DB and return list of genres', async () => {
    const mockData = {
      rows: [
        { genre_name: 'Action' },
        { genre_name: 'RPG' },
        { genre_name: 'Strategy' },
      ],
    };
    mockQuery.mockResolvedValueOnce(mockData);

    const response = await GET();

    expect(mockQuery).toHaveBeenCalledTimes(1);
    expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining('SELECT DISTINCT g.genre_name'));
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toEqual(['Action', 'RPG', 'Strategy']);
  });

  // Test 2: Should return 500 when DB query fails
  test('should return 500 and error message on DB failure', async () => {
    const dbError = new Error('Test DB connection error');
    mockQuery.mockRejectedValueOnce(dbError);

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const response = await GET();
    consoleErrorSpy.mockRestore();

    expect(mockQuery).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(500);

    const data = await response.json();
    expect(data).toHaveProperty('error');
    expect(data.error).toContain('Test DB connection error');
  });

  // Test 3: Should return empty array if no data
  test('should return empty array when no genres found', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual([]);
  });
});
