import { Router } from "express";
import {
  processPayment,
  releasePayment,
  refundPayment,
  getPaymentDetails,
  getCustomerPayments,
  getVendorPayments,
} from "../controllers/payment.controller";

const router = Router();

// Process payment and put in escrow (Customer only)
router.post("/:paymentId/process", processPayment);

// Release payment to vendor (Admin only)
router.post("/:paymentId/release", releasePayment);

// Refund payment to customer (Admin only)
router.post("/:paymentId/refund", refundPayment);

// Get payment details
router.get("/:paymentId", getPaymentDetails);

// Get customer's payment history
router.get("/customer/history", getCustomerPayments);

// Get vendor's payment history
router.get("/vendor/history", getVendorPayments);

export { router as paymentRouter };
