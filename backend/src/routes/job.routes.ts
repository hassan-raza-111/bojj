import { Router } from "express";
import {
  createJob,
  getOpenJobs,
  getJobDetails,
  submitBid,
  hireVendor,
  completeJob,
  getCustomerJobs,
  getVendorJobs,
  updateJob,
  deleteJob,
} from "../controllers/job.controller";

const router = Router();

// Job posting (Customer only)
router.post("/", createJob);

// Get open jobs (Public - vendors can see available jobs)
router.get("/open", getOpenJobs);

// Get job details with bids (Public - but should be after specific routes)
router.get("/:jobId", getJobDetails);

// Submit bid (Vendor only)
router.post("/:jobId/bids", submitBid);

// Hire vendor (Customer only)
router.post("/:jobId/hire", hireVendor);

// Complete job (Vendor only)
router.patch("/:jobId/complete", completeJob);

// Get customer's jobs
router.get("/customer/all", getCustomerJobs);

// Get vendor's jobs
router.get("/vendor/all", getVendorJobs);

// Update job (Customer only)
router.patch("/:jobId", updateJob);

// Delete job (Customer only)
router.delete("/:jobId", deleteJob);

export { router as jobRouter };
