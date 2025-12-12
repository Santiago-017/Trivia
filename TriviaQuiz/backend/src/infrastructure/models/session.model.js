const { DataTypes } = require('sequelize');
const { sequelize } = require('../../setup/database');

const Session = sequelize.define('Session', {
  session_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  host_id: { type: DataTypes.INTEGER, allowNull: false },
  game_code: { type: DataTypes.STRING(10), allowNull: false, unique: true },
  category: { type: DataTypes.STRING(100) },
  difficulty: { type: DataTypes.STRING(10) },
  num_questions: { type: DataTypes.INTEGER },
  mode: { type: DataTypes.STRING(10) },

  // ⭐ NUEVO CAMPO
  max_players: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 2
  },

  status: { type: DataTypes.STRING(15) },
  created_at: { type: DataTypes.DATE },
  started_at: { type: DataTypes.DATE },
  ended_at: { type: DataTypes.DATE }
}, {
  tableName: 'sessions',
  freezeTableName: true,
  timestamps: false
});

module.exports = Session;
