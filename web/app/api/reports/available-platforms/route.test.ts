import { GET } from './route';
import pool from '@/lib/db';

const mockPool = pool as jest.Mocked<typeof pool>;
const mockQuery = mockPool.query as jest.Mock;

describe('GET /available-platforms', () => {
  beforeEach(() => {
    mockQuery.mockClear();
  });

  // Test 1: success case
  // should return 200 and a list of platforms with positive revenue
  test('returns a list of available platforms', async () => {
    const mockData = {
      rows: [
        { platform_name: 'PC' },
        { platform_name: 'PlayStation 5' },
        { platform_name: 'Xbox Series X/S' },
        { platform_name: 'Switch' },
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
    expect(data).toEqual(['PC', 'PlayStation 5', 'Xbox Series X/S', 'Switch']);
  });

  // Test 2: db failure
  // should return 500 + error message
  test('returns 500 if the database query fails', async () => {
    const dbError = new Error('Client connection reset by peer');
    mockQuery.mockRejectedValueOnce(dbError);

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const res = await GET();
    const data = await res.json();
    consoleSpy.mockRestore();

    expect(res.status).toBe(500);
    expect(data).toHaveProperty('error');
    expect(data.error).toContain('Client connection reset by peer');
  });

  // Test 3: no results
  // should return 200 + empty array
  test('returns an empty array if no platforms match', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual([]);
    expect(mockQuery).toHaveBeenCalledTimes(1);
  });
});
