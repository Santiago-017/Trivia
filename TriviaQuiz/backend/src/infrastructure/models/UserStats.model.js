const { DataTypes } = require('sequelize');
const { sequelize } = require('../../setup/database');

const UserStats = sequelize.define('UserStats', {
  user_id: {
    type: DataTypes.INTEGER,
    primaryKey: true
  },
  games_played: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  average_score: {
    type: DataTypes.DECIMAL(5,2),
    defaultValue: 0
  },
  highest_score: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  average_accuracy: {
    type: DataTypes.DECIMAL(5,2),
    defaultValue: 0
  },
  total_play_time: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'user_stats',
  freezeTableName: true,
  timestamps: false
});

module.exports = UserStats;
