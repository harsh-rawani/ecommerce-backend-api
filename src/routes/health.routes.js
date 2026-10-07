import { Router } from 'express';
import { getLiveness, getReadiness } from '../controllers/health.controller.js';

const router = Router();

/**
 * @openapi
 * /health:
 *   get:
 *     summary: Liveness check
 *     tags: [Monitoring]
 *     description: Checks if the Node.js event loop is operational.
 *     responses:
 *       200:
 *         description: Service is healthy and alive.
 */
router.get('/', getLiveness);

/**
 * @openapi
 * /health/ready:
 *   get:
 *     summary: Readiness check
 *     tags: [Monitoring]
 *     description: Validates database connections and downstream readiness for load balancers.
 *     responses:
 *       200:
 *         description: Service dependencies are ready to accept traffic.
 *       503:
 *         description: Downstream database connection is disconnected.
 */
router.get('/ready', getReadiness);

export default router;