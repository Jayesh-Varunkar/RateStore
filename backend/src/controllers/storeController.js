const { Store, User, Rating, sequelize } = require('../models');
const { Op } = require('sequelize');
const { sendSuccess, sendError } = require('../utils/response');

// GET /api/stores (All authenticated users)
const listStores = async (req, res, next) => {
  try {
    const { page, limit, sortBy, sortOrder, name, address } = req.query;
    const userId = req.user ? req.user.id : null;

    const where = {};
    if (name) {
      where.name = { [Op.like]: `%${name}%` };
    }
    if (address) {
      where.address = { [Op.like]: `%${address}%` };
    }

    const offset = (page - 1) * limit;

    // Define computed subqueries
    const avgRatingSubquery = [
      sequelize.literal(`(
        SELECT COALESCE(AVG(value), 0)
        FROM ratings AS r
        WHERE r.store_id = Store.id
      )`),
      'avg_rating'
    ];

    const myRatingSubquery = userId
      ? [
          sequelize.literal(`(
            SELECT value
            FROM ratings AS r
            WHERE r.store_id = Store.id AND r.user_id = ${parseInt(userId, 10)}
            LIMIT 1
          )`),
          'my_rating'
        ]
      : [sequelize.literal('NULL'), 'my_rating'];

    // Handle sorting by literal (computed field) or standard field
    const orderClause = sortBy === 'avg_rating'
      ? [[sequelize.literal('avg_rating'), sortOrder]]
      : [[sortBy, sortOrder]];

    const { count, rows } = await Store.findAndCountAll({
      where,
      attributes: {
        include: [avgRatingSubquery, myRatingSubquery]
      },
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: orderClause,
      limit,
      offset
    });

    const totalPages = Math.ceil(count / limit);

    // Format fields correctly
    const formattedStores = rows.map(store => {
      const json = store.toJSON();
      json.avg_rating = json.avg_rating ? parseFloat(parseFloat(json.avg_rating).toFixed(2)) : 0.0;
      json.my_rating = json.my_rating !== null ? parseInt(json.my_rating, 10) : null;
      return json;
    });

    return sendSuccess(res, {
      stores: formattedStores,
      total: count,
      page,
      limit,
      totalPages
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/stores (Admin only)
const createStore = async (req, res, next) => {
  try {
    const { name, email, address, owner_id } = req.body;

    // Check if email already exists
    const existingStore = await Store.findOne({ where: { email } });
    if (existingStore) {
      return sendError(res, 'A store with this email already exists.', 409);
    }

    if (owner_id) {
      const owner = await User.findByPk(owner_id);
      if (!owner) {
        return sendError(res, 'Owner user not found.', 400);
      }
      if (owner.role !== 'owner') {
        return sendError(res, 'Assigned owner user must have the "owner" role.', 400);
      }
    }

    const newStore = await Store.create({
      name,
      email,
      address: address || null,
      owner_id: owner_id || null
    });

    return sendSuccess(res, newStore, 201);
  } catch (error) {
    next(error);
  }
};

// GET /api/stores/:id (All authenticated users)
const getStoreDetail = async (req, res, next) => {
  try {
    const { id } = req.params;

    const store = await Store.findByPk(id, {
      attributes: {
        include: [
          [
            sequelize.literal(`(
              SELECT COALESCE(AVG(value), 0)
              FROM ratings AS r
              WHERE r.store_id = Store.id
            )`),
            'avg_rating'
          ]
        ]
      },
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    if (!store) {
      return sendError(res, 'Store not found.', 404);
    }

    const json = store.toJSON();
    json.avg_rating = json.avg_rating ? parseFloat(parseFloat(json.avg_rating).toFixed(2)) : 0.0;

    return sendSuccess(res, json);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listStores,
  createStore,
  getStoreDetail
};
