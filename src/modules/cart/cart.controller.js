const {
  getCart,
  addItem,
  updateItem,
  removeItem,
  clearCart,
} = require("./cart.service");

const {
  addCartItemSchema,
  updateCartItemSchema,
} = require("./cart.validation");

async function get(req, res, next) {
  try {
    const cart = await getCart(req.user.userId);

    res.status(200).json({
      status: "success",
      data: {
        cart,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function add(req, res, next) {
  try {
    const data = addCartItemSchema.parse(req.body);

    const item = await addItem(
      req.user.userId,
      data
    );

    res.status(201).json({
      status: "success",
      data: {
        item,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const productId = Number(req.params.productId);

    if (!Number.isInteger(productId)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid product ID",
      });
    }

    const data = updateCartItemSchema.parse(req.body);

    const item = await updateItem(
      req.user.userId,
      productId,
      data.quantity
    );

    res.status(200).json({
      status: "success",
      data: {
        item,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function remove(req, res, next) {
  try {
    const productId = Number(req.params.productId);

    if (!Number.isInteger(productId)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid product ID",
      });
    }

    await removeItem(
      req.user.userId,
      productId
    );

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

async function clear(req, res, next) {
  try {
    await clearCart(req.user.userId);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  get,
  add,
  update,
  remove,
  clear,
};