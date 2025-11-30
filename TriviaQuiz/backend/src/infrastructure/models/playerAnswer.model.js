
const { DataTypes } = require('sequelize');
const { sequelize } = require('../../setup/database');

const PlayerAnswer = sequelize.define('PlayerAnswer', {
  sessionId: { type: DataTypes.INTEGER },
  sessionQuestionId: { type: DataTypes.INTEGER },
  userId: { type: DataTypes.INTEGER },
  givenAnswer: DataTypes.JSON,
  isCorrect: DataTypes.BOOLEAN,
  responseTimeMs: DataTypes.INTEGER,
  answeredAt: DataTypes.DATE
}, { timestamps: true });

module.exports = PlayerAnswer;
