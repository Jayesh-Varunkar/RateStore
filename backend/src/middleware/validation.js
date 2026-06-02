const { sendError } = require('../utils/response');

const validate = (schema) => {
  return (req, res, next) => {
    try {
      if (schema.body) {
        req.body = schema.body.parse(req.body);
      }
      if (schema.query) {
        req.query = schema.query.parse(req.query);
      }
      if (schema.params) {
        req.params = schema.params.parse(req.params);
      }
      next();
    } catch (error) {
      if (error.errors) {
        const messages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
        return sendError(res, `Validation error: ${messages}`, 400);
      }
      return sendError(res, error.message, 400);
    }
  };
};

module.exports = validate;
