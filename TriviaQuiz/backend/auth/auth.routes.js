const express = require("express");
const { login, register } = require("./auth.controller.js");
const { isAuthenticated } = require("./auth.middleware.js");

const router = express.Router();

router.post("/login", login);
router.post("/register", register);

router.get("/profile", isAuthenticated, (req, res) => {
  res.json({
    message: "Perfil del usuario autenticado",
    user: req.user,
  });
});

module.exports = router;
