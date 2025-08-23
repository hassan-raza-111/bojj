import { RequestHandler } from 'express';
import { prisma } from '../config/database';
import { logger } from '../utils/logger';

// Create a new job (Customer only)
export const createJob: RequestHandler = async (req, res, next) => {
  try {
    const jobData = req.body;
    const { customerId } = req.body;

    if (!customerId) {
      res.status(400).json({
        success: false,
        message: 'Customer ID is required',
      });
      return;
    }

    // Build location string from address components
    let location = jobData.location || '';
    if (jobData.street && jobData.city && jobData.state && jobData.zipCode) {
      location = `${jobData.street}, ${jobData.city}, ${jobData.state} ${jobData.zipCode}`;
    }

    const job = await prisma.job.create({
      data: {
        title: jobData.title,
        description: jobData.description,
        budget: jobData.budget,
        budgetType: jobData.budgetType || 'FIXED',
        location,
        // images: [], // Temporarily removed due to type issues
        category: jobData.category,
        subcategory: jobData.subcategory || null,
        street: jobData.street || null,
        city: jobData.city || null,
        state: jobData.state || null,
        zipCode: jobData.zipCode || null,
        timeline: jobData.timeline || null,
        date: jobData.date ? new Date(jobData.date) : null,
        time: jobData.time || null,
        additionalRequests: jobData.additionalRequests || null,
        contactPreference: jobData.contactPreference || null,
        tags: jobData.tags || [],
        requirements: jobData.requirements || [],
        customerId: jobData.customerId,
      },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            customerProfile: {
              select: {
                totalJobsPosted: true,
                totalSpent: true,
              },
            },
          },
        },
      },
    });

    logger.info(`Job created: ${job.id} by customer: ${customerId}`);
    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      data: { job },
    });
    return;
  } catch (error) {
    logger.error('Error creating job:', error);
    next(error);
    res.status(500).json({
      success: false,
      message: 'Failed to create job',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return;
  }
};

// Get open jobs (Public - no authentication required)
export const getOpenJobs: RequestHandler = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, category, budget, location } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: any = { status: 'OPEN' };
    if (category) where.category = category;
    if (budget) where.budget = { lte: parseFloat(budget as string) };
    if (location)
      where.location = { contains: location as string, mode: 'insensitive' };

    const jobs = await prisma.job.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            customerProfile: {
              select: {
                totalJobsPosted: true,
                totalSpent: true,
              },
            },
          },
        },
        _count: {
          select: { bids: true },
        },
      },
      skip,
      take: parseInt(limit as string),
      orderBy: { createdAt: 'desc' },
    });

    const total = await prisma.job.count({ where });

    res.json({
      success: true,
      data: jobs,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string)),
      },
    });
    return;
  } catch (error) {
    logger.error('Error fetching open jobs:', error);
    next(error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch jobs',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return;
  }
};

// Get job by ID
export const getJobById: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;

    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        assignedVendor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            vendorProfile: {
              select: {
                rating: true,
                experience: true,
              },
            },
          },
        },
        bids: {
          include: {
            vendor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                vendorProfile: {
                  select: {
                    rating: true,
                    experience: true,
                  },
                },
              },
            },
          },
        },
        _count: {
          select: { bids: true },
        },
      },
    });

    if (!job) {
      res.status(404).json({
        success: false,
        message: 'Job not found',
      });
      return;
    }

    res.json({
      success: true,
      data: { job },
    });
    return;
  } catch (error) {
    logger.error('Error fetching job:', error);
    next(error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch job',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return;
  }
};

