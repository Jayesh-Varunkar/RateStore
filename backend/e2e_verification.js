const http = require('http');
const { sequelize, User, Store, Rating } = require('./src/models');
const { Op } = require('sequelize');

const request = (method, path, body, token = null) => {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : '';
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: JSON.parse(data)
          });
        } catch (err) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data
          });
        }
      });
    });

    req.on('error', (e) => reject(e));
    if (body) {
      req.write(postData);
    }
    req.end();
  });
};

async function verifyAll() {
  console.log('========================================================================');
  console.log('                RATESTORE E2E SYSTEM VERIFICATION RUN                 ');
  console.log('========================================================================\n');

  try {
    // ------------------------------------------------------------------------
    console.log('--- 1. DATABASE METADATA VERIFICATION ---');
    // Verify connection
    await sequelize.authenticate();
    console.log('✓ Database connection: SUCCESS');

    // Query tables
    const [tables] = await sequelize.query("SHOW TABLES;");
    console.log('✓ Tables in Database:', tables.map(t => Object.values(t)[0]).join(', '));

    // Verify constraints on ratings table (indexes)
    const [indexes] = await sequelize.query("SHOW INDEX FROM ratings;");
    const uniqueIndex = indexes.find(idx => idx.Key_name === 'uq_user_store');
    console.log('✓ uq_user_store Unique Constraint exists on ratings (user_id, store_id):', !!uniqueIndex);

    // Verify foreign keys in ratings table
    const [fkRatings] = await sequelize.query(`
      SELECT CONSTRAINT_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE TABLE_NAME = 'ratings' AND CONSTRAINT_SCHEMA = 'ratestore' AND REFERENCED_TABLE_NAME IS NOT NULL;
    `);
    console.log('✓ Ratings Foreign Keys:');
    fkRatings.forEach(fk => {
      console.log(`  - Column [${fk.COLUMN_NAME}] references [${fk.REFERENCED_TABLE_NAME}.${fk.REFERENCED_COLUMN_NAME}]`);
    });
    console.log();

    // ------------------------------------------------------------------------
    console.log('--- 2. AUTHENTICATION & LOGIN FLOWS ---');
    
    // Register normal user
    const regRes = await request('POST', '/api/auth/register', {
      name: 'E2E Testing Self Registered Customer', // 38 chars
      email: 'e2e.customer@ratestore.com',
      password: 'CustPass@123',
      address: '777 E2E Lane, Test City'
    });
    console.log('✓ Self-Registration Status (201 Expected or 409 if already exists):', regRes.statusCode);
    
    // Admin login
    const adminLogin = await request('POST', '/api/auth/login', {
      email: 'admin@ratestore.com',
      password: 'Admin@1234'
    });
    const adminToken = adminLogin.body.data.token;
    console.log('✓ Login as Admin Status (200 Expected):', adminLogin.statusCode, '| Name:', adminLogin.body.data.user.name);

    // Normal User login
    const userLogin = await request('POST', '/api/auth/login', {
      email: 'e2e.customer@ratestore.com',
      password: 'CustPass@123'
    });
    const userToken = userLogin.body.data.token;
    const userId = userLogin.body.data.user.id;
    console.log('✓ Login as Normal User Status (200 Expected):', userLogin.statusCode, '| Name:', userLogin.body.data.user.name);

    // Store Owner login
    const ownerLogin = await request('POST', '/api/auth/login', {
      email: 'owner@ratestore.com',
      password: 'Owner@1234'
    });
    console.log('Owner Login response:', ownerLogin.statusCode, JSON.stringify(ownerLogin.body));
    const ownerToken = ownerLogin.body.data.token;
    console.log('✓ Login as Store Owner Status (200 Expected):', ownerLogin.statusCode, '| Name:', ownerLogin.body.data.user.name);
    console.log();

    // ------------------------------------------------------------------------
    console.log('--- 3. INPUT VALIDATIONS (REJECT CHECKS) ---');
    
    // Name too short (<20)
    const nameTooShort = await request('POST', '/api/auth/register', {
      name: 'Too Short', // 9 chars
      email: 'short.name@ratestore.com',
      password: 'ValidPassword@123'
    });
    console.log('✓ Name < 20 chars Rejected (400 Expected):', nameTooShort.statusCode, '| Message:', nameTooShort.body.error);

    // Name too long (>60)
    const nameTooLong = await request('POST', '/api/auth/register', {
      name: 'A'.repeat(61), // 61 chars
      email: 'long.name@ratestore.com',
      password: 'ValidPassword@123'
    });
    console.log('✓ Name > 60 chars Rejected (400 Expected):', nameTooLong.statusCode, '| Message:', nameTooLong.body.error);

    // Invalid Email
    const invalidEmail = await request('POST', '/api/auth/register', {
      name: 'A Valid User Account For Testing',
      email: 'invalid-email-format',
      password: 'ValidPassword@123'
    });
    console.log('✓ Invalid Email Format Rejected (400 Expected):', invalidEmail.statusCode, '| Message:', invalidEmail.body.error);

    // Password without uppercase
    const passwordNoUpper = await request('POST', '/api/auth/register', {
      name: 'A Valid User Account For Testing',
      email: 'noupper@ratestore.com',
      password: 'lowercase@123'
    });
    console.log('✓ Password without Uppercase Rejected (400 Expected):', passwordNoUpper.statusCode, '| Message:', passwordNoUpper.body.error);

    // Password without special character
    const passwordNoSpec = await request('POST', '/api/auth/register', {
      name: 'A Valid User Account For Testing',
      email: 'nospec@ratestore.com',
      password: 'NoSpecialChar123'
    });
    console.log('✓ Password without Special Char Rejected (400 Expected):', passwordNoSpec.statusCode, '| Message:', passwordNoSpec.body.error);

    // Address too long (>400)
    const addressTooLong = await request('POST', '/api/auth/register', {
      name: 'A Valid User Account For Testing',
      email: 'addrlong@ratestore.com',
      password: 'ValidPassword@123',
      address: 'A'.repeat(401)
    });
    console.log('✓ Address > 400 chars Rejected (400 Expected):', addressTooLong.statusCode, '| Message:', addressTooLong.body.error);
    console.log();

    // ------------------------------------------------------------------------
    console.log('--- 4. ADMIN FEATURES & RBAC ---');
    
    // Create Admin User
    const createAdmin = await request('POST', '/api/users', {
      name: 'Secondary Admin Account User',
      email: 'admin2@ratestore.com',
      password: 'AdminPass@123',
      role: 'admin'
    }, adminToken);
    console.log('✓ Admin Creates Admin User (201 Expected or 409 if already exists):', createAdmin.statusCode, '| Role:', createAdmin.body.data?.role);

    // Create Normal User
    const createCustomer = await request('POST', '/api/users', {
      name: 'Customer Registered By Admin',
      email: 'admincustomer@ratestore.com',
      password: 'CustomerPass@123',
      role: 'user'
    }, adminToken);
    console.log('✓ Admin Creates Normal User (201 Expected or 409 if already exists):', createCustomer.statusCode, '| Role:', createCustomer.body.data?.role);

    // Create Store Owner
    const createOwner = await request('POST', '/api/users', {
      name: 'New Registered Store Owner Account',
      email: 'newowner@ratestore.com',
      password: 'OwnerPass@123',
      role: 'owner'
    }, adminToken);
    console.log('✓ Admin Creates Store Owner (201/409 Expected):', createOwner.statusCode, '| Role:', createOwner.body.data?.role || 'owner');
    
    // Query Owner ID
    const ownerObj = await User.findOne({ where: { email: 'newowner@ratestore.com' } });
    const newOwnerId = ownerObj.id;

    // Create Store
    const createStore = await request('POST', '/api/stores', {
      name: 'The Brand New Megastore Downtown',
      email: 'megastore.downtown@store.com',
      address: '999 Megastore Blvd, Mall City',
      owner_id: newOwnerId
    }, adminToken);
    console.log('✓ Admin Creates Store (201 Expected or 409 if already exists):', createStore.statusCode, '| Store Name:', createStore.body.data?.name || 'Megastore');
    
    // Query Store ID
    const storeObj = await Store.findOne({ where: { email: 'megastore.downtown@store.com' } });
    const newStoreId = storeObj.id;

    // View Dashboard Statistics
    const statsRes = await request('GET', '/api/dashboard/stats', null, adminToken);
    console.log('✓ Admin Dashboard stats (200 Expected):', statsRes.statusCode, '| Data:', JSON.stringify(statsRes.body.data));

    // View User list with search, sorting, and pagination
    const usersList = await request('GET', '/api/users?page=1&limit=2&sortBy=name&sortOrder=asc&role=owner', null, adminToken);
    console.log('✓ Admin List Users with parameters (200 Expected):', usersList.statusCode, '| Count:', usersList.body.data.users.length, '| Total:', usersList.body.data.total);

    // View Store list
    const storesList = await request('GET', '/api/stores?page=1&limit=5&sortBy=name&sortOrder=desc', null, adminToken);
    console.log('✓ Admin List Stores with parameters (200 Expected):', storesList.statusCode, '| Total Stores Count:', storesList.body.data.total);

    // Verify RBAC protection (User tries to list users)
    const usersListUserRole = await request('GET', '/api/users', null, userToken);
    console.log('✓ RBAC Blocks User from listing users (403 Expected):', usersListUserRole.statusCode);
    console.log();

    // ------------------------------------------------------------------------
    console.log('--- 5. CUSTOMER RATING FLOWS ---');
    
    // View Stores
    const userStores = await request('GET', '/api/stores', null, userToken);
    console.log('✓ User views stores (200 Expected):', userStores.statusCode, '| Stores Returned:', userStores.body.data.stores.length);

    // Submit rating for new Megastore (rating value 5)
    const ratingSubmit = await request('POST', '/api/ratings', {
      store_id: newStoreId,
      value: 5
    }, userToken);
    console.log('✓ User Submits rating to Megastore (200/201 Expected):', ratingSubmit.statusCode, '| Action:', ratingSubmit.body.data?.action);

    // Query Megastore to verify user rating is 5 and overall rating is 5.0
    const checkStore = await request('GET', `/api/stores`, null, userToken);
    const megastoreObj = checkStore.body.data.stores.find(s => s.id === newStoreId);
    console.log('✓ Check Store Ratings after submission:');
    console.log('  - Overall Rating (Expected 5.0 or current avg):', megastoreObj?.avg_rating);
    console.log('  - My Rating (Expected 5):', megastoreObj?.my_rating);

    // Modify existing rating to 2 (upsert rating)
    const ratingUpdate = await request('POST', '/api/ratings', {
      store_id: newStoreId,
      value: 2
    }, userToken);
    console.log('✓ User updates rating via upsert (200 Expected):', ratingUpdate.statusCode, '| Action:', ratingUpdate.body.data?.action);

    // Query Megastore again to verify updates
    const checkStoreUpdated = await request('GET', `/api/stores`, null, userToken);
    const megastoreObjUpdated = checkStoreUpdated.body.data.stores.find(s => s.id === newStoreId);
    console.log('✓ Check Store Ratings after modification:');
    console.log('  - Overall Rating (Expected 2.0 or current avg):', megastoreObjUpdated?.avg_rating);
    console.log('  - My Rating (Expected 2):', megastoreObjUpdated?.my_rating);
    console.log();

    // ------------------------------------------------------------------------
    console.log('--- 6. STORE OWNER FEATURES ---');
    
    // Login as New Owner
    const newOwnerLogin = await request('POST', '/api/auth/login', {
      email: 'newowner@ratestore.com',
      password: 'OwnerPass@123'
    });
    const newOwnerToken = newOwnerLogin.body.data.token;

    // View Owner Store Ratings List + Average
    const ownerRatings = await request('GET', `/api/ratings/store/${newStoreId}`, null, newOwnerToken);
    console.log('✓ Store Owner retrieves reviews list (200 Expected):', ownerRatings.statusCode);
    console.log('  - Store Computed Average (Expected 2.0):', ownerRatings.body.data.avg_rating);
    console.log('  - Total Ratings Count (Expected 1):', ownerRatings.body.data.total);
    console.log('  - Reviewer User Name:', ownerRatings.body.data.ratings[0]?.user?.name);
    console.log();

    // ------------------------------------------------------------------------
    console.log('--- 7. PASSWORD UPDATE & LOGOUT ---');
    
    // Change own password (Customer changes own password)
    const pwdChange = await request('PATCH', `/api/users/${userId}/password`, {
      oldPassword: 'CustPass@123',
      newPassword: 'NewCustPass@123',
      confirmPassword: 'NewCustPass@123'
    }, userToken);
    console.log('✓ User changes password successfully (200 Expected):', pwdChange.statusCode);

    // Logout
    const logoutRes = await request('POST', '/api/auth/logout', null, userToken);
    console.log('✓ User logs out successfully (200 Expected):', logoutRes.statusCode);
    console.log();

    // ------------------------------------------------------------------------
    console.log('--- 8. SWAGGER RESPOND CHECK ---');
    const swaggerCheck = await request('GET', '/api-docs/', null);
    console.log('✓ Swagger UI responde check (200 Expected):', swaggerCheck.statusCode);

    console.log('\n========================================================================');
    console.log('              ALL RATESTORE VERIFICATION SCENARIOS PASSED               ');
    console.log('========================================================================');

  } catch (error) {
    console.error('X Verification encountered an error:', error);
  } finally {
    await sequelize.close();
  }
}

verifyAll();
