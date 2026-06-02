const { Rating, Store, User, sequelize } = require('../models');
const { sendSuccess, sendError } = require('../utils/response');

// POST /api/ratings (Normal user submits rating, checks for existing rating to upsert)
const submitRating = async (req, res, next) => {
  try {
    const { store_id, value } = req.body;
    const userId = req.user.id;

    // Check if store exists
    const store = await Store.findByPk(store_id);
    if (!store) {
      return sendError(res, 'Store not found.', 404);
    }

    // Upsert rating using findOrCreate + update approach to handle uniqueness
    const [rating, created] = await Rating.findOrCreate({
      where: { user_id: userId, store_id },
      defaults: { value }
    });

    if (!created) {
      rating.value = value;
      await rating.save();
    }

    return sendSuccess(res, {
      rating,
      action: created ? 'created' : 'updated'
    }, created ? 201 : 200);
  } catch (error) {
    next(error);
  }
};

// PATCH /api/ratings/:id (Normal user updates their own rating)
const updateRating = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { value } = req.body;
    const userId = req.user.id;

    const rating = await Rating.findByPk(id);
    if (!rating) {
      return sendError(res, 'Rating not found.', 404);
    }

    // Validate ownership
    if (rating.user_id !== userId) {
      return sendError(res, 'Access denied. You can only update your own rating.', 403);
    }

    rating.value = value;
    await rating.save();

    return sendSuccess(res, rating);
  } catch (error) {
    next(error);
  }
};

// GET /api/ratings/store/:storeId (Store owner gets all raters + average rating)
const getRatersByStore = async (req, res, next) => {
  try {
    const { storeId } = req.params;
    const ownerId = req.user.id;

    const store = await Store.findByPk(storeId);
    if (!store) {
      return sendError(res, 'Store not found.', 404);
    }

    // RBAC validation: ensure the user requesting this owns this store
    if (store.owner_id !== ownerId) {
      return sendError(res, 'Access denied. You do not own this store.', 403);
    }

    // Parse pagination parameters
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.max(1, parseInt(req.query.limit || '10', 10));
    const sortBy = req.query.sortBy || 'created_at';
    const sortOrder = (req.query.sortOrder || 'DESC').toUpperCase();
    const offset = (page - 1) * limit;

    // Sorting options: sort by user details or standard attributes
    let order = [];
    if (sortBy === 'name') {
      order = [[{ model: User, as: 'user' }, 'name', sortOrder]];
    } else if (sortBy === 'email') {
      order = [[{ model: User, as: 'user' }, 'email', sortOrder]];
    } else if (sortBy === 'value' || sortBy === 'created_at') {
      order = [[sortBy, sortOrder]];
    } else {
      order = [['created_at', 'DESC']];
    }

    // Find and count ratings
    const { count, rows } = await Rating.findAndCountAll({
      where: { store_id: storeId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        }
      ],
      order,
      limit,
      offset
    });

    // Compute average rating
    const ratingResult = await Rating.findOne({
      where: { store_id: storeId },
      attributes: [[sequelize.fn('AVG', sequelize.col('value')), 'avg_rating']],
      raw: true
    });

    const avgRating = ratingResult.avg_rating ? parseFloat(parseFloat(ratingResult.avg_rating).toFixed(2)) : 0.0;
    const totalPages = Math.ceil(count / limit);

    return sendSuccess(res, {
      ratings: rows,
      avg_rating: avgRating,
      total: count,
      page,
      limit,
      totalPages
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitRating,
  updateRating,
  getRatersByStore
};
