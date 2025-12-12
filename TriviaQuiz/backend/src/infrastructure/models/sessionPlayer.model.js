
const { DataTypes } = require('sequelize');
const { sequelize } = require('../../setup/database');

const SessionPlayer = sequelize.define('SessionPlayer', {
  sessionId: { type: DataTypes.INTEGER },
  userId: { type: DataTypes.INTEGER },
  joinedAt: DataTypes.DATE,
  leftAt: DataTypes.DATE,
  score: DataTypes.INTEGER,
  active: DataTypes.BOOLEAN,
  nickname: DataTypes.STRING,
  streak: DataTypes.INTEGER 
}, { timestamps: true });

module.exports = SessionPlayer;
