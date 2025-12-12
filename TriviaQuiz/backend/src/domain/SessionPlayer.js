
class SessionPlayer {
  constructor({ id=null, sessionId, userId, joinedAt=null, leftAt=null, score=0, active=false, nickname=null , streak=0 }) {
    this.id = id;
    this.sessionId = sessionId;
    this.userId = userId;
    this.joinedAt = joinedAt;
    this.leftAt = leftAt;
    this.streak = streak;
    this.score = score;
    this.active = active;
    this.nickname = nickname;
  }

  joinSession() { this.active = true; this.joinedAt = new Date(); }
  leaveSession() { this.active = false; this.leftAt = new Date(); }
  updateScore(points) { this.score += points; }
}

module.exports = SessionPlayer;
