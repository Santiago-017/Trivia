
# Trivia Backend - Node + Express + Socket.io + MySQL (Sequelize)
Proyecto generado automáticamente - POO + servicios + controllers + sockets.

## Requisitos
- Node 18+
- MySQL server

## Instalación
1. Copia `.env.example` a `.env` y ajusta las variables.
2. `npm install`
3. Crear la base de datos indicada en `.env` (por ejemplo `trivia_db`).
4. `npm run dev` o `npm start`

El servidor usa `sequelize.sync()` para crear tablas automáticamente (modo dev). Para producción, gestione migraciones.

## Endpoints principales
- `POST /auth/register` { username, email, password }
- `POST /auth/login` { email, password } -> devuelve token
- `POST /sessions` (auth) { category, difficulty, numQuestions }
- `POST /sessions/:sessionId/questions` (auth) { questions: [...] }
- `POST /sessions/:sessionId/join` (auth) { nickname }
- `POST /sessions/:sessionId/answer` (auth) { sessionQuestionId, givenAnswer, responseTimeMs }

## Sockets (Socket.io)
Conéctese al servidor Socket.io en `http://localhost:3000` (o la URL donde despliegues).

Eventos importantes (cliente -> servidor):
- `joinSession` : { sessionId, userId, nickname }
- `startSession` : { sessionId }
- `nextQuestion` : { sessionId }
- `answer` : { sessionId, sessionQuestionId, userId, givenAnswer, responseTimeMs }

Eventos servidor -> cliente:
- `playerJoined` 
- `sessionStarted`
- `newQuestion`
- `playerAnswered`
- `scoreboard`

## Nota
El proyecto está diseñado para extenderse. Si quieres, puedo generar un ZIP con tests o una versión con autenticación social.
