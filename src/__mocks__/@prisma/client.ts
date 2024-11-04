export const PrismaClient = jest.fn(() => ({
  user: {
      findMany: jest.fn().mockResolvedValue([{ id: 1, name: 'Test User' }]),
      findUnique: jest.fn().mockResolvedValue({ id: 1, name: 'Test User' }),
      create: jest.fn().mockResolvedValue({ id: 2, name: 'New User' }),
      update: jest.fn().mockResolvedValue({ id: 1, name: 'Updated User' }),
      delete: jest.fn().mockResolvedValue({ id: 1, name: 'Deleted User' }),
  },
}));
