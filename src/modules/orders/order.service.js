const Decimal = require("decimal.js");
const prisma = require("../../config/database");

async function createOrder(userId) {
  return prisma.$transaction(async (tx) => {
    // Get the user's cart
    const cart = await tx.cart.findUnique({
      where: {
        userId,
      },
      include: {
        items: true,
      },
    });

    if (!cart || cart.items.length === 0) {
      const error = new Error("Your cart is empty");
      error.statusCode = 400;
      throw error;
    }

    const orderItems = [];
    let totalAmount = new Decimal(0);

    // Check every product and update stock
    for (const cartItem of cart.items) {
      const product = await tx.product.findUnique({
        where: {
          id: cartItem.productId,
        },
      });

      if (!product) {
        const error = new Error(
          `Product ${cartItem.productId} no longer exists`
        );
        error.statusCode = 404;
        throw error;
      }

      // Atomic stock check + decrement
      const stockUpdate = await tx.product.updateMany({
        where: {
          id: product.id,
          stock: {
            gte: cartItem.quantity,
          },
        },
        data: {
          stock: {
            decrement: cartItem.quantity,
          },
        },
      });

      if (stockUpdate.count !== 1) {
        const error = new Error(
          `Insufficient stock for product "${product.name}"`
        );
        error.statusCode = 409;
        throw error;
      }

      const price = new Decimal(product.price.toString());

      totalAmount = totalAmount.plus(
        price.mul(cartItem.quantity)
      );

      orderItems.push({
        productId: product.id,
        quantity: cartItem.quantity,
        price: price.toFixed(2),
      });
    }

    // Create the order
    const order = await tx.order.create({
      data: {
        userId,
        totalAmount: totalAmount.toFixed(2),

        items: {
          create: orderItems,
        },
      },

      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    order.totalAmount = order.totalAmount.toFixed(2);

    // Empty the cart after successful checkout
    await tx.cartItem.deleteMany({
      where: {
        cartId: cart.id,
      },
    });

    return order;
  });
}

async function getMyOrders({
  userId,
  page = 1,
  limit = 10,
}) {
  const skip = (page - 1) * limit;

  const where = {
    userId,
  };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take: limit,

      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    }),

    prisma.order.count({
      where,
    }),
  ]);

  return {
    orders,

    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

async function getMyOrderById(userId, orderId) {
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      userId,
    },

    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  if (!order) {
    const error = new Error("Order not found");
    error.statusCode = 404;
    throw error;
  }

  return order;
}

async function getAllOrders({
  page = 1,
  limit = 10,
  status,
}) {
  const skip = (page - 1) * limit;

  const where = {};

  if (status) {
    where.status = status;
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take: limit,

      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },

        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    }),

    prisma.order.count({
      where,
    }),
  ]);

  return {
    orders,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

async function updateOrderStatus(orderId, newStatus) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: {
        id: orderId,
      },

      include: {
        items: true,
      },
    });

    if (!order) {
      const error = new Error("Order not found");
      error.statusCode = 404;
      throw error;
    }

    const allowedTransitions = {
      PENDING: ["CONFIRMED", "CANCELLED"],
      CONFIRMED: ["SHIPPED", "CANCELLED"],
      SHIPPED: ["DELIVERED"],
      DELIVERED: [],
      CANCELLED: [],
    };

    if (!allowedTransitions[order.status].includes(newStatus)) {
      const error = new Error(
        `Cannot change order status from ${order.status} to ${newStatus}`
      );

      error.statusCode = 409;
      throw error;
    }

    // If an order is cancelled before shipping,
    // return its quantities to inventory.
    if (
      newStatus === "CANCELLED" &&
      ["PENDING", "CONFIRMED"].includes(order.status)
    ) {
      for (const item of order.items) {
        await tx.product.update({
          where: {
            id: item.productId,
          },

          data: {
            stock: {
              increment: item.quantity,
            },
          },
        });
      }
    }

    return tx.order.update({
      where: {
        id: orderId,
      },

      data: {
        status: newStatus,
      },

      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  });
}

module.exports = {
  createOrder,
  getMyOrders,
  getMyOrderById,
  getAllOrders,
  updateOrderStatus,
};