const SessionService = require('../services/SessionService');

exports.createSession = async (req, res) => {
  try {
    const hostId = req.user.id;
    const doc = await SessionService.createSession({
      hostId,
      category: req.body.category,
      difficulty: req.body.difficulty,
      numQuestions: req.body.numQuestions,
      maxPlayers: req.body.maxPlayers
    });
    res.json({ ok: true, session: doc });
  } catch (err) {
    res.status(400).json({ ok: false, msg: err.message });
    console.log(err);
  }
};

exports.addQuestions = async (req, res) => {
  try {
    const added = await SessionService.addQuestionsFromExternalAPI(
      req.params.sessionId,
      req.body.questions
    );
    res.json({ ok: true, added });
  } catch (err) {
    res.status(400).json({ ok: false, msg: err.message });
  }
};

exports.join = async (req, res) => {
  try {
    const sp = await SessionService.joinSession(
      req.params.sessionId,
      req.user.id,
      req.body.nickname
    );
    res.json({ ok: true, player: sp });
  } catch (err) {
    res.status(400).json({ ok: false, msg: err.message });
  }
};

// 🔹 Opción B: unirse usando el código de la sala (game_code)
exports.joinByCode = async (req, res) => {
  try {
    const { gameCode, nickname } = req.body;
    const userId = req.user.id;

    const { session, player } = await SessionService.joinSessionByCode(
      gameCode,
      userId,
      nickname
    );

    res.json({
      ok: true,
      sessionId: session.id,
      gameCode: session.game_code,
      player
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ ok: false, msg: err.message });
  }
};

exports.recordAnswer = async (req, res) => {
  try {
    const pa = await SessionService.recordAnswer(
      req.params.sessionId,
      req.body.sessionQuestionId,
      req.user.id,
      req.body.givenAnswer,
      req.body.responseTimeMs
    );
    res.json({ ok: true, answer: pa });
  } catch (err) {
    res.status(400).json({ ok: false, msg: err.message });
  }
};

exports.start = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const result = await SessionService.startSession(sessionId);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al iniciar juego' });
  }
};
exports.nextQuestion = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { currentQuestionOrder } = req.query; // <-- AQUÍ SE TOMA EL ORDEN

    const result = await SessionService.getNextQuestion(sessionId, currentQuestionOrder);

    res.json({ ok: true, ...result });
  } catch (err) {
    console.error(err);
    res.status(400).json({ ok: false, msg: err.message });
  }
};

exports.answerQuestion = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { sessionQuestionId, givenAnswer, responseTimeMs } = req.body;
    const result = await SessionService.answerQuestion(
      sessionId,
      sessionQuestionId,
      req.user.id,
      givenAnswer,
      responseTimeMs
    );
    res.json({ ok: true, ...result });
  } catch (err) {
    console.error(err);
    res.status(400).json({ ok: false, msg: err.message });
  }
};
