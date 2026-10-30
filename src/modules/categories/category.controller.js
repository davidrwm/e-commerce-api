const {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("./category.service");

const {
  createCategorySchema,
  updateCategorySchema,
} = require("./category.validation");

async function listCategories(req, res, next) {
  try {
    const categories = await getCategories();

    res.status(200).json({
      status: "success",
      data: {
        categories,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function getCategory(req, res, next) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid category ID",
      });
    }

    const category = await getCategoryById(id);

    res.status(200).json({
      status: "success",
      data: {
        category,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function create(req, res, next) {
  try {
    const data = createCategorySchema.parse(req.body);

    const category = await createCategory(data);

    res.status(201).json({
      status: "success",
      data: {
        category,
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
        message: "Invalid category ID",
      });
    }

    const data = updateCategorySchema.parse(req.body);

    const category = await updateCategory(id, data);

    res.status(200).json({
      status: "success",
      data: {
        category,
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
        message: "Invalid category ID",
      });
    }

    await deleteCategory(id);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listCategories,
  getCategory,
  create,
  update,
  remove,
};