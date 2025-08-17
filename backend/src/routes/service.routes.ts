import { Router } from "express";
import {
  createService,
  deleteService,
  getAllServices,
  getServiceById,
  updateService,
  getCategories,
} from "../controllers/service.controller";

const router = Router();

router.post("/", createService);
router.get("/", getAllServices);
router.get("/categories", getCategories);
router.get("/:id", getServiceById);
router.patch("/:id", updateService);
router.delete("/:id", deleteService);

export const serviceRouter = router;
