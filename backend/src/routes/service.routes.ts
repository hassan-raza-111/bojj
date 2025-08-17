import { Router } from 'express';
import {
  createService,
  getAllServices,
  getServiceById,
  updateService,
  deleteService,
} from '../controllers/service.controller';
import {
  authenticateToken,
  requireVendor,
  requireOwnership,
  requireAdmin,
} from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { createServiceSchema, updateServiceSchema } from '../utils/schemas';

const router = Router();

// Public routes (no authentication required)
router.get('/', getAllServices);
router.get('/:id', getServiceById);

// Protected routes (Vendor only)
router.post(
  '/',
  authenticateToken,
  requireVendor,
  validateRequest(createServiceSchema),
  createService
);

router.patch(
  '/:id',
  authenticateToken,
  requireOwnership('service'),
  validateRequest(updateServiceSchema),
  updateService
);

router.delete(
  '/:id',
  authenticateToken,
  requireOwnership('service'),
  deleteService
);

export const serviceRouter = router;
