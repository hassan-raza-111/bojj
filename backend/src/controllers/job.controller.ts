import { Request, Response, NextFunction, RequestHandler } from "express";
import {
  PrismaClient,
  JobStatus,
  BidStatus,
  PaymentStatus,
} from "@prisma/client";
import { logger } from "../utils/logger";
import {
  createJobSchema,
  createBidSchema,
  updateJobSchema,
} from "../utils/schemas";

const prisma = new PrismaClient();

// Create a new job (Customer only)
export const createJob: RequestHandler = async (req, res, next) => {
  try {
    const jobData = createJobSchema.parse(req.body);

    // Construct location from address components
    const location =
      jobData.street && jobData.city && jobData.state && jobData.zipCode
        ? `${jobData.street}, ${jobData.city}, ${jobData.state} ${jobData.zipCode}`
        : "Location not specified";

    const job = await prisma.job.create({
      data: {
        title: jobData.title,
        description: jobData.description,
        budget: jobData.budget,
        location,
        images: jobData.images || [],
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
        customerId: jobData.customerId,
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

    logger.info(`Job created: ${job.id} by customer: ${jobData.customerId}`);
    res.status(201).json({
      success: true,
      data: job,
      message: "Job posted successfully",
    });
    return;
  } catch (error) {
    logger.error("Error creating job:", error);
    next(error);
    res.status(500).json({
      success: false,
      message: "Failed to create job",
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return;
  }
};

// Get all open jobs (Vendors can see available jobs)
export const getOpenJobs: RequestHandler = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, category, location } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: any = {
      status: JobStatus.OPEN,
    };

    if (category) where.category = category;
    if (location)
      where.location = { contains: location as string, mode: "insensitive" };

    const jobs = await prisma.job.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            rating: true,
          },
        },
        bids: {
          select: {
            id: true,
          },
        },
        _count: {
          select: {
            bids: true,
          },
        },
      },
      skip,
      take: parseInt(limit as string),
      orderBy: {
        createdAt: "desc",
      },
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
    logger.error("Error fetching open jobs:", error);
    next(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch jobs",
    });
    return;
  }
};

// Get job details with bids
export const getJobDetails: RequestHandler = async (req, res, next) => {
  try {
    const { jobId } = req.params;

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            rating: true,
            totalReviews: true,
          },
        },
        vendor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            rating: true,
            experience: true,
            portfolio: true,
          },
        },
        bids: {
          include: {
            vendor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                rating: true,
                experience: true,
                totalReviews: true,
                portfolio: true,
              },
            },
          },
          orderBy: {
            amount: "asc",
          },
        },
        _count: {
          select: {
            bids: true,
          },
        },
      },
    });

    if (!job) {
      res.status(404).json({
        success: false,
        message: "Job not found",
      });
      return;
    }

    res.json({
      success: true,
      data: job,
    });
    return;
  } catch (error) {
    logger.error("Error fetching job details:", error);
    next(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch job details",
    });
    return;
  }
};

// Submit bid (Vendor only)
export const submitBid: RequestHandler = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const bidData = createBidSchema.parse(req.body);

    // Check if job exists and is open
    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      res.status(404).json({
        success: false,
        message: "Job not found",
      });
      return;
    }

    if (job.status !== JobStatus.OPEN) {
      res.status(400).json({
        success: false,
        message: "Job is not open for bidding",
      });
      return;
    }

    // Check if vendor has already bid on this job
    const existingBid = await prisma.bid.findFirst({
      where: {
        jobId,
        vendorId: bidData.vendorId,
      },
    });

    if (existingBid) {
      res.status(400).json({
        success: false,
        message: "You have already bid on this job",
      });
      return;
    }

    const bid = await prisma.bid.create({
      data: {
        jobId,
        vendorId: bidData.vendorId,
        amount: bidData.amount,
        message: bidData.message,
        estimatedDays: bidData.estimatedDays,
      },
      include: {
        vendor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            rating: true,
            experience: true,
            totalReviews: true,
          },
        },
      },
    });

    logger.info(`Bid submitted: ${bid.id} for job: ${jobId}`);
    res.status(201).json({
      success: true,
      data: bid,
      message: "Bid submitted successfully",
    });
    return;
  } catch (error) {
    logger.error("Error submitting bid:", error);
    next(error);
    res.status(500).json({
      success: false,
      message: "Failed to submit bid",
    });
    return;
  }
};

