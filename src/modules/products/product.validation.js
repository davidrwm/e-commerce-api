const { z } = require("zod");

const createProductSchema = z.object({
  name: z
    .string()
    .min(2)
    .max(200)
    .trim(),

  description: z
    .string()
    .max(2000)
    .trim()
    .optional(),

  price: z
    .number()
    .positive("Price must be greater than 0"),

  stock: z
    .number()
    .int()
    .min(0),

  categoryId: z
    .number()
    .int()
    .positive(),
});

const updateProductSchema = createProductSchema.partial();

module.exports = {
  createProductSchema,
  updateProductSchema,
};