import { randomUUID } from 'node:crypto';

const transactions = new Map();

function create(transactionData) {
  const now = new Date().toISOString();

  const transaction = {
    id: randomUUID(),
    description: transactionData.description,
    amount: transactionData.amount,
    type: transactionData.type,
    categoryId: transactionData.categoryId,
    date: transactionData.date,
    createdAt: now,
    updatedAt: now
  };

  transactions.set(transaction.id, transaction);

  return transaction;
}

function findAll() {
  return Array.from(transactions.values());
}

function findById(id) {
  return transactions.get(id) || null;
}

function findByCategoryId(categoryId) {
  return Array.from(transactions.values()).filter(
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

  return updatedTransaction;
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