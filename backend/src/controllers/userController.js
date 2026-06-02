const { User, Store, Rating, sequelize } = require('../models');
const { Op } = require('sequelize');
const { hashPassword, comparePassword } = require('../utils/hash');
const { sendSuccess, sendError } = require('../utils/response');

// GET /api/users (Admin only)
const listUsers = async (req, res, next) => {
  try {
    const { page, limit, sortBy, sortOrder, name, email, address, role } = req.query;

    const where = {};
    if (name) {
      where.name = { [Op.like]: `%${name}%` };
    }
    if (email) {
      where.email = { [Op.like]: `%${email}%` };
    }
    if (address) {
      where.address = { [Op.like]: `%${address}%` };
    }
    if (role) {
      where.role = role;
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password_hash'] },
      order: [[sortBy, sortOrder]],
      limit,
      offset
    });

    const totalPages = Math.ceil(count / limit);

    return sendSuccess(res, {
      users: rows,
      total: count,
      page,
      limit,
      totalPages
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/users (Admin only)
const createUser = async (req, res, next) => {
  try {
    const { name, email, password, address, role } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return sendError(res, 'A user with this email already exists.', 409);
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await User.create({
      name,
      email,
      password_hash: hashedPassword,
      address: address || null,
      role
    });

    return sendSuccess(res, {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      address: newUser.address
    }, 201);
  } catch (error) {
    next(error);
  }
};

// GET /api/users/:id (Admin only)
const getUserDetail = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: { exclude: ['password_hash'] }
    });

    if (!user) {
      return sendError(res, 'User not found.', 404);
    }

    const resultData = user.toJSON();

    if (user.role === 'owner') {
      // Find all stores owned by this owner
      const stores = await Store.findAll({
        where: { owner_id: id },
        attributes: ['id']
      });

      const storeIds = stores.map(s => s.id);
      let avgRating = 0.0;

      if (storeIds.length > 0) {
        const ratingResult = await Rating.findOne({
          where: { store_id: storeIds },
          attributes: [[sequelize.fn('AVG', sequelize.col('value')), 'avg_rating']],
          raw: true
        });

        avgRating = ratingResult.avg_rating ? parseFloat(parseFloat(ratingResult.avg_rating).toFixed(2)) : 0.0;
      }

      resultData.avg_rating = avgRating;
    }

    return sendSuccess(res, resultData);
  } catch (error) {
    next(error);
  }
};

// PATCH /api/users/:id/password (Any authenticated user updates their own password)
const changePassword = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { oldPassword, newPassword } = req.body;

    // Check if user is changing their own password
    if (req.user.id !== parseInt(id, 10)) {
      return sendError(res, 'Access denied. You can only update your own password.', 403);
    }

    const user = await User.findByPk(id);
    if (!user) {
      return sendError(res, 'User not found.', 404);
    }

    const isMatch = await comparePassword(oldPassword, user.password_hash);
    if (!isMatch) {
      return sendError(res, 'Incorrect current password.', 400);
    }

    const hashedNewPassword = await hashPassword(newPassword);
    user.password_hash = hashedNewPassword;
    await user.save();

    return sendSuccess(res, { message: 'Password updated successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listUsers,
  createUser,
  getUserDetail,
  changePassword
};
