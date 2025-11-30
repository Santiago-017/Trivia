// src/config/env.js
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

module.exports = {
  JWT_SECRET: process.env.JWT_SECRET,
  PORT: process.env.PORT || 3000,
};
