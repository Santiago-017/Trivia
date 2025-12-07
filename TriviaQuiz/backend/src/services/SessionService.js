const SessionModel = require('../infrastructure/models/session.model');
const SessionQuestionModel = require('../infrastructure/models/sessionQuestion.model');
const SessionPlayerModel = require('../infrastructure/models/sessionPlayer.model');
const PlayerAnswerModel = require('../infrastructure/models/playerAnswer.model');
const fetch = require('node-fetch');

class SessionService {

  async createSession({ hostId, category, difficulty, numQuestions, maxPlayers }) {
    console.log("Creating session for hostId:", hostId, numQuestions);

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

  // ✅ Si en algún momento usas esto, también debe ir con sessionId
  async addQuestionsFromExternalAPI(sessionId, questionsArray) {
    const created = [];
    for (let i = 0; i < questionsArray.length; i++) {
      const q = questionsArray[i];
      const doc = await SessionQuestionModel.create({
        sessionId: sessionId,                   // 🔧 ANTES: session_id
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

  // (si la usas) hay que corregirla, estaba rota
  async joinSession(sessionId, userId, nickname) {
    const session = await SessionModel.findByPk(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const currentPlayers = await SessionPlayerModel.count({
      where: { sessionId: sessionId }          // 🔧 ANTES: session_id
    });

    if (currentPlayers >= session.max_players) {
      throw new Error('Session is full');
    }

    const sp = await SessionPlayerModel.create({
      sessionId: sessionId,                   // 🔧 ANTES: session_id
      userId: userId,                         // 🔧 ANTES: user_id
      joinedAt: new Date(),
      score: 0,
      active: true,
      nickname
    });
    return sp;
  }

  async recordAnswer(sessionId, sessionQuestionId, userId, givenAnswer, responseTimeMs) {
    const pa = await PlayerAnswerModel.create({
      sessionId: sessionId,                   // 🔧 ANTES: session_id
      sessionQuestionId: sessionQuestionId,   // 🔧 ANTES: session_question_id
      userId: userId,                         // 🔧 ANTES: user_id
      givenAnswer,
      responseTimeMs,
      answeredAt: new Date()
    });
    return pa;
  }

  async startSession(sessionId) {
  console.log("Iniciando sesión:", sessionId);
  const session = await SessionModel.findByPk(sessionId);

  if (!session) {
    throw new Error('Session not found');
  }

  // 1) Marcar la sesión como iniciada
  session.status = 'started';
  session.started_at = new Date();   // usa el nombre de columna que ya tenías
  await session.save();

  // 2) Generar SIEMPRE las preguntas desde la API para esta sesión
  console.log('Generando preguntas desde la API para la sesión:', sessionId);
  const questions = await this.generateQuestionsFromAPI(sessionId);

  console.log('Preguntas generadas para la sesión:', questions.length);

  // 3) Tomar la primera
  const firstQuestion = questions[0];
  console.log('Primera pregunta para la sesión:', firstQuestion.payload);

  if (!firstQuestion) {
    throw new Error('First question not found');
  }

  return {
    sessionId,
    status: "started",
    firstQuestion: firstQuestion.payload
  };    
}


  async getNextQuestion(sessionId, currentQuestionOrder) {
  const question = await SessionQuestionModel.findOne({
    where: {
      sessionId: sessionId,                   // 🔧 ANTES: session_id
      questionOrder: parseInt(currentQuestionOrder) 
    }
  });
  if (!question) {
    return { finished: true };
  }
  console.log('Siguiente pregunta obtenida:', question.payload);
  return { finished: false, question: question.payload };
}


  async joinSessionByCode(gameCode, userId, nickname) {
    // 1. Buscar la sesión por game_code
    const session = await SessionModel.findOne({ where: { game_code: gameCode } });

    if (!session) {
      throw new Error('Session not found');
    }

    // Tu modelo Session tiene session_id como PK
    const sessionId = session.session_id;

    if (sessionId == null) {
      console.error('⚠️ session.session_id es null/undefined. Session encontrado:', session);
      throw new Error('Invalid session id');
    }

    // 2. Contar jugadores en esa sesión
    const currentPlayers = await SessionPlayerModel.count({
      where: { sessionId: sessionId }       // usamos atributo JS
    });

    if (currentPlayers >= session.max_players) {
      throw new Error('Session is full');
    }

    // 3. Crear jugador
    const player = await SessionPlayerModel.create({
      sessionId: sessionId,
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

    // 2. Reusar la lógica existente con el id interno (session_id)
    return this.getNextQuestion(session.session_id, currentQuestionOrder);
  }

  async generateQuestionsFromAPI(sessionId) {
    const session = await SessionModel.findByPk(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }
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

    const category = session.category;
    const difficulty = session.difficulty.toLowerCase();
    const amount = session.num_questions;

    // 1) Llamar API externa
    const url = `https://opentdb.com/api.php?amount=${amount}&category=${categoryId}&difficulty=${difficulty}&type=multiple`;
    const apiResp = await fetch(url);
    const data = await apiResp.json();

    console.log("Preguntas obtenidas de API externa:", data.results?.length || 0);

    if (!data.results || data.results.length === 0) {
      throw new Error('No questions found from API');
    }

    // 2) Guardar las preguntas en la base de datos
    const createdQuestions = [];
    for (let i = 0; i < data.results.length; i++) {
      const q = data.results[i];

      const allOptions = [
        q.correct_answer,
        ...q.incorrect_answers
      ];

      // mezcla aleatoria
      allOptions.sort(() => Math.random() - 0.5);

      const doc = await SessionQuestionModel.create({
        sessionId: sessionId,
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

    return createdQuestions;
  }
}

module.exports = new SessionService();
