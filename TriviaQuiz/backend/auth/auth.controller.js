const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const usersPath = path.resolve("data/users.json");
const SECRET = "secreto_dev";
const SALT_ROUNDS = 10; // 10–12 es típico en dev [web:147][web:144]

function loadUsers() {
  if (!fs.existsSync(usersPath)) {
    fs.writeFileSync(usersPath, JSON.stringify([], null, 2), "utf8");
    return [];
  }
  const raw = fs.readFileSync(usersPath, "utf8");
  if (!raw.trim()) return [];
  try {
    return JSON.parse(raw);
  } catch (e) {
    console.error("Error parseando users.json:", e);
    return [];
  }
}

function saveUsers(users) {
  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), "utf8");
}

exports.register = async (req, res) => {
  const { username, password, email } = req.body;
  console.log("datos recibidos:", req.body);

  if (!username || !password || !email) {
    return res.status(400).json({ error: "username, email y password son obligatorios" });
  }

  const users = loadUsers();

  const exists = users.some(u => u.username === username);
  if (exists) {
    return res.status(400).json({ error: "El usuario ya existe" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS); // [web:133][web:134]

    const newUser = {
      id: users.length ? users[users.length - 1].id + 1 : 1,
      username,
      email,
      password: hashedPassword, // guardas el hash, no el texto plano [web:137]
    };

    users.push(newUser);
    saveUsers(users);

    res.json({ message: "Usuario registrado", user: { id: newUser.id, username, email } });
  } catch (err) {
    console.error("Error al hashear/guardar password:", err);
    res.status(500).json({ error: "Error interno al registrar usuario" });
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;
  console.log("login - body recibido:", req.body);

  if (!username || !password) {
    return res.status(400).json({ error: "Faltan username o password" });
  }

  const users = loadUsers();
  const user = users.find(u => u.username === username);

  if (!user) {
    return res.status(401).json({ error: "Credenciales inválidas" });
  }

  const isMatch = await bcrypt.compare(password, user.password); // [web:134][web:143]
  if (!isMatch) {
    return res.status(401).json({ error: "Credenciales inválidas" });
  }

  const token = jwt.sign(
    { id: user.id, username: user.username },
    SECRET,
    { expiresIn: "1h" }
  );

  res.json({ token });
};
