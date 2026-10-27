import categoryRepository from '../repositories/categoryRepository.js';
import transactionRepository from '../repositories/transactionRepository.js';

import HttpError from '../utils/httpError.js';

const VALID_TYPES = ['income', 'expense'];

function validateCategoryData(categoryData) {
    if (
      !categoryData ||
      typeof categoryData !== 'object' ||
      Array.isArray(categoryData)
    ) {
    throw new HttpError(
      400,
      'INVALID_CATEGORY_DATA',
      'Request body must be a JSON object.'
    );
  }

  if (
    typeof categoryData.name !== 'string' ||
    categoryData.name.trim().length === 0
  ) {
    throw new HttpError(
      400,
      'INVALID_CATEGORY_NAME',
      'Category name must be a non-empty string.'
    );
  }

  if (!VALID_TYPES.includes(categoryData.type)) {
    throw new HttpError(
      400,
      'INVALID_CATEGORY_TYPE',
      'Category type must be either income or expense.'
    );
  }
}

function ensureCategoryExists(id) {
  const category = categoryRepository.findById(id);

  if (!category) {
    throw new HttpError(
      404,
      'CATEGORY_NOT_FOUND',
      'Category was not found.'
    );
  }

  return category;
}

function ensureNameIsAvailable(name, type, excludedId = null) {
  const existingCategory = categoryRepository.findByNameAndType(
    name,
    type
  );

  if (existingCategory && existingCategory.id !== excludedId) {
    throw new HttpError(
      409,
      'CATEGORY_ALREADY_EXISTS',
      'A category with this name and type already exists.'
    );
  }
}

function createCategory(categoryData) {
  validateCategoryData(categoryData);

  const normalizedData = {
    name: categoryData.name.trim(),
    type: categoryData.type
  };

  ensureNameIsAvailable(normalizedData.name, normalizedData.type);

  return categoryRepository.create(normalizedData);
}

function getCategories() {
  return categoryRepository.findAll();
}

function getCategoryById(id) {
  return ensureCategoryExists(id);
}

function updateCategory(id, categoryData) {
  const existingCategory = ensureCategoryExists(id);

  if (
    !categoryData ||
    typeof categoryData !== 'object' ||
    Array.isArray(categoryData)
  ) {
    throw new HttpError(
      400,
      'INVALID_CATEGORY_DATA',
      'Request body must be a JSON object.'
    );
  }

  const updatedData = {
    name: existingCategory.name,
    type: existingCategory.type
  };

  if (Object.hasOwn(categoryData, 'name')) {
    if (
      typeof categoryData.name !== 'string' ||
      categoryData.name.trim().length === 0
    ) {
      throw new HttpError(
        400,
        'INVALID_CATEGORY_NAME',
        'Category name must be a non-empty string.'
      );
    }

    updatedData.name = categoryData.name.trim();
  }

  if (Object.hasOwn(categoryData, 'type')) {
    updatedData.type = categoryData.type;
  }

  validateCategoryData(updatedData);

  ensureNameIsAvailable(
    updatedData.name,
    updatedData.type,
    id
  );

  return categoryRepository.update(id, updatedData);
}

function deleteCategory(id) {
  ensureCategoryExists(id);

  const relatedTransactions =
    transactionRepository.findByCategoryId(id);

  if (relatedTransactions.length > 0) {
    throw new HttpError(
      409,
      'CATEGORY_IN_USE',
      'Category cannot be deleted while it is associated with transactions.'
    );
  }

  categoryRepository.remove(id);
}

export default {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory
};