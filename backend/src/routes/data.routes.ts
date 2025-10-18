import { Router } from 'express';
import { getUKCities, getServiceTypes } from '../controllers/data.controller';

const router = Router();

// Get UK cities list
router.get('/uk-cities', getUKCities);

// Get service types list
router.get('/service-types', getServiceTypes);

export default router;
