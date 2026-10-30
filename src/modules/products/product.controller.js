const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("./product.service");

const {
  createProductSchema,
  updateProductSchema,
} = require("./product.validation");

async function listProducts(req, res, next) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    if (
      !Number.isInteger(page) ||
      page < 1 ||
      !Number.isInteger(limit) ||
      limit < 1 ||
      limit > 100
    ) {
      return res.status(400).json({
        status: "error",
        message: "Invalid pagination parameters",
      });
    }

    const categoryId = req.query.categoryId
      ? Number(req.query.categoryId)
      : undefined;

    if (
      categoryId !== undefined &&
      (!Number.isInteger(categoryId) || categoryId < 1)
    ) {
      return res.status(400).json({
        status: "error",
        message: "Invalid category ID",
      });
    }

    const result = await getProducts({
      page,
      limit,
      search: req.query.search,
      categoryId,
    });

    res.status(200).json({
      status: "success",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

async function getProduct(req, res, next) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid product ID",
      });
    }

    const product = await getProductById(id);

    res.status(200).json({
      status: "success",
      data: {
        product,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function create(req, res, next) {
  try {
    const data = createProductSchema.parse(req.body);

    const product = await createProduct(data);

    res.status(201).json({
      status: "success",
      data: {
        product,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid product ID",
      });
    }

    const data = updateProductSchema.parse(req.body);

    const product = await updateProduct(id, data);

    res.status(200).json({
      status: "success",
      data: {
        product,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function remove(req, res, next) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid product ID",
      });
    }

    await deleteProduct(id);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listProducts,
  getProduct,
  create,
  update,
  remove,
};