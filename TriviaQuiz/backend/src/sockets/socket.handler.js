const AnswerService = require('../services/AnswerService');
const Session = require('../infrastructure/models/session.model');
const SessionPlayer = require('../infrastructure/models/sessionPlayer.model');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('socket connected:', socket.id);

    // ✅ NUEVO: helper para mandar snapshot de jugadores (VS)
    async function emitPlayersSnapshotToSocket(gameCode, targetSocket) {
      const session = await Session.findOne({ where: { game_code: gameCode } });
      if (!session) return;

      const sessionId = session.session_id;

      const rows = await SessionPlayer.findAll({
        where: { sessionId: sessionId }, // si en tu modelo es session_id, cámbialo aquí
        attributes: ['userId', 'nickname', 'score', 'streak'] // si tu modelo usa otros nombres, ajústalos
      });

      const players = rows.map((r) => ({
        userId: r.userId ?? r.user_id,
        nickname: r.nickname ?? r.name,
        score: r.score ?? 0,
        streak: r.streak ?? 0
      }));

      targetSocket.emit('playersSnapshot', players);
    }

    socket.on('joinSession', async ({ gameCode, userId, nickname }) => {
      if (!gameCode) return;
      console.log(`joinSession → gameCode=${gameCode}, userId=${userId}`);

      const session = await Session.findOne({ where: { game_code: gameCode } });
      if (!session) {
        socket.emit('error', { message: 'Session not found' });
        return;
      }

      // Guardar jugador si no existe
      await SessionPlayer.findOrCreate({
        where: { sessionId: session.session_id, userId: userId },
        defaults: { nickname, joinedAt: new Date(), score: 0, active: true }
      });

      socket.join(gameCode);

      // ✅ NUEVO: al que acaba de entrar le mando el snapshot completo
      await emitPlayersSnapshotToSocket(gameCode, socket);

      // Broadcast normal para que los demás sepan que entró alguien
      io.to(gameCode).emit('playerJoined', { userId, nickname });
    });

    // ✅ NUEVO: cuando un cliente lo pida, mandamos snapshot
    socket.on('requestPlayersSnapshot', async ({ gameCode }) => {
      if (!gameCode) return;
      console.log('requestPlayersSnapshot →', gameCode);

      await emitPlayersSnapshotToSocket(gameCode, socket);
    });

    socket.on('startSession', ({ gameCode }) => {
      if (!gameCode) return;
      console.log(`startSession → gameCode=${gameCode}`);

      io.to(gameCode).emit('sessionStarted', { gameCode });
    });

    socket.on('nextQuestion', ({ gameCode, question }) => {
      if (!gameCode) return;
      console.log(`nextQuestion → gameCode=${gameCode}`);

      io.to(gameCode).emit('newQuestion', question);
    });

    socket.on('answer', async ({ gameCode, ...rest }) => {
      if (!gameCode) return;
      console.log(`answer → gameCode=${gameCode}`, rest);

      const session = await Session.findOne({ where: { game_code: gameCode } });
      if (!session) {
        socket.emit('error', { message: 'Session not found' });
        return;
      }

      const sessionId = session.session_id;

      try {
        // 👉 Validación real con DB
        const result = await AnswerService.handleAnswer({
          rest,
          sessionId
        });

        // 👉 Avisamos a todos en la sala
        io.to(gameCode).emit('playerAnswered', {
          gameCode,
          ...result
        });

      } catch (err) {
        console.error('Error en validación de answer:', err);
        socket.emit('answerError', { message: 'Error al validar la respuesta' });
      }
    });

    socket.on('requestNextQuestion', ({ gameCode }) => {
      if (!gameCode) return;
      console.log('requestNextQuestion →', gameCode);

      io.to(gameCode).emit('requestNextQuestion', { gameCode });
    });

    socket.on('finishGame', ({ gameCode, sessionId }) => {
      if (!gameCode) return;
      io.to(gameCode).emit('gameFinished', { gameCode, sessionId });
    });

    socket.on('disconnect', () => {
      console.log('socket disconnected:', socket.id);
    });
  });
};
