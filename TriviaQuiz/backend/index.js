const express = require("express");
const cors = require("cors");
const authRoutes = require("./auth/auth.routes.js"); // ruta correcta

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:4200",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.get("/", (req, res) => {
  res.send("Backend funcionando 🚀");
});

// aquí montas las rutas de auth
app.use("/auth", authRoutes);

app.listen(3000, () => {
  console.log("Servidor backend escuchando en puerto 3000");
});
