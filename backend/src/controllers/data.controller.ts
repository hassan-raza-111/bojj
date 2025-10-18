import { RequestHandler } from 'express';
import { UK_CITIES, SERVICE_TYPES } from '../data/ukCities';

// Get UK cities list
export const getUKCities: RequestHandler = async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        cities: UK_CITIES,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch UK cities',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Get service types list
export const getServiceTypes: RequestHandler = async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        serviceTypes: SERVICE_TYPES,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch service types',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
