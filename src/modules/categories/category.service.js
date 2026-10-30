const prisma = require("../../config/database");

async function getCategories() {
  return prisma.category.findMany({
    orderBy: {
      name: "asc",
    },
    include: {
      _count: {
        select: {
          products: true,
        },
      },
    },
  });
}

async function getCategoryById(id) {
  const category = await prisma.category.findUnique({
    where: {
      id,
    },
    include: {
      _count: {
        select: {
          products: true,
        },
      },
    },
  });

  if (!category) {
    const error = new Error("Category not found");
    error.statusCode = 404;
    throw error;
  }

  return category;
}

async function createCategory({ name, description }) {
  const existingCategory = await prisma.category.findUnique({
    where: {
      name,
    },
  });

  if (existingCategory) {
    const error = new Error("Category already exists");
    error.statusCode = 409;
    throw error;
  }

  return prisma.category.create({
    data: {
      name,
      description,
    },
  });
}

async function updateCategory(id, data) {
  await getCategoryById(id);

  return prisma.category.update({
    where: {
      id,
    },
    data,
  });
}

async function deleteCategory(id) {
  await getCategoryById(id);

  const productCount = await prisma.product.count({
    where: {
      categoryId: id,
    },
  });

  if (productCount > 0) {
    const error = new Error(
      "Cannot delete a category that contains products"
    );
    error.statusCode = 409;
    throw error;
  }

  await prisma.category.delete({
    where: {
      id,
    },
  });
}

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};