
const { DataTypes } = require('sequelize');
const { sequelize } = require('../../setup/database');

const ActivityLog = sequelize.define('ActivityLog', {
  userId: DataTypes.INTEGER,
  action: DataTypes.STRING,
  sessionId: DataTypes.INTEGER,
  details: DataTypes.JSON,
  timestamp: DataTypes.DATE
}, { timestamps: true });

module.exports = ActivityLog;
