
const router = require('express').Router();
const controller = require('../controllers/session.controller');

router.post('/', controller.createSession);
router.post('/:sessionId/questions', controller.addQuestions);
router.post('/:sessionId/join', controller.join);
router.post('/:sessionId/answer', controller.recordAnswer);
router.post('/:sessionId/start', controller.start);

module.exports = router;
