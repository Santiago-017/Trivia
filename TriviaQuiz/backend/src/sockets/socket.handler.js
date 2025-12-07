module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('socket connected:', socket.id);

    socket.on('joinSession', (data) => {
      // data: { gameCode?, sessionId?, userId, nickname }
      const room = data.gameCode || data.sessionId;
      if (!room) return;

      socket.join(room);
      io.to(room).emit('playerJoined', {
        userId: data.userId,
        nickname: data.nickname
      });
    });

    socket.on('startSession', (data) => {
      // data: { gameCode?, sessionId? }
      const room = data.gameCode || data.sessionId;
      if (!room) return;

      io.to(room).emit('sessionStarted', { room });
    });

    socket.on('nextQuestion', (data) => {
      // data: { gameCode?, sessionId?, question }
      const room = data.gameCode || data.sessionId;
      if (!room) return;

      io.to(room).emit('newQuestion', data.question);
    });

    socket.on('answer', (data) => {
      // data: { gameCode?, sessionId?, ... }
      const room = data.gameCode || data.sessionId;
      if (!room) return;

      io.to(room).emit('playerAnswered', data);
    });

    socket.on('disconnect', () => {
      console.log('socket disconnected:', socket.id);
    });
  });
};
