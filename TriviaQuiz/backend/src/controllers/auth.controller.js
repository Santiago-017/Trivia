
const AuthService = require('../services/AuthService');

exports.register = async (req, res) => {
  try {
    const user = await AuthService.register(req.body);
    res.json({ ok: true, user: { id: user.id, username: user.username, email: user.email }});
  } catch (err) {
    res.status(400).json({ ok: false, msg: err.message });
    console.log(err);
  }
};

exports.login = async (req, res) => {
  try {
    const result = await AuthService.login(req.body);
    res.json({ ok: true, ...result });
  } catch (err) {
    res.status(400).json({ ok: false, msg: err.message });
  }
};
