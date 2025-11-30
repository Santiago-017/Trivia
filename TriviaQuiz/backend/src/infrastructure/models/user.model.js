const { DataTypes } = require('sequelize');
const { sequelize } = require('../../setup/database');

const User = sequelize.define('User', {
  user_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: { type: DataTypes.STRING(50), allowNull: false, unique: true },
  email: { type: DataTypes.STRING(100), unique: true },
  password_hash: { type: DataTypes.STRING(255), allowNull: false },
  role: { type: DataTypes.STRING(10), defaultValue: 'player' },
  avatar_url: { type: DataTypes.STRING(255) },
  created_at: { type: DataTypes.DATE },
  last_login: { type: DataTypes.DATE }
}, {
  tableName: 'users',
  freezeTableName: true,
  timestamps: false
});

module.exports = User;