// Hire vendor (Customer only)
export const hireVendor: RequestHandler = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const { vendorId, customerId } = req.body;

    if (!customerId) {
      res.status(400).json({
        success: false,
        message: "customerId is required",
      });
      return;
    }

    // Check if job exists and belongs to customer
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        bids: {
          where: { vendorId },
          include: {
            vendor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                rating: true,
              },
            },
          },
        },
      },
    });

    if (!job) {
      res.status(404).json({
        success: false,
        message: "Job not found",
      });
      return;
    }

    if (job.customerId !== customerId) {
      res.status(403).json({
        success: false,
        message: "You can only hire vendors for your own jobs",
      });
      return;
    }

    if (job.status !== JobStatus.OPEN) {
      res.status(400).json({
        success: false,
        message: "Job is not open for hiring",
      });
      return;
    }

    const bid = job.bids[0];
    if (!bid) {
      res.status(404).json({
        success: false,
        message: "Bid not found for this vendor",
      });
      return;
    }

    // Update job and bid status
    const [updatedJob, updatedBid] = await Promise.all([
      prisma.job.update({
        where: { id: jobId },
        data: {
          status: JobStatus.IN_PROGRESS,
          vendorId,
        },
        include: {
          vendor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              rating: true,
            },
          },
        },
      }),
      prisma.bid.update({
        where: { id: bid.id },
        data: { status: BidStatus.ACCEPTED },
      }),
    ]);

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        jobId,
        customerId,
        vendorId,
        amount: bid.amount,
        status: PaymentStatus.PENDING,
        paymentMethod: "STRIPE", // Default payment method
      },
    });

    logger.info(`Vendor hired: ${vendorId} for job: ${jobId}`);
    res.json({
      success: true,
      data: {
        job: updatedJob,
        payment,
      },
      message: "Vendor hired successfully",
    });
    return;
  } catch (error) {
    logger.error("Error hiring vendor:", error);
    next(error);
    res.status(500).json({
      success: false,
      message: "Failed to hire vendor",
    });
    return;
  }
};

// Complete job (Vendor only)
export const completeJob: RequestHandler = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const { vendorId } = req.body;

    if (!vendorId) {
      res.status(400).json({
        success: false,
        message: "vendorId is required",
      });
      return;
    }

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        payment: true,
      },
    });

    if (!job) {
      res.status(404).json({
        success: false,
        message: "Job not found",
      });
      return;
    }

    if (job.vendorId !== vendorId) {
      res.status(403).json({
        success: false,
        message: "You can only complete jobs assigned to you",
      });
      return;
    }

    if (job.status !== JobStatus.IN_PROGRESS) {
      res.status(400).json({
        success: false,
        message: "Job is not in progress",
      });
      return;
    }

    const updatedJob = await prisma.job.update({
      where: { id: jobId },
      data: {
        status: JobStatus.COMPLETED,
        completedAt: new Date(),
      },
      include: {
        vendor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            rating: true,
          },
        },
      },
    });

    logger.info(`Job completed: ${jobId} by vendor: ${vendorId}`);
    res.json({
      success: true,
      data: updatedJob,
      message: "Job completed successfully",
    });
    return;
  } catch (error) {
    logger.error("Error completing job:", error);
    next(error);
    res.status(500).json({
      success: false,
      message: "Failed to complete job",
    });
    return;
  }
};

// Get customer's jobs
export const getCustomerJobs: RequestHandler = async (req, res, next) => {
  try {
    const customerId = req.query.customerId as string;
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    if (!customerId) {
      res.status(400).json({
        success: false,
        message: "customerId is required",
      });
      return;
    }

    const where: any = { customerId };
    if (status) where.status = status;

    const jobs = await prisma.job.findMany({
      where,
      include: {
        vendor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            rating: true,
          },
        },
        bids: {
          select: { id: true },
        },
        payment: {
          select: {
            id: true,
            status: true,
            amount: true,
          },
        },
        _count: {
          select: { bids: true },
        },
      },
      skip,
      take: parseInt(limit as string),
      orderBy: { createdAt: "desc" },
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
    logger.error("Error fetching customer jobs:", error);
    next(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch jobs",
    });
    return;
  }
};

// Get vendor's jobs
export const getVendorJobs: RequestHandler = async (req, res, next) => {
  try {
    const vendorId = req.query.vendorId as string;
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    if (!vendorId) {
      res.status(400).json({
        success: false,
        message: "vendorId is required",
      });
      return;
    }

    const where: any = { vendorId };
    if (status) where.status = status;

    const jobs = await prisma.job.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            rating: true,
          },
        },
        payment: {
          select: {
            id: true,
            status: true,
            amount: true,
          },
        },
      },
      skip,
      take: parseInt(limit as string),
      orderBy: { createdAt: "desc" },
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
    logger.error("Error fetching vendor jobs:", error);
    next(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch jobs",
    });
    return;
  }
};

