import transactionService from '../services/transactionService.js';

function createTransaction(req, res, next) {
  try {
    const transaction = transactionService.createTransaction(req.body);

    return res.status(201).json({
      data: transaction
    });
  } catch (error) {
    return next(error);
  }
}

function getTransactions(req, res, next) {
  try {
    const transactions = transactionService.getTransactions(
      req.query
    );

    return res.status(200).json({
      data: transactions
    });
  } catch (error) {
    return next(error);
  }
}

function getTransactionById(req, res, next) {
  try {
    const transaction = transactionService.getTransactionById(
      req.params.id
    );

    return res.status(200).json({
      data: transaction
    });
  } catch (error) {
    return next(error);
  }
}

function updateTransaction(req, res, next) {
  try {
    const transaction = transactionService.updateTransaction(
      req.params.id,
      req.body
    );

    return res.status(200).json({
      data: transaction
    });
  } catch (error) {
    return next(error);
  }
}

function deleteTransaction(req, res, next) {
  try {
    transactionService.deleteTransaction(req.params.id);

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
}

export default {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction
};