const { z } = require("zod");

const updateOrderStatusSchema = z.object({
  status: z.enum([
    "CONFIRMED",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
  ]),
});

module.exports = {
  updateOrderStatusSchema,
};