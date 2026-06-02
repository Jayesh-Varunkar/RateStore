'use strict';
const bcrypt = require('bcrypt');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const saltRounds = 12;
    const adminHash = await bcrypt.hash('Admin@1234', saltRounds);
    const ownerHash = await bcrypt.hash('Owner@1234', saltRounds);
    const userHash = await bcrypt.hash('User@1234', saltRounds);

    // Insert Users
    await queryInterface.bulkInsert('users', [
      {
        id: 1,
        name: 'System Administrator Account',
        email: 'admin@ratestore.com',
        password_hash: adminHash,
        address: '100 Admin HQ Blvd, Tech City',
        role: 'admin',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 2,
        name: 'Store Owner Administrator',
        email: 'owner@ratestore.com',
        password_hash: ownerHash,
        address: '456 Business Plaza, Commerce City',
        role: 'owner',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 3,
        name: 'Regular Testing Customer',
        email: 'user@ratestore.com',
        password_hash: userHash,
        address: '789 Residential Way, Suburbia',
        role: 'user',
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});

    // Insert Store
    await queryInterface.bulkInsert('stores', [
      {
        id: 1,
        name: 'The Grand Downtown Boutique Store',
        email: 'downtown.boutique@store.com',
        address: '123 Fashion Street, New York, NY 10001',
        owner_id: 2,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});

    // Insert Rating
    await queryInterface.bulkInsert('ratings', [
      {
        id: 1,
        user_id: 3,
        store_id: 1,
        value: 5,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('ratings', null, {});
    await queryInterface.bulkDelete('stores', null, {});
    await queryInterface.bulkDelete('users', null, {});
  }
};
