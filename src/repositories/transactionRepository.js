import { randomUUID } from 'node:crypto';

import { fromCents } from '../utils/money.js';

const transactions = new Map();

function toPublicTransaction(transaction) {
  const {
    amountInCents,
    ...transactionData
  } = transaction;

  return {
    ...transactionData,
    amount: fromCents(amountInCents)
  };
}

function create(transactionData) {
  const now = new Date().toISOString();

  const transaction = {
    id: randomUUID(),
    description: transactionData.description,
    amountInCents: transactionData.amountInCents,
    type: transactionData.type,
    categoryId: transactionData.categoryId,
    date: transactionData.date,
    createdAt: now,
    updatedAt: now
  };

  transactions.set(transaction.id, transaction);

  return toPublicTransaction(transaction);
}

function findAll(filters = {}) {
  const {
    type,
    categoryId,
    startDate,
    endDate
  } = filters;

  return Array.from(transactions.values())
    .filter((transaction) => {
      if (type && transaction.type !== type) {
        return false;
      }

      if (
        categoryId &&
        transaction.categoryId !== categoryId
      ) {
        return false;
      }

      if (startDate && transaction.date < startDate) {
        return false;
      }

      if (endDate && transaction.date > endDate) {
        return false;
      }

      return true;
    })
    .map(toPublicTransaction);
}

function findById(id) {
  const transaction = transactions.get(id);

  return transaction ? toPublicTransaction(transaction) : null;
}

function findByCategoryId(categoryId) {
  return Array.from(transactions.values(), toPublicTransaction).filter(
    (transaction) => transaction.categoryId === categoryId
  );
}

function update(id, transactionData) {
  const existingTransaction = findById(id);

  if (!existingTransaction) {
    return null;
  }

  const updatedTransaction = {
    ...existingTransaction,
    ...transactionData,
    id: existingTransaction.id,
    createdAt: existingTransaction.createdAt,
    updatedAt: new Date().toISOString()
  };

  transactions.set(id, updatedTransaction);

  return toPublicTransaction(updatedTransaction);
}

function remove(id) {
  return transactions.delete(id);
}

export default {
  create,
  findAll,
  findById,
  findByCategoryId,
  update,
  remove
};