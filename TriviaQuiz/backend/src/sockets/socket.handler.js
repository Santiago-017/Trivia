
const AnswerService = require('../services/AnswerService');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('socket connected:', socket.id);

    socket.on('joinSession', ({ gameCode, userId, nickname }) => {
      if (!gameCode) return;
      console.log(`joinSession → gameCode=${gameCode}, userId=${userId}`);

      socket.join(gameCode);
      io.to(gameCode).emit('playerJoined', { userId, nickname });
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
      try {
        // 👉 Validación real con DB
        const result = await AnswerService.handleAnswer(rest);
         // 👉 Avisamos a todos en la sala
         io.to(gameCode).emit('playerAnswered', {
          gameCode,...result
          }
        );
        } catch (err) {
          console.error('Error en validación de answer:', err);
          // Puedes avisarle solo al jugador que falló
          socket.emit('answerError', { message: 'Error al validar la respuesta' });
          }
    });

    socket.on('disconnect', () => {
      console.log('socket disconnected:', socket.id);
    });

    socket.on('requestNextQuestion', ({ gameCode }) => {
      if (!gameCode) return;
      console.log('requestNextQuestion →', gameCode);

       // Avisar a TODOS en la sala que alguien pidió la siguiente.
      // El host será el que realmente llame al backend.
      io.to(gameCode).emit('requestNextQuestion', { gameCode });
    });

  });
};
