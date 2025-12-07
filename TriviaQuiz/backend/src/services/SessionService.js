const SessionModel = require('../infrastructure/models/session.model');
const SessionQuestionModel = require('../infrastructure/models/sessionQuestion.model');
const SessionPlayerModel = require('../infrastructure/models/sessionPlayer.model');
const PlayerAnswerModel = require('../infrastructure/models/playerAnswer.model');
const fetch = require('node-fetch');
class SessionService {
  async createSession({ hostId, category, difficulty, numQuestions, maxPlayers }) {

    const code = Math.random().toString(36).substring(2, 8).toUpperCase();

    const s = await SessionModel.create({
      host_id: hostId,            // ⭐ Match con el modelo
      game_code: code,            // ⭐ Match con el modelo
      category,
      difficulty,
      num_questions: numQuestions, // ⭐ Match con el modelo
      max_players: maxPlayers,     // ⭐ Match con el modelo
      status: 'pending',
      created_at: new Date()
    });

    return s;
  }

  async addQuestionsFromExternalAPI(sessionId, questionsArray) {
    const created = [];
    for (let i = 0; i < questionsArray.length; i++) {
      const q = questionsArray[i];
      const doc = await SessionQuestionModel.create({
        session_id: sessionId,
        externalQuestionId: q.externalQuestionId || null,
        payload: q.payload || q,
        category: q.category || null,
        difficulty: q.difficulty || null,
        timeLimit: q.timeLimit || 20000,
        questionOrder: i
      });
      created.push(doc);
    }
    return created;
  }

  async joinSession(sessionId, userId, nickname) {
    const currentPlayers = await SessionPlayerModel.count({ where: { session_id: sessionId } });
    if (currentPlayers >= session.max_players) {
      throw new Error('Session is full');
  }
    const sp = await SessionPlayerModel.create({
      session_id: sessionId,
      user_id: userId,
      joinedAt: new Date(),
      score: 0,
      active: true,
      nickname
    });
    return sp;
  }

  async recordAnswer(sessionId, sessionQuestionId, userId, givenAnswer, responseTimeMs) {
    const pa = await PlayerAnswerModel.create({
      session_id: sessionId,
      session_question_id: sessionQuestionId,
      user_id: userId,
      givenAnswer,
      responseTimeMs,
      answeredAt: new Date()
    });
    return pa;
  }
  async startSession(sessionId) {
    const session = await SessionModel.findByPk(sessionId);
    const CATEGORY_MAP = {
      GENERAL: 9,
      SCIENCE: 17,
      HISTORY: 23,
      SPORTS: 21
    };
    const categoryText = session.category;
    const categoryId = CATEGORY_MAP[categoryText];

    if (!categoryId) {
      throw new Error(`Category ${categoryText} does not exist in CATEGORY_MAP`);
    }

    if (!session) {
      throw new Error('Session not found');
    }
    session.status = 'started';
    session.started_at = new Date();
    await session.save();
    
    const category = session.category;
    const difficulty = session.difficulty.toLowerCase();
    console.log(difficulty);
    console.log(categoryId);
    const amount = session.num_questions;

    // 2) Llamar API externa
    const url = `https://opentdb.com/api.php?amount=${amount}&category=${categoryId}&difficulty=${difficulty}&type=multiple`;
    const apiResp = await fetch(url);
    const data = await apiResp.json();
    //console.log("API RESPONSE RAW:", data);
    //console.log("API RESULTS:", data.results);

    if (!data.results || data.results.length === 0) {
      throw new Error('No questions found from API');
    }

    // 3) Guardar las preguntas en la base de datos
    let createdQuestions = [];
    for (let i = 0; i < data.results.length; i++) {
      const q = data.results[i];

      const allOptions = [
        q.correct_answer,
        ...q.incorrect_answers
      ];

      // mezcla aleatoria
      allOptions.sort(() => Math.random() - 0.5);

      const doc = await SessionQuestionModel.create({
        session_id: sessionId,
        externalQuestionId: null,
        payload: {
          question: q.question,
          correct: q.correct_answer,
          options: allOptions
        },
        category,
        difficulty,
        timeLimit: 10000,
        questionOrder: i
      });

      createdQuestions.push(doc);
    }

    // 4) Primera pregunta
    const first = createdQuestions[0];

    return {
      sessionId,
      status: "started",
      firstQuestion: first
    };
  }
  async getNextQuestion(sessionId, currentQuestionOrder) {
  const session = await SessionModel.findByPk(sessionId);
  if (!session) {
    throw new Error('Session not found');
  }

  const nextOrder = parseInt(currentQuestionOrder) + 1;

  console.log("Buscando siguiente pregunta:", nextOrder);

  const nextQuestion = await SessionQuestionModel.findOne({
    where: { 
      session_id: sessionId,
      questionOrder: nextOrder
    },
    order: [['questionOrder', 'ASC']]
  });

  if (!nextQuestion) {
    console.log("✅ Fin del juego");
    session.status = 'finished';
    await session.save();

    return {
      finished: true,
      message: "Juego terminado"
    };
  }

  return {
    finished: false,
    question: nextQuestion
  };
}

async joinSessionByCode(gameCode, userId, nickname) {
  // 1. Buscar la sesión por game_code
  const session = await SessionModel.findOne({ where: { game_code: gameCode } });

  if (!session) {
    throw new Error('Session not found');
  }

  // 👇 AQUÍ ESTABA EL PROBLEMA
  // Tu modelo tiene "session_id", no "id"
  const sessionId = session.session_id; 

  if (sessionId == null) {
    console.error('⚠️ session.session_id es null/undefined. Session encontrado:', session);
    throw new Error('Invalid session id');
  }

  // 2. Contar jugadores en esa sesión
  const currentPlayers = await SessionPlayerModel.count({
    where: { sessionId: sessionId } // atributo JS de SessionPlayer
  });

  if (currentPlayers >= session.max_players) {
    throw new Error('Session is full');
  }

  // 3. Crear jugador
  const player = await SessionPlayerModel.create({
    sessionId: sessionId,    // FK hacia Session (session_id en BD si lo mapeaste así)
    userId: userId,
    joinedAt: new Date(),
    score: 0,
    active: true,
    nickname
  });

  // 4. Devolver ambos objetos
  return { session, player };
}

async getNextQuestionByCode(gameCode, currentQuestionOrder) {
  // 1. Buscar la sesión por game_code
  const session = await SessionModel.findOne({ where: { game_code: gameCode } });
  if (!session) {
    throw new Error('Session not found');
  }

  // 2. Reusar la lógica existente con el id interno
  return this.getNextQuestion(session.id, currentQuestionOrder);
}

}

module.exports = new SessionService();
