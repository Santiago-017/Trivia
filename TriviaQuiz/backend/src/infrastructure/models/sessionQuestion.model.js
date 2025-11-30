
const { DataTypes } = require('sequelize');
const { sequelize } = require('../../setup/database');

const SessionQuestion = sequelize.define('SessionQuestion', {
  sessionId: { type: DataTypes.INTEGER },
  externalQuestionId: DataTypes.STRING,
  category: DataTypes.STRING,
  difficulty: DataTypes.STRING,
  timeLimit: DataTypes.INTEGER,
  questionOrder: DataTypes.INTEGER,
  payload: DataTypes.JSON
}, { timestamps: true });

module.exports = SessionQuestion;
