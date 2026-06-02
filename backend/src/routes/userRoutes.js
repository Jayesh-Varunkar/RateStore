const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authMiddleware, roleGuard } = require('../middleware/auth');
const validate = require('../middleware/validation');
const { createUserSchema, changePasswordSchema, listUsersQuerySchema } = require('../middleware/validationSchemas');

/**
 * @openapi
 * /api/users:
 *   get:
 *     summary: List all users (Admin only)
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, email, address, role, created_at]
 *           default: created_at
 *         description: Column to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [ASC, DESC, asc, desc]
 *           default: ASC
 *         description: Sorting direction
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Filter by user name (partial match)
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *         description: Filter by user email (partial match)
 *       - in: query
 *         name: address
 *         schema:
 *           type: string
 *         description: Filter by user address (partial match)
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [admin, user, owner]
 *         description: Filter by user role
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: array
 *                       items:
 *                         type: object
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin access required
 */
router.get('/', authMiddleware, roleGuard(['admin']), validate({ query: listUsersQuerySchema }), userController.listUsers);

/**
 * @openapi
 * /api/users:
 *   post:
 *     summary: Create a user (Admin only)
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 20
 *                 maxLength: 60
 *                 example: "Store Owner Administrator"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "newowner@ratestore.com"
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 maxLength: 16
 *                 example: "NewOwner@1234"
 *               address:
 *                 type: string
 *                 maxLength: 400
 *                 example: "123 Business Way, Metro City"
 *               role:
 *                 type: string
 *                 enum: [admin, user, owner]
 *                 example: "owner"
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: Email conflict
 */
router.post('/', authMiddleware, roleGuard(['admin']), validate({ body: createUserSchema }), userController.createUser);

/**
 * @openapi
 * /api/users/{id}:
 *   get:
 *     summary: Get user details (Admin only)
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *                     address:
 *                       type: string
 *                     avg_rating:
 *                       type: number
 *                       description: Overall average rating of owned stores (only if role is owner)
 *                       example: 4.5
 *       404:
 *         description: User not found
 */
router.get('/:id', authMiddleware, roleGuard(['admin']), userController.getUserDetail);

/**
 * @openapi
 * /api/users/{id}/password:
 *   patch:
 *     summary: Update own password (Any authenticated user)
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID (must match authenticated user)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - newPassword
 *               - confirmPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 example: "User@1234"
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *                 maxLength: 16
 *                 example: "NewUser@1234"
 *               confirmPassword:
 *                 type: string
 *                 minLength: 8
 *                 maxLength: 16
 *                 example: "NewUser@1234"
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       400:
 *         description: Bad request - incorrect old password or mismatch
 *       403:
 *         description: Forbidden - trying to change someone else's password
 *       404:
 *         description: User not found
 */
router.patch('/:id/password', authMiddleware, validate({ body: changePasswordSchema }), userController.changePassword);

module.exports = router;
