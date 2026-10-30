const { z } = require("zod");

const createCategorySchema = z.object({
  name: z
    .string()
    .min(2, "Category name must be at least 2 characters")
    .max(100)
    .trim(),

  description: z
    .string()
    .max(500)
    .trim()
    .optional(),
});

const updateCategorySchema = createCategorySchema.partial();

module.exports = {
  createCategorySchema,
  updateCategorySchema,
};