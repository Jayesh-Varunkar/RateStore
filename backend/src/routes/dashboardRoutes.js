const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authMiddleware, roleGuard } = require('../middleware/auth');

/**
 * @openapi
 * /api/dashboard/stats:
 *   get:
 *     summary: Retrieve total system statistics (Admin only)
 *     tags:
 *       - Dashboard
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics retrieved successfully
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
 *                     totalUsers:
 *                       type: integer
 *                       example: 15
 *                     totalStores:
 *                       type: integer
 *                       example: 5
 *                     totalRatings:
 *                       type: integer
 *                       example: 45
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin access required
 */
router.get('/stats', authMiddleware, roleGuard(['admin']), dashboardController.getStats);

module.exports = router;
