import { Request, Response, NextFunction, RequestHandler } from "express";
import { prisma } from "../config/database";
import { AppError } from "../middleware/error.middleware";
import {
  createServiceSchema,
  updateServiceSchema,
  createReviewSchema,
} from "../utils/schemas";

export const createService: RequestHandler = async (req, res, next) => {
  try {
    const serviceData = createServiceSchema.parse(req.body);
    const service = await prisma.service.create({
      data: serviceData,
    });
    res.status(201).json({
      success: true,
      data: { service },
      message: "Service created successfully",
    });
    return;
  } catch (error) {
    next(error);
    res.status(500).json({
      success: false,
      message: "Failed to create service",
    });
    return;
  }
};

export const getCategories: RequestHandler = async (req, res, next) => {
  try {
    // Get all services that are parent categories (no parentId)
    const categories = await prisma.service.findMany({
      where: {
        parentId: null,
        status: "ACTIVE",
      },
      select: {
        id: true,
        title: true,
        code: true,
        description: true,
        children: {
          where: {
            status: "ACTIVE",
          },
          select: {
            id: true,
            title: true,
            code: true,
            description: true,
          },
          orderBy: {
            title: "asc",
          },
        },
      },
      orderBy: {
        title: "asc",
      },
    });

    res.json({
      success: true,
      data: categories,
      message:
        categories.length === 0
          ? "No categories found"
          : `${categories.length} categories found`,
    });
    return;
  } catch (error) {
    next(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
    });
    return;
  }
};

export const getAllServices: RequestHandler = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const category = req.query.category as string;
    const parentId = req.query.parentId as string;
    const search = req.query.search as string;
    const minPrice = parseFloat(req.query.minPrice as string);
    const maxPrice = parseFloat(req.query.maxPrice as string);
    const skip = (page - 1) * limit;
    const where: any = { status: "ACTIVE" };
    if (category) where.category = category;
    if (parentId) where.parentId = parentId;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }
    if (minPrice) where.price = { ...where.price, gte: minPrice };
    if (maxPrice) where.price = { ...where.price, lte: maxPrice };

    const [services, total] = await Promise.all([
      prisma.service.findMany({
        where,
        include: {
          parent: {
            select: {
              id: true,
              title: true,
              code: true,
            },
          },
          children: {
            select: {
              id: true,
              title: true,
              code: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.service.count({ where }),
    ]);

    res.json({
      success: true,
      data: services,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
    return;
  } catch (error) {
    next(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch services",
    });
    return;
  }
};

export const getServiceById: RequestHandler = async (req, res, next) => {
  try {
    const service = await prisma.service.findUnique({
      where: { id: req.params.id },
      include: {
        parent: {
          select: {
            id: true,
            title: true,
            code: true,
            description: true,
          },
        },
        children: {
          select: {
            id: true,
            title: true,
            code: true,
            description: true,
            tags: true,
            images: true,
            status: true,
          },
        },
      },
    });
    if (!service) throw new AppError(404, "Service not found");
    res.json({
      success: true,
      data: { service },
    });
    return;
  } catch (error) {
    next(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch service details",
    });
    return;
  }
};

export const updateService: RequestHandler = async (req, res, next) => {
  try {
    const service = await prisma.service.findUnique({
      where: { id: req.params.id },
    });
    if (!service) throw new AppError(404, "Service not found");

    const updates = updateServiceSchema.parse(req.body);
    const updatedService = await prisma.service.update({
      where: { id: req.params.id },
      data: updates,
    });

    res.json({
      success: true,
      data: { service: updatedService },
      message: "Service updated successfully",
    });
    return;
  } catch (error) {
    next(error);
    res.status(500).json({
      success: false,
      message: "Failed to update service",
    });
    return;
  }
};

export const deleteService: RequestHandler = async (req, res, next) => {
  try {
    const service = await prisma.service.findUnique({
      where: { id: req.params.id },
    });
    if (!service) throw new AppError(404, "Service not found");

    await prisma.service.delete({ where: { id: req.params.id } });

    res.json({
      success: true,
      message: "Service deleted successfully",
    });
    return;
  } catch (error) {
    next(error);
    res.status(500).json({
      success: false,
      message: "Failed to delete service",
    });
    return;
  }
};
