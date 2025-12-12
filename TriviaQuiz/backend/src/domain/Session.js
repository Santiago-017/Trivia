
class Session {
  constructor({ id=null, hostId, gameCode, category=null, difficulty=null, numQuestions=10, mode=null, status='pending', createdAt=null, startedAt=null, endedAt=null }) {
    this.id = id;
    this.hostId = hostId;
    this.gameCode = gameCode;
    this.category = category;
    this.difficulty = difficulty;
    this.mode = mode;
    this.numQuestions = numQuestions;
    this.status = status;
    this.createdAt = createdAt;
    this.startedAt = startedAt;
    this.endedAt = endedAt;
    this.questions = [];
    this.players = [];
  }

  start() { this.startedAt = new Date(); this.status = 'started'; }
  end() { this.endedAt = new Date(); this.status = 'ended'; }
  assignQuestions(questions) { this.questions = questions; }
  addPlayer(player) { this.players.push(player); }
  removePlayer(userId) { this.players = this.players.filter(p => p.userId !== userId); }
}

module.exports = Session;
