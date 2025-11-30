
require('dotenv').config();
console.log("JWT_SECRET:", process.env.JWT_SECRET);
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const { sequelize } = require('./setup/database');

const authRoutes = require('./routes/auth.routes');
const sessionRoutes = require('./routes/session.routes');
const jwtMiddleware = require('./middlewares/auth.middleware');

const app = express();
app.use(cors());
app.use(express.json());

// routes
app.use('/auth', authRoutes);
app.use('/sessions', jwtMiddleware, sessionRoutes);

// basic health
app.get('/', (req,res)=> res.send('Trivia Backend (MySQL) running'));

// server + sockets
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

// socket event handlers
const socketHandler = require('./sockets/socket.handler');
socketHandler(io);

const PORT = process.env.PORT || 3000;
sequelize.sync({ alter: true }).then(() => {
  server.listen(PORT, "0.0.0.0" ,() => console.log('Server running on', PORT));
}).catch(err => {
  console.error('DB connection failed:', err);
});
