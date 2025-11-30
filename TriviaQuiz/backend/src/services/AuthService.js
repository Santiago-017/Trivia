const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserModel = require('../infrastructure/models/user.model');

class AuthService {

  async register({ username, email, password }) {

    const exists = await UserModel.findOne({ where: { email } });
    if (exists) throw new Error('Email already registered');

    const passwordHash = await bcrypt.hash(password, 10);

    const u = await UserModel.create({
      username,
      email,
      password_hash: passwordHash,
      created_at: new Date()
    });

    return {
      id: u.user_id,
      username: u.username,
      email: u.email
    };
  }

  async login({ username, password }) {

    const u = await UserModel.findOne({ where: { username } });
    if (!u) throw new Error('Invalid credentials');

    const valid = await bcrypt.compare(password, u.password_hash);
    if (!valid) throw new Error('Invalid credentials');

    const token = jwt.sign(
      { id: u.user_id, username: u.username },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    return {
      token,
      user: {
        id: u.user_id,
        username: u.username,
        email: u.email
      }
    };
  }
}

module.exports = new AuthService();
