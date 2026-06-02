const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingController');
const { authMiddleware, roleGuard } = require('../middleware/auth');
const validate = require('../middleware/validation');
const { submitRatingSchema, updateRatingSchema } = require('../middleware/validationSchemas');

/**
 * @openapi
 * /api/ratings:
 *   post:
 *     summary: Submit a store rating (Normal user only)
 *     tags:
 *       - Ratings
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - store_id
 *               - value
 *             properties:
 *               store_id:
 *                 type: integer
 *                 example: 1
 *               value:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 5
 *     responses:
 *       201:
 *         description: Rating submitted successfully (created)
 *       200:
 *         description: Rating updated successfully (updated existing)
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - normal user role required
 *       404:
 *         description: Store not found
 */
router.post('/', authMiddleware, roleGuard(['user']), validate({ body: submitRatingSchema }), ratingController.submitRating);

/**
 * @openapi
 * /api/ratings/{id}:
 *   patch:
 *     summary: Update an existing rating (Normal user only)
 *     tags:
 *       - Ratings
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Rating ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - value
 *             properties:
 *               value:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 4
 *     responses:
 *       200:
 *         description: Rating updated successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Forbidden - not your rating or wrong role
 *       404:
 *         description: Rating not found
 */
router.patch('/:id', authMiddleware, roleGuard(['user']), validate({ body: updateRatingSchema }), ratingController.updateRating);

/**
 * @openapi
 * /api/ratings/store/{storeId}:
 *   get:
 *     summary: Get all raters of a store (Store owner only)
 *     tags:
 *       - Ratings
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: storeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Store ID
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
 *         description: Items per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, email, value, created_at]
 *           default: created_at
 *         description: Sorting criteria
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [ASC, DESC, asc, desc]
 *           default: DESC
 *         description: Sort direction
 *     responses:
 *       200:
 *         description: List of raters retrieved successfully
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
 *                     ratings:
 *                       type: array
 *                       items:
 *                         type: object
 *                     avg_rating:
 *                       type: number
 *                       example: 4.5
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
 *         description: Forbidden - store owner verification failed or wrong role
 *       404:
 *         description: Store not found
 */
router.get('/store/:storeId', authMiddleware, roleGuard(['owner']), ratingController.getRatersByStore);

module.exports = router;