// Update a job (Customer only - can only update their own jobs)
export const updateJob: RequestHandler = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const jobData = updateJobSchema.parse(req.body);
    const { customerId } = req.body; // Customer ID from request body for authorization

    if (!customerId) {
      res.status(400).json({
        success: false,
        message: "Customer ID is required for authorization",
      });
      return;
    }

    // Find the job and verify ownership
    const existingJob = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        customer: {
          select: {
            id: true,
          },
        },
        bids: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    });

    if (!existingJob) {
      res.status(404).json({
        success: false,
        message: "Job not found",
      });
      return;
    }

    // Check if the customer owns this job
    if (existingJob.customerId !== customerId) {
      res.status(403).json({
        success: false,
        message: "You can only update your own jobs",
      });
      return;
    }

    // Check if job can be updated (not in progress or completed)
    if (
      existingJob.status === JobStatus.IN_PROGRESS ||
      existingJob.status === JobStatus.COMPLETED
    ) {
      res.status(400).json({
        success: false,
        message: "Cannot update a job that is in progress or completed",
      });
      return;
    }

    // Check if there are any accepted bids
    const hasAcceptedBids = existingJob.bids.some(
      (bid) => bid.status === BidStatus.ACCEPTED
    );
    if (hasAcceptedBids) {
      res.status(400).json({
        success: false,
        message: "Cannot update a job with accepted bids",
      });
      return;
    }

    // Construct location from address components if provided
    let location = existingJob.location;
    if (jobData.street || jobData.city || jobData.state || jobData.zipCode) {
      location =
        jobData.street && jobData.city && jobData.state && jobData.zipCode
          ? `${jobData.street}, ${jobData.city}, ${jobData.state} ${jobData.zipCode}`
          : jobData.location || existingJob.location;
    }

    // Update the job
    const updatedJob = await prisma.job.update({
      where: { id: jobId },
      data: {
        title: jobData.title,
        description: jobData.description,
        budget: jobData.budget,
        location,
        images: jobData.images || existingJob.images,
        category: jobData.category,
        subcategory: jobData.subcategory,
        street: jobData.street,
        city: jobData.city,
        state: jobData.state,
        zipCode: jobData.zipCode,
        timeline: jobData.timeline,
        date: jobData.date ? new Date(jobData.date) : existingJob.date,
        time: jobData.time,
        additionalRequests: jobData.additionalRequests,
        contactPreference: jobData.contactPreference,
        tags: jobData.tags || existingJob.tags,
        status: jobData.status,
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

    logger.info(`Job updated: ${jobId} by customer: ${customerId}`);
    res.json({
      success: true,
      data: updatedJob,
      message: "Job updated successfully",
    });
    return;
  } catch (error) {
    logger.error("Error updating job:", error);
    next(error);
    res.status(500).json({
      success: false,
      message: "Failed to update job",
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return;
  }
};

// Delete a job (Customer only - can only delete their own jobs)
export const deleteJob: RequestHandler = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const { customerId } = req.body; // Customer ID from request body for authorization

    if (!customerId) {
      res.status(400).json({
        success: false,
        message: "Customer ID is required for authorization",
      });
      return;
    }

    // Find the job and verify ownership
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        customer: {
          select: {
            id: true,
          },
        },
        bids: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    });

    if (!job) {
      res.status(404).json({
        success: false,
        message: "Job not found",
      });
      return;
    }

    // Check if the customer owns this job
    if (job.customerId !== customerId) {
      res.status(403).json({
        success: false,
        message: "You can only delete your own jobs",
      });
      return;
    }

    // Check if job can be deleted (not in progress or completed)
    if (
      job.status === JobStatus.IN_PROGRESS ||
      job.status === JobStatus.COMPLETED
    ) {
      res.status(400).json({
        success: false,
        message: "Cannot delete a job that is in progress or completed",
      });
      return;
    }

    // Check if there are any accepted bids
    const hasAcceptedBids = job.bids.some(
      (bid) => bid.status === BidStatus.ACCEPTED
    );
    if (hasAcceptedBids) {
      res.status(400).json({
        success: false,
        message: "Cannot delete a job with accepted bids",
      });
      return;
    }

    // Delete the job (this will cascade delete related bids)
    await prisma.job.delete({
      where: { id: jobId },
    });

    logger.info(`Job deleted: ${jobId} by customer: ${customerId}`);
    res.json({
      success: true,
      message: "Job deleted successfully",
    });
    return;
  } catch (error) {
    logger.error("Error deleting job:", error);
    next(error);
    res.status(500).json({
      success: false,
      message: "Failed to delete job",
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return;
  }
};
