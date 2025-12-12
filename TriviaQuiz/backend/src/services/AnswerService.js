const Session = require('../infrastructure/models/session.model');
const SessionQuestion = require('../infrastructure/models/sessionQuestion.model');
const PlayerAnswer = require('../infrastructure/models/playerAnswer.model');
const SessionPlayer = require('../infrastructure/models/sessionPlayer.model');

class AnswerService {
  /**
   * data: { sessionId, userId, questionOrder, selectedOption }
   */
  static async handleAnswer(data) {
    const sessionId = data.sessionId;
    const userId = data.rest.userId;
    const questionOrder = data.rest.questionOrder;
    const selectedOption = data.rest.selectedOption;
    

    // ====== GUARDAS ======
    if (sessionId == null) throw new Error('sessionId faltante');
    if (userId == null) throw new Error('userId faltante');
    if (questionOrder == null) throw new Error('questionOrder faltante');

    // ====== SESIÓN ======
    const session = await Session.findByPk(sessionId);
    if (!session) throw new Error('Session no encontrada');

    const mode = (session.mode || 'vs').toLowerCase(); // 'vs' | 'coop'

    // ====== PREGUNTA ======
    const sessionQuestion = await SessionQuestion.findOne({
      where: { sessionId, questionOrder }
    });
    if (!sessionQuestion) {
      throw new Error('SessionQuestion no encontrada');
    }

    const payload = sessionQuestion.payload || {};
    if (!payload.correct) {
      throw new Error('El payload no contiene "correct"');
    }

    // ====== VALIDACIÓN ======
    const selected = (selectedOption ?? '').trim();
    const correct = (payload.correct ?? '').trim();
    const isCorrect = selected === correct;

    // ====== LOG DE RESPUESTA ======
    await PlayerAnswer.create({
      sessionId,
      sessionQuestionId:
        sessionQuestion.session_question_id || sessionQuestion.id,
      userId,
      givenAnswer: { selectedOption: selectedOption ?? null },
      isCorrect,
      responseTimeMs: null,
      answeredAt: new Date()
    });

    // ====== CONSTANTES DE SCORING ======
    const BASE_OK = 1000;
    const BASE_WRONG = 500;

    const clamp = (x, min, max) => Math.max(min, Math.min(max, x));

    // =====================================================================
    // =============================== COOP ================================
    // =====================================================================
    if (mode === 'coop') {
      let teamStreak = session.team_streak ?? 0;
      let delta = 0;

      if (isCorrect) {
        teamStreak = teamStreak >= 0 ? teamStreak + 1 : 1;

        const bonusMult = clamp(1 + 0.15 * (teamStreak - 1), 1, 2.0);
        delta = Math.round(BASE_OK * bonusMult);

        session.team_score = (session.team_score ?? 0) + delta;
      } else {
        teamStreak = teamStreak <= 0 ? teamStreak - 1 : -1;

        const penaltyMult = clamp(
          1 + 0.25 * (Math.abs(teamStreak) - 1),
          1,
          3.0
        );
        delta = -Math.round(BASE_WRONG * penaltyMult);

        session.team_score = Math.max(0, (session.team_score ?? 0) + delta);
      }

      session.team_streak = teamStreak;
      await session.save();

      return {
        mode,
        sessionId,
        userId,
        questionOrder,
        selectedOption,
        correctAnswer: correct,
        isCorrect,
        delta,
        teamScore: session.team_score,
        teamStreak
      };
    }

    // =====================================================================
    // ================================ VS =================================
    // =====================================================================

    const sp = await SessionPlayer.findOne({
      where: { sessionId, userId }
    });

    if (!sp) {
      throw new Error(
        'SessionPlayer no existe (debe crearse en joinSession)'
      );
    }

    let streak = sp.streak ?? 0;
    let delta = 0;

    if (isCorrect) {
      streak = streak >= 0 ? streak + 1 : 1;

      const bonusMult = clamp(1 + 0.15 * (streak - 1), 1, 2.0);
      delta = Math.round(BASE_OK * bonusMult);

      sp.score = (sp.score ?? 0) + delta;
    } else {
      streak = streak <= 0 ? streak - 1 : -1;

      const penaltyMult = clamp(
        1 + 0.25 * (Math.abs(streak) - 1),
        1,
        3.0
      );
      delta = -Math.round(BASE_WRONG * penaltyMult);

      sp.score = Math.max(0, (sp.score ?? 0) + delta);
    }

    sp.streak = streak;
    await sp.save();

    return {
      mode,
      sessionId,
      userId,
      questionOrder,
      selectedOption,
      correctAnswer: correct,
      isCorrect,
      delta,
      newScore: sp.score,
      streak
    };
  }
}

module.exports = AnswerService;
