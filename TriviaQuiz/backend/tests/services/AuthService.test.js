// tests/services/AuthService.test.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

jest.mock('../../src/infrastructure/models/user.model', () => ({
  findOne: jest.fn(),
  create: jest.fn(),
}));
const UserModel = require('../../src/infrastructure/models/user.model');

const AuthService = require('../../src/services/AuthService');

jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('register registra un usuario cuando el email no existe', async () => {
    UserModel.findOne.mockResolvedValue(null);
    bcrypt.hash.mockResolvedValue('hash-fake');
    UserModel.create.mockResolvedValue({
      user_id: 1,
      username: 'santi',
      email: 'test@example.com',
    });

    const result = await AuthService.register({
      username: 'santi',
      email: 'test@example.com',
      password: '123456',
    });

    expect(UserModel.findOne).toHaveBeenCalledWith({
      where: { email: 'test@example.com' },
    });
    expect(UserModel.create).toHaveBeenCalled();
    expect(result).toEqual({
      id: 1,
      username: 'santi',
      email: 'test@example.com',
    });
  });

  test('login devuelve token y usuario si las credenciales son válidas', async () => {
    UserModel.findOne.mockResolvedValue({
      user_id: 1,
      username: 'santi',
      email: 'test@example.com',
      password_hash: 'hash',
    });
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue('fake-jwt-token');

    const result = await AuthService.login({
      username: 'santi',
      password: '123456',
    });

    expect(UserModel.findOne).toHaveBeenCalledWith({
      where: { username: 'santi' },
    });
    expect(result.token).toBe('fake-jwt-token');
    expect(result.user).toEqual({
      id: 1,
      username: 'santi',
      email: 'test@example.com',
    });
  });
});
