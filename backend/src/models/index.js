const sequelize = require('../config/db');
const User = require('./User');
const Store = require('./Store');
const Rating = require('./Rating');

// Set up associations

// User (Owner) has many Stores; Store belongs to User (Owner)
Store.belongsTo(User, { foreignKey: 'owner_id', as: 'owner' });
User.hasMany(Store, { foreignKey: 'owner_id', as: 'stores' });

// User has many Ratings; Rating belongs to User
Rating.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(Rating, { foreignKey: 'user_id', as: 'ratings' });

// Store has many Ratings; Rating belongs to Store
Rating.belongsTo(Store, { foreignKey: 'store_id', as: 'store' });
Store.hasMany(Rating, { foreignKey: 'store_id', as: 'ratings' });

module.exports = {
  sequelize,
  User,
  Store,
  Rating
};
