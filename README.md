# 🎮 TriviaQuiz – Real-Time Trivia Platform

TriviaQuiz is a real-time multiplayer trivia platform inspired by applications such as **Kahoot**.  
The system allows a host to create a game session and share a unique game code so that multiple players can join, answer questions in real time, and compete based on correctness and response time.

This project was developed as the **Final Project for Software Engineering II** at the **Universidad Nacional de Colombia**.

---

## 📌 Project Objectives

- Design and implement a real-time web-based trivia system.
- Apply Object-Oriented Programming (OOP) principles.
- Implement and document software design patterns.
- Integrate a relational database.
- Support real-time communication using WebSockets.
- Implement automated backend testing.
- Configure a CI/CD pipeline using GitHub Actions and Docker.
- Deliver clear and professional documentation.

---

## 🧩 Main Features

- User registration and authentication (JWT-based)
- Create and join trivia rooms using a unique game code
- Host-controlled game flow
- Real-time question delivery and answer submission
- Dynamic score calculation and live scoreboard
- Final results display at the end of the session
- External trivia question provider (Open Trivia DB)
- Automated backend tests
- CI/CD pipeline with GitHub Actions

---

## 🏗️ Project Structure

TRIVIA/

│
└── TriviaQuiz/

├── backend/ # Node.js + Express REST API

├── frontend/ # Angular frontend application

├── Db/ # Database scripts / schema

└── .angular/ # Angular build/cache files


---

## 🧠 System Architecture

The system follows a **layered architecture**:

### Frontend (Presentation Layer)
- Implemented using **Angular**
- Provides interfaces for players and hosts
- Communicates with backend via REST API
- Maintains a WebSocket connection using Socket.IO for real-time updates

### Backend (Application Layer)
- Built with **Node.js** and **Express**
- Handles business logic, session management, scoring and authentication
- Uses **JWT** for securing API endpoints
- Implements real-time communication with **Socket.IO**

### Database (Data Layer)
- Relational database using **MySQL**
- Managed via **Sequelize ORM**
- Stores users, sessions, questions, answers and statistics

### External API Integration
- Uses **Open Trivia DB** to retrieve trivia questions dynamically

---

## 🧩 Design Patterns Implemented

- **Service Layer Pattern**  
  Separates business logic from controllers to improve maintainability and testability.

- **Singleton Pattern**  
  Applied to core services (e.g., AuthService, SessionService) to ensure a single shared instance.

- **Observer Pattern (Event-Driven Communication)**  
  Implemented using Socket.IO for real-time updates between server and clients.

- **MVC Architectural Pattern**  
  Used to structure backend responsibilities across models, controllers and services.

---

## 🚀 Technologies Used

### Frontend
- Angular
- TypeScript
- RxJS
- Socket.IO Client

### Backend
- Node.js
- Express
- Sequelize ORM
- MySQL
- Socket.IO
- JWT Authentication

### Testing
- Jest
- Supertest

### DevOps
- Docker
- GitHub Actions

---

## ⚙️ Setup Instructions

### Prerequisites

- Node.js (v18+ recommended)
- npm
- MySQL
- Angular CLI
- Docker (optional)

---

### Backend Setup

```bash
cd TriviaQuiz/backend
npm install
