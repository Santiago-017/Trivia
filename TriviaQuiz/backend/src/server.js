// backend/src/server.js
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
const socketHandler = require('./sockets/socket.handler');

const app = express();

// --------- MIDDLEWARES BÁSICOS ----------
app.use(cors({
  origin: "http://localhost:4200",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"]
}));

app.use(express.json());

// --------- RUTAS HTTP ----------
app.use('/auth', authRoutes);                 // /auth/register, /auth/login
app.use('/sessions', jwtMiddleware, sessionRoutes);

app.get('/', (req, res) => {
  res.send('Trivia Backend (MySQL) running');
});

// --------- HTTP SERVER + SOCKET.IO ----------
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:4200",
    credentials: true,
    methods: ["GET", "POST"]
  }
});

socketHandler(io);

const PORT = process.env.PORT || 3000;

// --------- ARRANQUE (SOLO FUERA DE TEST) ----------
if (process.env.NODE_ENV !== 'test') {
  sequelize.authenticate()
    .then(() => {
      console.log('Database connection established successfully.');
      server.listen(PORT, "0.0.0.0", () =>
        console.log('Server running on', PORT)
      );
    })
    .catch(err => {
      console.error('DB connection failed:', err);
    });
}

// 👈 Esto es lo que usa supertest en los tests
module.exports = app;
