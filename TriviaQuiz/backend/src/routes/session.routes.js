const router = require('express').Router();
const controller = require('../controllers/session.controller');

router.post('/', controller.createSession);
router.post('/:sessionId/questions', controller.addQuestions);
router.post('/:sessionId/join', controller.join);
router.post('/:sessionId/answer', controller.recordAnswer);
router.post('/:gameCode/start', controller.start);
router.get('/:sessionId/next-question/:currentQuestionOrder', controller.getNextQuestion);
router.post('/join-by-code', controller.joinByCode);
router.get('/code/:gameCode/next-question/:currentQuestionOrder', controller.getNextQuestionByCode);

module.exports = router;
