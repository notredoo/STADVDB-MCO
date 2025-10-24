const mockQuery = jest.fn();

const mockPool = {
  query: mockQuery,
  connect: jest.fn(),
  end: jest.fn(),
};

mockQuery.mockClear();

export default mockPool;