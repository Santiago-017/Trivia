// tests/services/SessionService.test.js

jest.mock('../../src/infrastructure/models/sessionQuestion.model', () => ({
  findOne: jest.fn(),
}));

jest.mock('../../src/infrastructure/models/session.model', () => ({
  findByPk: jest.fn(),
}));

const SessionQuestionModel = require('../../src/infrastructure/models/sessionQuestion.model');
const SessionModel = require('../../src/infrastructure/models/session.model');

const SessionService = require('../../src/services/SessionService');

describe('SessionService.getNextQuestion', () => {
  beforeEach(() => jest.clearAllMocks());

  test('devuelve finished=true si no hay pregunta', async () => {
    // si tu función exige sesión, mockéala también
    SessionModel.findByPk.mockResolvedValue({ num_questions: 10 });

    SessionQuestionModel.findOne.mockResolvedValue(null);

    const result = await SessionService.getNextQuestion(1, 0);

    expect(result).toEqual({ finished: true });
  });

  test('devuelve la pregunta cuando existe', async () => {
    // ✅ CLAVE: mockear la sesión para que NO lance "Session not found"
    SessionModel.findByPk.mockResolvedValue({ num_questions: 10 });

    SessionQuestionModel.findOne.mockResolvedValue({
      payload: { question: '2+2?', options: ['3', '4'], correct: '4' },
    });

    const result = await SessionService.getNextQuestion(1, 0);

    expect(SessionModel.findByPk).toHaveBeenCalledWith(1);
    expect(SessionQuestionModel.findOne).toHaveBeenCalled();
    expect(result).toEqual({
      finished: false,
      question: { question: '2+2?', options: ['3', '4'], correct: '4' },
    });
  });
});
