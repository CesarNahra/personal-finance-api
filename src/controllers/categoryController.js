import categoryService from '../services/categoryService.js';

function createCategory(req, res, next) {
  try {
    const category = categoryService.createCategory(req.body);

    return res.status(201).json({
      data: category
    });
  } catch (error) {
    return next(error);
  }
}

function getCategories(req, res, next) {
  try {
    const categories = categoryService.getCategories();

    return res.status(200).json({
      data: categories
    });
  } catch (error) {
    return next(error);
  }
}

function getCategoryById(req, res, next) {
  try {
    const category = categoryService.getCategoryById(req.params.id);

    return res.status(200).json({
      data: category
    });
  } catch (error) {
    return next(error);
  }
}

function updateCategory(req, res, next) {
  try {
    const category = categoryService.updateCategory(
      req.params.id,
      req.body
    );

    return res.status(200).json({
      data: category
    });
  } catch (error) {
    return next(error);
  }
}

function deleteCategory(req, res, next) {
  try {
    categoryService.deleteCategory(req.params.id);

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
}

export default {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory
};