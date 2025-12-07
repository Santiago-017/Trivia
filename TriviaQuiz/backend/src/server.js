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

// ✅ CORS SOLO UNA VEZ Y BIEN CONFIGURADO
app.use(cors({
  origin: "http://localhost:4200",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"]
}));

app.use(express.json());

// ✅ Routes
app.use('/auth', authRoutes);
app.use('/sessions', jwtMiddleware, sessionRoutes);

// ✅ Health check
app.get('/', (req, res) => res.send('Trivia Backend (MySQL) running'));

// ✅ Server + Socket.io con CORS CORRECTO
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:4200", // ✅ NUNCA USAR "*"
    credentials: true,
    methods: ["GET", "POST"]
  }
});

// ✅ Conectar tu handler
socketHandler(io);

const PORT = process.env.PORT || 3000;

// ❗ SOLO authenticate (bien hecho ✅)
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
