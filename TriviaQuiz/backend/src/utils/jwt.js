
const jwt = require('jsonwebtoken');
module.exports = {
  sign(payload, expiresIn='2h') { return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn }); },
  verify(token) { return jwt.verify(token, process.env.JWT_SECRET); }
};
