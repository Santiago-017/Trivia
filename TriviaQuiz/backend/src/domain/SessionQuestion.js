
class SessionQuestion {
  constructor({ id=null, sessionId, category=null, difficulty=null, timeLimit=20000, questionOrder=0, externalQuestionId=null, payload={} }) {
    this.id = id;
    this.sessionId = sessionId;
    this.category = category;
    this.difficulty = difficulty;
    this.timeLimit = timeLimit;
    this.questionOrder = questionOrder;
    this.externalQuestionId = externalQuestionId;
    this.payload = payload;
  }

  setOrder(order) { this.questionOrder = order; }
}

module.exports = SessionQuestion;
