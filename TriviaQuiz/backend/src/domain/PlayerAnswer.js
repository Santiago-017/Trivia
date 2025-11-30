
class PlayerAnswer {
  constructor({ id=null, sessionId, sessionQuestionId, userId, nickname=null, isCorrect=false, responseTimeMs=null, answeredAt=null, givenAnswer=null }) {
    this.id = id;
    this.sessionId = sessionId;
    this.sessionQuestionId = sessionQuestionId;
    this.userId = userId;
    this.nickname = nickname;
    this.isCorrect = isCorrect;
    this.responseTimeMs = responseTimeMs;
    this.answeredAt = answeredAt;
    this.givenAnswer = givenAnswer;
  }

  evaluateAnswer(correctOption) { this.isCorrect = this.givenAnswer === correctOption; return this.isCorrect; }
  recordResponse() { this.answeredAt = new Date(); }
}

module.exports = PlayerAnswer;
