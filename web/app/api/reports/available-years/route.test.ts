import { GET } from './route';
import pool from '@/lib/db';

const mockPool = pool as jest.Mocked<typeof pool>;
const mockQuery = mockPool.query as jest.Mock;

describe('GET /available-years', () => {
  beforeEach(() => {
    mockQuery.mockClear();
  });

  // Test 1: success case
  test('returns a list of distinct years in descending order', async () => {
    const mockData = {
      rows: [
        { year: 2024 },
        { year: 2023 },
        { year: 2022 },
        { year: 2021 },
      ],
    };
    mockQuery.mockResolvedValueOnce(mockData);

    const res = await GET();
    const data = await res.json();

    expect(mockQuery).toHaveBeenCalledTimes(1);
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringMatching(/SELECT\s+DISTINCT\s+year\s+FROM\s+fact_sales\s+ORDER\s+BY\s+year\s+DESC/i)
    );

    expect(res.status).toBe(200);
    expect(data).toEqual(['2024', '2023', '2022', '2021']);
  });

  // Test 2: db failure
  test('returns 500 if the database query fails', async () => {
    const dbError = new Error('Could not connect to database');
    mockQuery.mockRejectedValueOnce(dbError);

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const res = await GET();
    const data = await res.json();
    consoleSpy.mockRestore();

    expect(res.status).toBe(500);
    expect(data).toHaveProperty('error');
    expect(data.error).toContain('Could not connect to database');
  });

  // Test 3: no results
  test('returns an empty array when no years are found', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual([]);
    expect(mockQuery).toHaveBeenCalledTimes(1);
  });
});