// Submit a bid (Vendor only)
export const submitBid: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const bidData = req.body;
    const { vendorId } = req.body;

    if (!vendorId) {
      res.status(400).json({
        success: false,
        message: 'Vendor ID is required',
      });
      return;
    }

    // Check if job exists and is open
    const job = await prisma.job.findUnique({
      where: { id },
      select: { id: true, status: true, customerId: true },
    });

    if (!job) {
      res.status(404).json({
        success: false,
        message: 'Job not found',
      });
      return;
    }

    if (job.status !== 'OPEN') {
      res.status(400).json({
        success: false,
        message: 'Job is not open for bidding',
      });
      return;
    }

    // Check if vendor has already bid on this job
    const existingBid = await prisma.bid.findFirst({
      where: {
        jobId: id,
        vendorId,
      },
    });

    if (existingBid) {
      res.status(400).json({
        success: false,
        message: 'You have already bid on this job',
      });
      return;
    }

    const bid = await prisma.bid.create({
      data: {
        jobId: id,
        vendorId: bidData.vendorId,
        amount: bidData.amount,
        description: bidData.description,
        timeline: bidData.timeline,
        milestones: bidData.milestones || {},
      },
      include: {
        vendor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            vendorProfile: {
              select: {
                rating: true,
                experience: true,
              },
            },
          },
        },
      },
    });

    logger.info(
      `Bid submitted: ${bid.id} for job: ${id} by vendor: ${vendorId}`
    );
    res.status(201).json({
      success: true,
      message: 'Bid submitted successfully',
      data: { bid },
    });
    return;
  } catch (error) {
    logger.error('Error submitting bid:', error);
    next(error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit bid',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return;
  }
};

