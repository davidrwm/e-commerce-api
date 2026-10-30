const {
  createOrder,
  getMyOrders,
  getMyOrderById,
  getAllOrders,
  updateOrderStatus,
} = require("./order.service");

const {
  updateOrderStatusSchema,
} = require("./order.validation");

async function checkout(req, res, next) {
  try {
    const order = await createOrder(req.user.userId);

    return res.status(201).json({
      status: "success",
      message: "Order created successfully",
      data: order,
    });
  } catch (error) {
    next(error);
  }
}

async function getOrders(req, res, next) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    if (
      !Number.isInteger(page) ||
      !Number.isInteger(limit) ||
      page < 1 ||
      limit < 1 ||
      limit > 100
    ) {
      return res.status(400).json({
        status: "error",
        message: "Invalid pagination parameters",
      });
    }

    const result = await getMyOrders({
      userId: req.user.userId,
      page,
      limit,
    });

    return res.status(200).json({
      status: "success",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

async function getOrder(req, res, next) {
  try {
    const orderId = Number(req.params.id);

    if (!Number.isInteger(orderId) || orderId <= 0) {
      return res.status(400).json({
        status: "error",
        message: "Invalid order ID",
      });
    }

    const order = await getMyOrderById(
      req.user.userId,
      orderId
    );

    return res.status(200).json({
      status: "success",
      data: order,
    });
  } catch (error) {
    next(error);
  }
}

async function getAdminOrders(req, res, next) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const validStatuses = [
      "PENDING",
      "CONFIRMED",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
    ];

    const status = req.query.status;

    if (
      status &&
      !validStatuses.includes(status)
    ) {
      return res.status(400).json({
        status: "error",
        message: "Invalid order status",
      });
    }

    if (page < 1 || limit < 1 || limit > 100) {
      return res.status(400).json({
        status: "error",
        message: "Invalid pagination parameters",
      });
    }

    const result = await getAllOrders({
      page,
      limit,
      status,
    });

    return res.status(200).json({
      status: "success",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

async function changeOrderStatus(req, res, next) {
  try {
    const orderId = Number(req.params.id);

    if (!Number.isInteger(orderId) || orderId <= 0) {
      return res.status(400).json({
        status: "error",
        message: "Invalid order ID",
      });
    }

    const data = updateOrderStatusSchema.parse(req.body);

    const order = await updateOrderStatus(
      orderId,
      data.status
    );

    return res.status(200).json({
      status: "success",
      message: "Order status updated successfully",
      data: order,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  checkout,
  getOrders,
  getOrder,
  getAdminOrders,
  changeOrderStatus,
};