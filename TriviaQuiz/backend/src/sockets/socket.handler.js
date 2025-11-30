
module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('socket connected:', socket.id);

    socket.on('joinSession', (data) => {
      // data: { sessionId, userId, nickname }
      socket.join(data.sessionId);
      io.to(data.sessionId).emit('playerJoined', { userId: data.userId, nickname: data.nickname });
    });

    socket.on('startSession', (data) => {
      // data: { sessionId }
      io.to(data.sessionId).emit('sessionStarted', { sessionId: data.sessionId });
    });

    socket.on('nextQuestion', (data) => {
      // data: { sessionId, question }
      io.to(data.sessionId).emit('newQuestion', data.question);
    });

    socket.on('answer', (data) => {
      // data: { sessionId, sessionQuestionId, userId, givenAnswer, responseTimeMs }
      io.to(data.sessionId).emit('playerAnswered', data);
    });

    socket.on('disconnect', () => {
      console.log('socket disconnected:', socket.id);
    });
  });
};
