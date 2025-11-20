const express = require("express");
const app = express();

app.use(express.json()); // Para leer JSON

app.get("/", (req, res) => {
  res.send("Backend funcionando 🚀");
});

app.listen(3000, () => {
  console.log("Servidor backend escuchando en puerto 3000");
});
