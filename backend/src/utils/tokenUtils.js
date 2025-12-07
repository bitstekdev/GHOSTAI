const jwt = require('jsonwebtoken');
const crypto = require('crypto');

exports.generateAccessToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRY || '2h' }
  );
};

exports.generateRefreshToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d' }
  );
};

exports.generateEmailToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_EMAIL_SECRET,
    { expiresIn: process.env.JWT_EMAIL_EXPIRY || '24h' }
  );
};

exports.verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};

exports.verifyEmailToken = (token) => {
  return jwt.verify(token, process.env.JWT_EMAIL_SECRET);
};

exports.generateRandomToken = () => {
  return crypto.randomBytes(32).toString('hex');
};