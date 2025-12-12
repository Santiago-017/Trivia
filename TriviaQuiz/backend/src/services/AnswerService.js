// backend/src/services/AnswerService.js
const SessionQuestion = require('../infrastructure/models/sessionQuestion.model');
const PlayerAnswer = require('../infrastructure/models/playerAnswer.model');
const SessionPlayer = require('../infrastructure/models/sessionPlayer.model');

class AnswerService {
  /**
   * data: { sessionId, userId, questionOrder, selectedOption }
   */
  static async handleAnswer(data) {
    const {
      sessionId,
      userId,
      questionOrder,
      selectedOption
    } = data;

    console.log('AnswerService.handleAnswer →', data);

    // 1) Buscar la pregunta de esa sesión y orden
    const sessionQuestion = await SessionQuestion.findOne({
      where: { sessionId, questionOrder }
    });

    if (!sessionQuestion) {
      throw new Error('SessionQuestion no encontrada para esa sesión y orden');
    }

    const payload = sessionQuestion.payload || {};

    // 2) Validar que el payload tenga la respuesta correcta
    if (!payload.correct) {
      throw new Error('El payload no contiene el campo "correct"');
    }

    // Normalizar textos
    const selected = (selectedOption ?? '').trim();
    const correct = (payload.correct ?? '').trim();

    // 3) Comparación DIRECTA por contenido
    const isCorrect = selected === correct;

    // 4) Sistema de puntos
    const basePoints = 1000;
    const points = isCorrect ? basePoints : 0;

    // 5) Guardar en PlayerAnswer
    await PlayerAnswer.create({
      sessionId,
      sessionQuestionId:
        sessionQuestion.session_question_id || sessionQuestion.id,
      userId,
      givenAnswer: {
        selectedOption: selectedOption ?? null
      },
      isCorrect,
      responseTimeMs: null,
      answeredAt: new Date()
    });

    // 6) Actualizar puntaje en SessionPlayer (si es correcto)
    let newScore = null;
    if (isCorrect && points > 0) {
      await SessionPlayer.increment(
        { score: points },
        { where: { sessionId, userId } }
      );

      const sp = await SessionPlayer.findOne({ where: { sessionId, userId } });
      newScore = sp ? sp.score : null;
    }

    // 7) Devolver resultado al front
    return {
      sessionId,
      userId,
      questionOrder,
      selectedOption,
      correctAnswer: correct,
      isCorrect,
      points,
      newScore
    };
  }
}

module.exports = AnswerService;
