import { GET } from './route';
import pool from '@/lib/db';

const mockPool = pool as jest.Mocked<typeof pool>;
const mockQuery = mockPool.query as jest.Mock;

// Mock class to simulate complex DB values like NUMERIC/BIGINT
class DBValueMock {
  private value: number | string;
  constructor(value: number | string) {
    this.value = value;
  }
  toString() {
    return String(this.value);
  }
  valueOf() {
    return this.value;
  }
}

describe('GET /esports-ecosystem-value', () => {
  beforeEach(() => {
    mockQuery.mockClear();
  });

  // Test 1: success case
  test('returns a list of esports ecosystem values with all numbers converted to strings', async () => {
    const mockData = {
      rows: [
        {
          game_name: 'CS: GO',
          tournament_prizes: new DBValueMock(1200000000),
          player_earnings: new DBValueMock(500000000),
          team_earnings: new DBValueMock(200000000),
          total_ecosystem_value: new DBValueMock(1900000000),
        },
        {
          game_name: 'Dota 2',
          tournament_prizes: new DBValueMock(900000000),
          player_earnings: new DBValueMock(100000000),
          team_earnings: new DBValueMock(50000000),
          total_ecosystem_value: new DBValueMock(1050000000),
        },
      ],
    };
    mockQuery.mockResolvedValueOnce(mockData);

    const res = await GET();
    const data = await res.json();

    // Make sure query ran once and has the expected parts
    expect(mockQuery).toHaveBeenCalledTimes(1);
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringMatching(/SELECT\s+gm\.game_name/i)
    );
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringMatching(/WHERE\s+COALESCE/i)
    );

    expect(res.status).toBe(200);
    expect(data).toEqual([
      {
        game_name: 'CS: GO',
        tournament_prizes: '1200000000',
        player_earnings: '500000000',
        team_earnings: '200000000',
        total_ecosystem_value: '1900000000',
      },
      {
        game_name: 'Dota 2',
        tournament_prizes: '900000000',
        player_earnings: '100000000',
        team_earnings: '50000000',
        total_ecosystem_value: '1050000000',
      },
    ]);
  });

  // Test 2: DB failure
  test('returns 500 if the database query fails', async () => {
    mockQuery.mockRejectedValueOnce(new Error('Permission denied for database user'));

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const res = await GET();
    const data = await res.json();
    consoleSpy.mockRestore();

    expect(res.status).toBe(500);
    expect(data).toHaveProperty('error');
    expect(data.error).toContain('Permission denied for database user');
  });

  // Test 3: empty data
  test('returns an empty array when no data is found', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual([]);
    expect(mockQuery).toHaveBeenCalledTimes(1);
  });
});
