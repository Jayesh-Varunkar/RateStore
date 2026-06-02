const { User, Store, Rating } = require('../models');
const { sendSuccess } = require('../utils/response');

// GET /api/dashboard/stats (Admin only)
const getStats = async (req, res, next) => {
  try {
    const totalUsers = await User.count();
    const totalStores = await Store.count();
    const totalRatings = await Rating.count();

    return sendSuccess(res, {
      totalUsers,
      totalStores,
      totalRatings
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStats
};
