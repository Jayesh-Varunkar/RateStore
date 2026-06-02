USE ratestore;

-- Truncate tables to avoid duplicates during multiple seedings (disable FK temporarily)
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE ratings;
TRUNCATE TABLE stores;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- Seed users
INSERT INTO users (id, name, email, password_hash, address, role, created_at, updated_at) VALUES
(1, 'System Administrator Account', 'admin@ratestore.com', '$2b$12$Y027DVWoOtIeC3X596ukrugHuutM06f2hkaFVfvXQ..cShOO1BqTe', '100 Admin HQ Blvd, Tech City', 'admin', NOW(), NOW()),
(2, 'Store Owner Administrator', 'owner@ratestore.com', '$2b$12$0ljezWwMOdeyLajJcimkzuyV5slSX7BdfJagpRH5D1i9qz8dmJwWG', '456 Business Plaza, Commerce City', 'owner', NOW(), NOW()),
(3, 'Regular Testing Customer', 'user@ratestore.com', '$2b$12$PD3AEA8T1w0/YxqYm5AiIOd0HgMORMDJKsvieh5a.cgE/kjFLBKMi', '789 Residential Way, Suburbia', 'user', NOW(), NOW());

-- Seed stores
INSERT INTO stores (id, name, email, address, owner_id, created_at, updated_at) VALUES
(1, 'The Grand Downtown Boutique Store', 'downtown.boutique@store.com', '123 Fashion Street, New York, NY 10001', 2, NOW(), NOW());

-- Seed ratings
INSERT INTO ratings (id, user_id, store_id, value, created_at, updated_at) VALUES
(1, 3, 1, 5, NOW(), NOW());
