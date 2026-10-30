const prisma = require("../../config/database");

async function getOrCreateCart(userId) {
  let cart = await prisma.cart.findUnique({
    where: {
      userId,
    },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: {
        userId,
      },
    });
  }

  return cart;
}

async function getCart(userId) {
  const cart = await getOrCreateCart(userId);

  return prisma.cart.findUnique({
    where: {
      id: cart.id,
    },
    include: {
      items: {
        include: {
          product: {
            include: {
              category: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  });
}

async function addItem(userId, { productId, quantity }) {
  const product = await prisma.product.findUnique({
    where: {
      id: productId,
    },
  });

  if (!product) {
    const error = new Error("Product not found");
    error.statusCode = 404;
    throw error;
  }

  if (product.stock < quantity) {
    const error = new Error(
      `Only ${product.stock} item(s) available`
    );
    error.statusCode = 409;
    throw error;
  }

  const cart = await getOrCreateCart(userId);

  const existingItem = await prisma.cartItem.findUnique({
    where: {
      cartId_productId: {
        cartId: cart.id,
        productId,
      },
    },
  });

  if (existingItem) {
    const newQuantity = existingItem.quantity + quantity;

    if (newQuantity > product.stock) {
      const error = new Error(
        `Only ${product.stock} item(s) available`
      );
      error.statusCode = 409;
      throw error;
    }

    return prisma.cartItem.update({
      where: {
        id: existingItem.id,
      },
      data: {
        quantity: newQuantity,
      },
      include: {
        product: true,
      },
    });
  }

  return prisma.cartItem.create({
    data: {
      cartId: cart.id,
      productId,
      quantity,
    },
    include: {
      product: true,
    },
  });
}

async function updateItem(userId, productId, quantity) {
  const cart = await getOrCreateCart(userId);

  const item = await prisma.cartItem.findUnique({
    where: {
      cartId_productId: {
        cartId: cart.id,
        productId,
      },
    },
    include: {
      product: true,
    },
  });

  if (!item) {
    const error = new Error("Product is not in your cart");
    error.statusCode = 404;
    throw error;
  }

  if (quantity > item.product.stock) {
    const error = new Error(
      `Only ${item.product.stock} item(s) available`
    );
    error.statusCode = 409;
    throw error;
  }

  return prisma.cartItem.update({
    where: {
      id: item.id,
    },
    data: {
      quantity,
    },
    include: {
      product: true,
    },
  });
}

async function removeItem(userId, productId) {
  const cart = await getOrCreateCart(userId);

  const item = await prisma.cartItem.findUnique({
    where: {
      cartId_productId: {
        cartId: cart.id,
        productId,
      },
    },
  });

  if (!item) {
    const error = new Error("Product is not in your cart");
    error.statusCode = 404;
    throw error;
  }

  await prisma.cartItem.delete({
    where: {
      id: item.id,
    },
  });
}

async function clearCart(userId) {
  const cart = await getOrCreateCart(userId);

  await prisma.cartItem.deleteMany({
    where: {
      cartId: cart.id,
    },
  });
}

module.exports = {
  getCart,
  addItem,
  updateItem,
  removeItem,
  clearCart,
};