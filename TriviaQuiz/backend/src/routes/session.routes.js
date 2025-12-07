
const router = require('express').Router();
const controller = require('../controllers/session.controller');

router.post('/', controller.createSession);
router.post('/:sessionId/questions', controller.addQuestions);
router.post('/:sessionId/join', controller.join);
router.post('/:sessionId/answer', controller.recordAnswer);
router.post('/:sessionId/start', controller.start);
<<<<<<< HEAD
router.get('/:sessionId/next-question', controller.nextQuestion);
router.post('/:sessionId/answer', controller.answerQuestion);
=======
router.post('/join-by-code', controller.joinByCode);


>>>>>>> a9f10c90351f57fa2c496e880fda8cc1efebf2e9
module.exports = router;
