const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const { authMiddleware, roleGuard } = require('../middleware/auth');
const validate = require('../middleware/validation');
const { createStoreSchema, listStoresQuerySchema } = require('../middleware/validationSchemas');

/**
 * @openapi
 * /api/stores:
 *   get:
 *     summary: List stores with average and user ratings
 *     tags:
 *       - Stores
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, address, created_at, avg_rating]
 *           default: name
 *         description: Sort column
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
 *         description: Filter stores by name
 *       - in: query
 *         name: address
 *         schema:
 *           type: string
 *         description: Filter stores by address
 *     responses:
 *       200:
 *         description: Stores retrieved successfully
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
 *                     stores:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           name:
 *                             type: string
 *                           email:
 *                             type: string
 *                           address:
 *                             type: string
 *                           owner_id:
 *                             type: integer
 *                           avg_rating:
 *                             type: number
 *                             example: 4.33
 *                           my_rating:
 *                             type: integer
 *                             nullable: true
 *                             example: 5
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 */
router.get('/', authMiddleware, validate({ query: listStoresQuerySchema }), storeController.listStores);

/**
 * @openapi
 * /api/stores:
 *   post:
 *     summary: Create a new store (Admin only)
 *     tags:
 *       - Stores
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
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 20
 *                 maxLength: 60
 *                 example: "The Grand Downtown Boutique Store"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "downtown.boutique@store.com"
 *               address:
 *                 type: string
 *                 maxLength: 400
 *                 example: "123 Fashion Street, New York, NY 10001"
 *               owner_id:
 *                 type: integer
 *                 nullable: true
 *                 example: 2
 *     responses:
 *       201:
 *         description: Store created successfully
 *       400:
 *         description: Owner user validation error or missing fields
 *       409:
 *         description: Email conflict
 */
router.post('/', authMiddleware, roleGuard(['admin']), validate({ body: createStoreSchema }), storeController.createStore);

/**
 * @openapi
 * /api/stores/{id}:
 *   get:
 *     summary: Get details of a single store
 *     tags:
 *       - Stores
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Store ID
 *     responses:
 *       200:
 *         description: Store details retrieved successfully
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
 *                     address:
 *                       type: string
 *                     owner_id:
 *                       type: integer
 *                     avg_rating:
 *                       type: number
 *                       example: 4.67
 *                     owner:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         name:
 *                           type: string
 *                         email:
 *                           type: string
 *       404:
 *         description: Store not found
 */
router.get('/:id', authMiddleware, storeController.getStoreDetail);

module.exports = router;
