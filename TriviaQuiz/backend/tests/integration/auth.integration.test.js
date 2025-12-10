// tests/integration/auth.integration.test.js

const express = require('express');
const request = require('supertest');

// En lugar de importar server.js, creamos una app de prueba
const authRoutes = require('../../src/routes/auth.routes');

// Mock del modelo de usuario
jest.mock('../../src/infrastructure/models/user.model', () => ({
  findOne: jest.fn(),
  create: jest.fn(),
}));
const UserModel = require('../../src/infrastructure/models/user.model');

// Mock de bcrypt y jwt
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

// 👉 Creamos la mini app de Express SOLO PARA LOS TESTS
function createTestApp() {
  const app = express();
  app.use(express.json());
  app.use('/auth', authRoutes);   // mismas rutas que en server.js
  return app;
}

describe('Auth integration', () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();
    app = createTestApp();   // nueva app limpia para cada test
  });

  test('POST /auth/register -> 200 y devuelve usuario', async () => {
    // arrange
    UserModel.findOne.mockResolvedValue(null); // email no existe
    bcrypt.hash.mockResolvedValue('hash-fake');
    UserModel.create.mockResolvedValue({
      user_id: 1,
      username: 'santi',
      email: 'test@example.com',
    });

    // act
    const res = await request(app)
      .post('/auth/register')
      .send({
        username: 'santi',
        email: 'test@example.com',
        password: '123456',
      });

    // assert
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.user).toEqual({
      id: 1,
      username: 'santi',
      email: 'test@example.com',
    });
  });

  test('POST /auth/login -> 200 y devuelve token', async () => {
    // arrange
    UserModel.findOne.mockResolvedValue({
      user_id: 1,
      username: 'santi',
      email: 'test@example.com',
      password_hash: 'hash',
    });
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue('fake-jwt-token');

    // act
    const res = await request(app)
      .post('/auth/login')
      .send({
        username: 'santi',
        password: '123456',
      });

    // assert
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.token).toBe('fake-jwt-token');
    expect(res.body.user).toEqual({
      id: 1,
      username: 'santi',
      email: 'test@example.com',
    });
  });
});
