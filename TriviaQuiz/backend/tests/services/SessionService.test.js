// tests/services/SessionService.test.js

describe('SessionService.getNextQuestion', () => {
  beforeEach(() => {
    jest.resetModules();     // ✅ borra cache de imports entre tests
    jest.clearAllMocks();
  });

  test('devuelve finished=true si no hay pregunta', async () => {
    // ✅ Mockear ANTES de importar el servicio
    jest.doMock('../../src/infrastructure/models/sessionQuestion.model', () => ({
      findOne: jest.fn(),
    }));
    jest.doMock('../../src/infrastructure/models/session.model', () => ({
      findByPk: jest.fn(),
    }));
    jest.doMock('../../src/infrastructure/models/sessionPlayer.model', () => ({}));
    jest.doMock('../../src/infrastructure/models/playerAnswer.model', () => ({}));

    const SessionQuestionModel = require('../../src/infrastructure/models/sessionQuestion.model');
    const SessionService = require('../../src/services/SessionService');

    SessionQuestionModel.findOne.mockResolvedValue(null);

    const result = await SessionService.getNextQuestion(1, 0);

    expect(SessionQuestionModel.findOne).toHaveBeenCalledWith({
      where: { sessionId: 1, questionOrder: 0 },
    });
    expect(result).toEqual({ finished: true });
  });

  test('devuelve la pregunta cuando existe', async () => {
    jest.doMock('../../src/infrastructure/models/sessionQuestion.model', () => ({
      findOne: jest.fn(),
    }));
    jest.doMock('../../src/infrastructure/models/session.model', () => ({
      findByPk: jest.fn(),
    }));
    jest.doMock('../../src/infrastructure/models/sessionPlayer.model', () => ({}));
    jest.doMock('../../src/infrastructure/models/playerAnswer.model', () => ({}));

    const SessionQuestionModel = require('../../src/infrastructure/models/sessionQuestion.model');
    const SessionModel = require('../../src/infrastructure/models/session.model');
    const SessionService = require('../../src/services/SessionService');

    // ✅ IMPORTANTE: tu SessionService llama findByPk, entonces hay que mockearlo
    SessionModel.findByPk.mockResolvedValue({ session_id: 1 });

    SessionQuestionModel.findOne.mockResolvedValue({
      payload: { question: '2+2?', options: ['3', '4'], correct: '4' },
    });

    const result = await SessionService.getNextQuestion(1, 0);

    expect(SessionModel.findByPk).toHaveBeenCalledWith(1);
    expect(result).toEqual({
      finished: false,
      question: { question: '2+2?', options: ['3', '4'], correct: '4' },
    });
  });
});
