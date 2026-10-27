import categoryRepository from '../repositories/categoryRepository.js';
import transactionRepository from '../repositories/transactionRepository.js';
import HttpError from '../utils/httpError.js';

import { toCents } from '../utils/money.js';

const VALID_TYPES = ['income', 'expense'];

function validateTransactionData(transactionData) {
  if (
    !transactionData ||
    typeof transactionData !== 'object' ||
    Array.isArray(transactionData)
  ) {
    throw new HttpError(
      400,
      'INVALID_TRANSACTION_DATA',
      'Request body must be a JSON object.'
    );
  }

  if (
    typeof transactionData.description !== 'string' ||
    transactionData.description.trim().length === 0
  ) {
    throw new HttpError(
      400,
      'INVALID_TRANSACTION_DESCRIPTION',
      'Transaction description must be a non-empty string.'
    );
  }

  if (
    typeof transactionData.amount !== 'number' ||
    !Number.isFinite(transactionData.amount) ||
    transactionData.amount <= 0
  ) {
    throw new HttpError(
      400,
      'INVALID_TRANSACTION_AMOUNT',
      'Transaction amount must be a finite number greater than zero.'
    );
  }

    try {
      toCents(transactionData.amount);
    } catch {
    throw new HttpError(
      400,
      'INVALID_TRANSACTION_AMOUNT',
      'Transaction amount must be a valid monetary value with no more than two decimal places.'
    );
  }

  if (!VALID_TYPES.includes(transactionData.type)) {
    throw new HttpError(
      400,
      'INVALID_TRANSACTION_TYPE',
      'Transaction type must be either income or expense.'
    );
  }

  if (
    typeof transactionData.categoryId !== 'string' ||
    transactionData.categoryId.trim().length === 0
  ) {
    throw new HttpError(
      400,
      'INVALID_TRANSACTION_CATEGORY',
      'A valid category ID is required.'
    );
  }

  if (
    typeof transactionData.date !== 'string' ||
    !isValidDate(transactionData.date)
  ) {
    throw new HttpError(
      400,
      'INVALID_TRANSACTION_DATE',
      'Transaction date must be a valid date in YYYY-MM-DD format.'
    );
  }
}

function isValidDate(dateString) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return false;
  }

  const date = new Date(`${dateString}T00:00:00.000Z`);

  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === dateString
  );
}

function ensureTransactionExists(id) {
  const transaction = transactionRepository.findById(id);

  if (!transaction) {
    throw new HttpError(
      404,
      'TRANSACTION_NOT_FOUND',
      'Transaction was not found.'
    );
  }

  return transaction;
}

function ensureCategoryMatchesType(categoryId, transactionType) {
  const category = categoryRepository.findById(categoryId);

  if (!category) {
    throw new HttpError(
      404,
      'CATEGORY_NOT_FOUND',
      'Category was not found.'
    );
  }

  if (category.type !== transactionType) {
    throw new HttpError(
      400,
      'CATEGORY_TYPE_MISMATCH',
      'Transaction type must match the category type.'
    );
  }

  return category;
}

function createTransaction(transactionData) {
  validateTransactionData(transactionData);

  const normalizedData = {
    description: transactionData.description.trim(),
    amountInCents: transactionData.amount,
    type: transactionData.type,
    categoryId: transactionData.categoryId,
    date: transactionData.date
  };

  ensureCategoryMatchesType(
    normalizedData.categoryId,
    normalizedData.type
  );

  return transactionRepository.create(normalizedData);
}

function getTransactions() {
  return transactionRepository.findAll();
}

function getTransactionById(id) {
  return ensureTransactionExists(id);
}

function updateTransaction(id, transactionData) {
  const existingTransaction = ensureTransactionExists(id);

  if (
    !transactionData ||
    typeof transactionData !== 'object' ||
    Array.isArray(transactionData)
  ) {
    throw new HttpError(
      400,
      'INVALID_TRANSACTION_DATA',
      'Request body must be a JSON object.'
    );
  }

  const updatedData = {
    description: existingTransaction.description,
    amount: existingTransaction.amount,
    type: existingTransaction.type,
    categoryId: existingTransaction.categoryId,
    date: existingTransaction.date
  };

  const allowedFields = [
    'description',
    'amount',
    'type',
    'categoryId',
    'date'
  ];

  for (const field of Object.keys(transactionData)) {
    if (!allowedFields.includes(field)) {
      throw new HttpError(
        400,
        'INVALID_TRANSACTION_FIELD',
        `Field "${field}" cannot be updated.`
      );
    }
  }

  Object.assign(updatedData, transactionData);

  validateTransactionData(updatedData);

  updatedData.description = updatedData.description.trim();

  const normalizedData = {
    description: updatedData.description,
    amountInCents: toCents(updatedData.amount),
    type: updatedData.type,
    categoryId: updatedData.categoryId,
    date: updatedData.date
  };

  ensureCategoryMatchesType(
    updatedData.categoryId,
    updatedData.type
  );

  return transactionRepository.update(id, updatedData);
}

function deleteTransaction(id) {
  ensureTransactionExists(id);

  transactionRepository.remove(id);
}

export default {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction
};