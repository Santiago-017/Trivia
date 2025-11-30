
const { Sequelize } = require('sequelize');
const host = process.env.DB_HOST || 'localhost';
const port = process.env.DB_PORT || 3306;
const user = process.env.DB_USER || 'root';
const pass = process.env.DB_PASS || '22r7iuaf';
const name = process.env.DB_NAME || 'TRIVIADB';

const sequelize = new Sequelize(name, user, pass, {
  host,
  port,
  dialect: 'mysql',
  logging: false,
  pool: { max: 10, min: 0, acquire: 30000, idle: 10000 }
});

module.exports = { sequelize };