// Get job bids
export const getJobBids: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;

    const bids = await prisma.bid.findMany({
      where: { jobId: id },
      include: {
        vendor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            vendorProfile: {
              select: {
                rating: true,
                experience: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: { bids },
    });
    return;
  } catch (error) {
    logger.error('Error fetching job bids:', error);
    next(error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bids',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return;
  }
};

// Accept a bid (Customer only)
export const acceptBid: RequestHandler = async (req, res, next) => {
  try {
    const { id, bidId } = req.params;
    const { customerId } = req.body;

    if (!customerId) {
      res.status(400).json({
        success: false,
        message: 'Customer ID is required',
      });
      return;
    }

    // Check if job exists and belongs to customer
    const job = await prisma.job.findUnique({
      where: { id },
      select: { id: true, customerId: true, status: true },
    });

    if (!job) {
      res.status(404).json({
        success: false,
        message: 'Job not found',
      });
      return;
    }

    if (job.customerId !== customerId) {
      res.status(403).json({
        success: false,
        message: 'You can only accept bids on your own jobs',
      });
      return;
    }

    if (job.status !== 'OPEN') {
      res.status(400).json({
        success: false,
        message: 'Job is not open for bidding',
      });
      return;
    }

    // Check if bid exists
    const bid = await prisma.bid.findUnique({
      where: { id: bidId },
      select: { id: true, jobId: true, vendorId: true, status: true },
    });

    if (!bid || bid.jobId !== id) {
      res.status(404).json({
        success: false,
        message: 'Bid not found',
      });
      return;
    }

    if (bid.status !== 'PENDING') {
      res.status(400).json({
        success: false,
        message: 'Bid is not pending',
      });
      return;
    }

    // Update bid status to accepted
    await prisma.bid.update({
      where: { id: bidId },
      data: { status: 'ACCEPTED' },
    });

    // Update job status and assign vendor
    await prisma.job.update({
      where: { id },
      data: {
        status: 'IN_PROGRESS',
        assignedVendorId: bid.vendorId,
      },
    });

    // Reject all other bids
    await prisma.bid.updateMany({
      where: {
        jobId: id,
        id: { not: bidId },
        status: 'PENDING',
      },
      data: { status: 'REJECTED' },
    });

    logger.info(
      `Bid accepted: ${bidId} for job: ${id} by customer: ${customerId}`
    );
    res.json({
      success: true,
      message: 'Bid accepted successfully',
    });
    return;
  } catch (error) {
    logger.error('Error accepting bid:', error);
    next(error);
    res.status(500).json({
      success: false,
      message: 'Failed to accept bid',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return;
  }
};

// Complete a job (Vendor only)
export const completeJob: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { vendorId } = req.body;

    if (!vendorId) {
      res.status(400).json({
        success: false,
        message: 'Vendor ID is required',
      });
      return;
    }

    const job = await prisma.job.findUnique({
      where: { id },
      select: { id: true, assignedVendorId: true, status: true },
    });

    if (!job) {
      res.status(404).json({
        success: false,
        message: 'Job not found',
      });
      return;
    }

    if (job.assignedVendorId !== vendorId) {
      res.status(403).json({
        success: false,
        message: 'You can only complete jobs assigned to you',
      });
      return;
    }

    if (job.status !== 'IN_PROGRESS') {
      res.status(400).json({
        success: false,
        message: 'Job must be in progress to be completed',
      });
      return;
    }

    // Update job status
    await prisma.job.update({
      where: { id },
      data: { status: 'COMPLETED' },
    });

    logger.info(`Job completed: ${id} by vendor: ${vendorId}`);
    res.json({
      success: true,
      message: 'Job completed successfully',
    });
    return;
  } catch (error) {
    logger.error('Error completing job:', error);
    next(error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete job',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return;
  }
};

// Get customer jobs (Customer only)
export const getCustomerJobs: RequestHandler = async (req, res, next) => {
  try {
    const { customerId } = req.query;
    const userId = (req as any).user?.id; // Get from authenticated user

    if (!customerId) {
      res.status(400).json({
        success: false,
        message: 'Customer ID is required',
      });
      return;
    }

    if (customerId !== userId) {
      res.status(403).json({
        success: false,
        message: 'You can only view your own jobs',
      });
      return;
    }

    const jobs = await prisma.job.findMany({
      where: { customerId: customerId as string },
      include: {
        assignedVendor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            vendorProfile: {
              select: {
                rating: true,
                experience: true,
              },
            },
          },
        },
        bids: {
          include: {
            vendor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                vendorProfile: {
                  select: {
                    rating: true,
                    experience: true,
                  },
                },
              },
            },
          },
        },
        _count: {
          select: { bids: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    logger.info(`Customer jobs retrieved: ${customerId} by user: ${userId}`);
    res.json({
      success: true,
      data: { jobs },
    });
    return;
  } catch (error) {
    logger.error('Error retrieving customer jobs:', error);
    next(error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve customer jobs',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return;
  }
};

// Get vendor jobs (Vendor only)
export const getVendorJobs: RequestHandler = async (req, res, next) => {
  try {
    const { vendorId } = req.query;
    const userId = (req as any).user?.id; // Get from authenticated user

    if (!vendorId) {
      res.status(400).json({
        success: false,
        message: 'Vendor ID is required',
      });
      return;
    }

    if (vendorId !== userId) {
      res.status(403).json({
        success: false,
        message: 'You can only view your own jobs',
      });
      return;
    }

    const jobs = await prisma.job.findMany({
      where: { assignedVendorId: vendorId as string },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        bids: {
          include: {
            vendor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                vendorProfile: {
                  select: {
                    rating: true,
                    experience: true,
                  },
                },
              },
            },
          },
        },
        _count: {
          select: { bids: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    logger.info(`Vendor jobs retrieved: ${vendorId} by user: ${userId}`);
    res.json({
      success: true,
      data: { jobs },
    });
    return;
  } catch (error) {
    logger.error('Error retrieving vendor jobs:', error);
    next(error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve vendor jobs',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return;
  }
};

// Update a job (Customer only - can only update their own jobs)
export const updateJob: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const jobData = req.body;
    const { customerId } = req.body;

    if (!customerId) {
      res.status(400).json({
        success: false,
        message: 'Customer ID is required for authorization',
      });
      return;
    }

    // Find the job and verify ownership
    const existingJob = await prisma.job.findUnique({
      where: { id },
      select: {
        id: true,
        customerId: true,
        status: true,
        title: true,
        description: true,
        budget: true,
        budgetType: true,
        location: true,
        category: true,
        subcategory: true,
        tags: true,
        requirements: true,
        priority: true,
        deadline: true,
        isRemote: true,
      },
    });

    if (!existingJob) {
      res.status(404).json({
        success: false,
        message: 'Job not found',
      });
      return;
    }

    if (existingJob.customerId !== customerId) {
      res.status(403).json({
        success: false,
        message: 'You can only update your own jobs',
      });
      return;
    }

    if (existingJob.status !== 'OPEN') {
      res.status(400).json({
        success: false,
        message: 'You can only update open jobs',
      });
      return;
    }

    // Build location string from address components
    let location = jobData.location || existingJob.location;
    if (jobData.street || jobData.city || jobData.state || jobData.zipCode) {
      if (jobData.street && jobData.city && jobData.state && jobData.zipCode) {
        location = `${jobData.street}, ${jobData.city}, ${jobData.state} ${jobData.zipCode}`;
      }
    }

    // Update the job
    const updatedJob = await prisma.job.update({
      where: { id },
      data: {
        title: jobData.title || existingJob.title,
        description: jobData.description || existingJob.description,
        budget:
          jobData.budget !== undefined ? jobData.budget : existingJob.budget,
        budgetType: jobData.budgetType || existingJob.budgetType,
        location,
        images: [],
        category: jobData.category || existingJob.category,
        subcategory:
          jobData.subcategory !== undefined
            ? jobData.subcategory
            : existingJob.subcategory,
        tags: jobData.tags || existingJob.tags,
        requirements: jobData.requirements || existingJob.requirements,
        street: jobData.street,
        city: jobData.city,
        state: jobData.state,
        zipCode: jobData.zipCode,
        timeline: jobData.timeline,
        date: jobData.date ? new Date(jobData.date) : null,
        time: jobData.time,
        additionalRequests: jobData.additionalRequests,
        contactPreference: jobData.contactPreference,
        priority: jobData.priority || existingJob.priority,
        deadline: jobData.deadline
          ? new Date(jobData.deadline)
          : existingJob.deadline,
        isRemote:
          jobData.isRemote !== undefined
            ? jobData.isRemote
            : existingJob.isRemote,
      },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    logger.info(`Job updated: ${id} by customer: ${customerId}`);
    res.json({
      success: true,
      message: 'Job updated successfully',
      data: { job: updatedJob },
    });
    return;
  } catch (error) {
    logger.error('Error updating job:', error);
    next(error);
    res.status(500).json({
      success: false,
      message: 'Failed to update job',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return;
  }
};

// Delete a job (Customer only - can only delete their own jobs)
export const deleteJob: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { customerId } = req.body;

    if (!customerId) {
      res.status(400).json({
        success: false,
        message: 'Customer ID is required for authorization',
      });
      return;
    }

    // Find the job and verify ownership
    const job = await prisma.job.findUnique({
      where: { id },
      select: { id: true, customerId: true, status: true },
    });

    if (!job) {
      res.status(404).json({
        success: false,
        message: 'Job not found',
      });
      return;
    }

    if (job.customerId !== customerId) {
      res.status(403).json({
        success: false,
        message: 'You can only delete your own jobs',
      });
      return;
    }

    if (job.status !== 'OPEN') {
      res.status(400).json({
        success: false,
        message: 'You can only delete open jobs',
      });
      return;
    }

    // Delete the job (cascades to bids)
    await prisma.job.delete({
      where: { id },
    });

    logger.info(`Job deleted: ${id} by customer: ${customerId}`);
    res.json({
      success: true,
      message: 'Job deleted successfully',
    });
    return;
  } catch (error) {
    logger.error('Error deleting job:', error);
    next(error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete job',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return;
  }
};

// Get all jobs (Admin only)
export const getAllJobs: RequestHandler = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, category } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: any = {};
    if (status) where.status = status;
    if (category) where.category = category;

    const jobs = await prisma.job.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        assignedVendor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        _count: {
          select: { bids: true },
        },
      },
      skip,
      take: parseInt(limit as string),
      orderBy: { createdAt: 'desc' },
    });

    const total = await prisma.job.count({ where });

    res.json({
      success: true,
      data: jobs,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string)),
      },
    });
    return;
  } catch (error) {
    logger.error('Error fetching all jobs:', error);
    next(error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve jobs',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return;
  }
};
