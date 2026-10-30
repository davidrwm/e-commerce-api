
const { ZodError } = require("zod");

function errorHandler(error, req, res, next) {
  if (process.env.NODE_ENV !== "production") {
    console.error(error);
  } else {
    console.error(error.message);
  }

  // Zod validation errors
  if (error instanceof ZodError) {
    return res.status(400).json({
      status: "error",
      message: "Validation failed",
      errors: error.issues.map((issue) => ({
        path: issue.path,
        message: issue.message,
        code: issue.code,
      })),
    });
  }

  // Prisma known errors
  if (error.code === "P2002") {
    return res.status(409).json({
      status: "error",
      message: "A record with this value already exists",
    });
  }

  if (error.code === "P2025") {
    return res.status(404).json({
      status: "error",
      message: "Record not found",
    });
  }

  if (error.code === "P2003") {
    return res.status(409).json({
      status: "error",
      message:
        "This record cannot be modified because it is referenced by another record",
    });
  }

  // Custom application errors
  const statusCode =
    Number.isInteger(error.statusCode) &&
    error.statusCode >= 400 &&
    error.statusCode <= 599
      ? error.statusCode
      : 500;

  return res.status(statusCode).json({
    status: "error",
    message:
      statusCode === 500
        ? "Internal server error"
        : error.message,
  });
}

module.exports = errorHandler;