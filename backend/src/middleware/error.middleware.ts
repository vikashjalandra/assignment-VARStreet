import type { ErrorRequestHandler, RequestHandler } from "express";
import { HttpError } from "../lib/httpError.js";

const notFoundHandler: RequestHandler = (req, res) => {
  res.status(404).json({
    message: "Route not found",
    errors: {
      route: `${req.method} ${req.originalUrl}`,
    },
  });
};

const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (res.headersSent) {
    return;
  }

  if (error instanceof HttpError) {
    res.status(error.statusCode).json({
      message: error.message,
      ...(error.errors ? { errors: error.errors } : {}),
    });
    return;
  }

  const prismaError = error as { code?: string; meta?: { target?: unknown } };

  if (prismaError.code === "P2002") {
    const fieldName =
      Array.isArray(prismaError.meta?.target) && typeof prismaError.meta.target[0] === "string"
        ? prismaError.meta.target[0]
        : "field";

    res.status(409).json({
      message: "Duplicate value violates unique constraint",
      errors: {
        [fieldName]: `${fieldName} must be unique`,
      },
    });
    return;
  }

  if (prismaError.code === "P2025") {
    res.status(404).json({
      message: "Resource not found",
    });
    return;
  }

  console.error(error);
  res.status(500).json({
    message: "Internal server error",
  });
};

export { notFoundHandler, errorHandler };