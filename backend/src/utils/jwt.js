const jwt = require('jsonwebtoken');

const signToken = (payload) => {
  const secret = process.env.JWT_SECRET || 'fallback_secret_key';
  return jwt.sign(payload, secret, { expiresIn: '7d' });
};

const verifyToken = (token) => {
  const secret = process.env.JWT_SECRET || 'fallback_secret_key';
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    return null;
  }
};

module.exports = {
  signToken,
  verifyToken
};
