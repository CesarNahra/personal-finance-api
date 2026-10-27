import { randomUUID } from 'node:crypto';

const categories = new Map();

function create(categoryData) {
  const now = new Date().toISOString();

  const category = {
    id: randomUUID(),
    name: categoryData.name,
    type: categoryData.type,
    createdAt: now
  };

  categories.set(category.id, category);

  return category;
}

function findAll() {
  return Array.from(categories.values());
}

function findById(id) {
  return categories.get(id) || null;
}

function findByNameAndType(name, type) {
  const normalizedName = name.trim().toLowerCase();

  for (const category of categories.values()) {
    const matchesName =
      category.name.trim().toLowerCase() === normalizedName;

    const matchesType = category.type === type;

    if (matchesName && matchesType) {
      return category;
    }
  }

  return null;
}

function update(id, categoryData) {
  const existingCategory = findById(id);

  if (!existingCategory) {
    return null;
  }

  const updatedCategory = {
    ...existingCategory,
    ...categoryData
  };

  categories.set(id, updatedCategory);

  return updatedCategory;
}

function remove(id) {
  return categories.delete(id);
}

export default {
  create,
  findAll,
  findById,
  findByNameAndType,
  update,
  remove
};