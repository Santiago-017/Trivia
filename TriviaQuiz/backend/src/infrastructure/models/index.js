// backend/src/infrastructure/models/index.js

// OJO: aquí NO necesitamos importar sequelize, porque
// cada modelo ya importa { sequelize } desde ../../setup/database

const User = require('./user.model');
const Session = require('./session.model');
const SessionQuestion = require('./sessionQuestion.model');
const SessionPlayer = require('./sessionPlayer.model');
const PlayerAnswer = require('./playerAnswer.model');
const ActivityLog = require('./activityLog.model');

// ========== RELACIONES ==========

// Session ↔ User (host)
Session.belongsTo(User, { foreignKey: 'host_id', as: 'host' });
User.hasMany(Session, { foreignKey: 'host_id', as: 'hostedSessions' });

// SessionPlayer ↔ Session
SessionPlayer.belongsTo(Session, { foreignKey: 'sessionId', as: 'session' });
Session.hasMany(SessionPlayer, { foreignKey: 'sessionId', as: 'players' });

// SessionPlayer ↔ User
SessionPlayer.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(SessionPlayer, { foreignKey: 'userId', as: 'sessionPlayers' });

// SessionQuestion ↔ Session
SessionQuestion.belongsTo(Session, { foreignKey: 'sessionId', as: 'session' });
Session.hasMany(SessionQuestion, { foreignKey: 'sessionId', as: 'questions' });

// PlayerAnswer ↔ Session
PlayerAnswer.belongsTo(Session, { foreignKey: 'sessionId', as: 'session' });
Session.hasMany(PlayerAnswer, { foreignKey: 'sessionId', as: 'answers' });

// PlayerAnswer ↔ SessionQuestion
PlayerAnswer.belongsTo(SessionQuestion, { foreignKey: 'sessionQuestionId', as: 'sessionQuestion' });
SessionQuestion.hasMany(PlayerAnswer, { foreignKey: 'sessionQuestionId', as: 'answers' });

// PlayerAnswer ↔ User
PlayerAnswer.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(PlayerAnswer, { foreignKey: 'userId', as: 'answers' });

// ActivityLog ↔ User
ActivityLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(ActivityLog, { foreignKey: 'userId', as: 'activityLogs' });

// ActivityLog ↔ Session
ActivityLog.belongsTo(Session, { foreignKey: 'sessionId', as: 'session' });
Session.hasMany(ActivityLog, { foreignKey: 'sessionId', as: 'activityLogs' });

module.exports = {
  User,
  Session,
  SessionQuestion,
  SessionPlayer,
  PlayerAnswer,
  ActivityLog
};
