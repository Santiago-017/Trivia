
class ActivityLog {
  constructor({ id=null, userId=null, action='', sessionId=null, details=null, timestamp=null }) {
    this.id = id;
    this.userId = userId;
    this.action = action;
    this.sessionId = sessionId;
    this.details = details;
    this.timestamp = timestamp || new Date();
  }

  recordAction() { this.timestamp = new Date(); }
}

module.exports = ActivityLog;
