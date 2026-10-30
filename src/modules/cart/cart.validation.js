const { z } = require("zod");

const addCartItemSchema = z.object({
  productId: z
    .number()
    .int()
    .positive(),

  quantity: z
    .number()
    .int()
    .positive(),
});

const updateCartItemSchema = z.object({
  quantity: z
    .number()
    .int()
    .positive(),
});

module.exports = {
  addCartItemSchema,
  updateCartItemSchema,
};