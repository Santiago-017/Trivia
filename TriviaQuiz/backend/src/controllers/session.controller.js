
const SessionService = require('../services/SessionService');

exports.createSession = async (req, res) => {
  try {
    const hostId = req.user.id;
    const doc = await SessionService.createSession({ hostId, category: req.body.category, difficulty: req.body.difficulty, numQuestions: req.body.numQuestions, maxPlayers: req.body.maxPlayers });
    res.json({ ok: true, session: doc });
  } catch (err) {
    res.status(400).json({ ok: false, msg: err.message });
    console.log(err);
  }
};

exports.addQuestions = async (req, res) => {
  try {
    const added = await SessionService.addQuestionsFromExternalAPI(req.params.sessionId, req.body.questions);
    res.json({ ok: true, added });
  } catch (err) {
    res.status(400).json({ ok: false, msg: err.message });
  }
};

exports.join = async (req, res) => {
  try {
    const sp = await SessionService.joinSession(req.params.sessionId, req.user.id, req.body.nickname);
    res.json({ ok: true, player: sp });
  } catch (err) {
    res.status(400).json({ ok: false, msg: err.message });
  }
};

exports.recordAnswer = async (req, res) => {
  try {
    const pa = await SessionService.recordAnswer(req.params.sessionId, req.body.sessionQuestionId, req.user.id, req.body.givenAnswer, req.body.responseTimeMs);
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
    res.status(500).json({ error: "Error al iniciar juego" });
  }
};
