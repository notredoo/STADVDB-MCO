import { GET } from './route';
import pool from '@/lib/db';

const mockPool = pool as jest.Mocked<typeof pool>;
const mockQuery = mockPool.query as jest.Mock;

describe('GET /reports/filtered-genres', () => {
  beforeEach(() => {
    mockQuery.mockClear();
  });

  // Test 1: success case
  // should return 200 + list of genres with positive revenue
  test('returns a list of genres when query succeeds', async () => {
    const mockData = {
      rows: [
        { genre_name: 'FPS' },
        { genre_name: 'Puzzle' },
        { genre_name: 'Simulation' },
      ],
    };

    mockQuery.mockResolvedValueOnce(mockData);

    const res = await GET();
    const data = await res.json();

    expect(mockQuery).toHaveBeenCalledTimes(1);
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('WHERE fs.revenue_estimate IS NOT NULL AND fs.revenue_estimate > 0')
    );

    expect(res.status).toBe(200);
    expect(data).toEqual(['FPS', 'Puzzle', 'Simulation']);
  });

  // Test 2: db failure
  // should return 500 + error message
  test('returns 500 and error message if db query fails', async () => {
    const dbError = new Error('Database connection timeout');
    mockQuery.mockRejectedValueOnce(dbError);

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const res = await GET();
    const data = await res.json();
    consoleSpy.mockRestore();

    expect(res.status).toBe(500);
    expect(data).toHaveProperty('error', 'Database connection timeout');
  });

  // Test 3: no data
  // should return 200 + empty array
  test('returns empty array if no genres match', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual([]);
    expect(mockQuery).toHaveBeenCalledTimes(1);
  });
});
