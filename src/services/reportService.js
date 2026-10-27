import transactionRepository from '../repositories/transactionRepository.js';
import HttpError from '../utils/httpError.js';

import { toCents, fromCents } from '../utils/money.js';

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

function validateReportFilters(filters) {
  const allowedFields = ['startDate', 'endDate'];

  for (const field of Object.keys(filters)) {
    if (!allowedFields.includes(field)) {
      throw new HttpError(
        400,
        'INVALID_REPORT_FILTER',
        `Filter "${field}" is not supported.`
      );
    }
  }

  if (
    filters.startDate !== undefined &&
    (
      typeof filters.startDate !== 'string' ||
      !isValidDate(filters.startDate)
    )
  ) {
    throw new HttpError(
      400,
      'INVALID_START_DATE',
      'Start date must be a valid date in YYYY-MM-DD format.'
    );
  }

  if (
    filters.endDate !== undefined &&
    (
      typeof filters.endDate !== 'string' ||
      !isValidDate(filters.endDate)
    )
  ) {
    throw new HttpError(
      400,
      'INVALID_END_DATE',
      'End date must be a valid date in YYYY-MM-DD format.'
    );
  }

  if (
    filters.startDate !== undefined &&
    filters.endDate !== undefined &&
    filters.startDate > filters.endDate
  ) {
    throw new HttpError(
      400,
      'INVALID_DATE_RANGE',
      'Start date must be earlier than or equal to end date.'
    );
  }
}

function getSummary(filters = {}) {
  validateReportFilters(filters);

  const transactions = transactionRepository.findAll(filters);

  let totalIncomeInCents = 0;
  let totalExpensesInCents = 0;
  let incomeCount = 0;
  let expenseCount = 0;

  for (const transaction of transactions) {
    const amountInCents = toCents(transaction.amount);

    if (transaction.type === 'income') {
      totalIncomeInCents += amountInCents;
      incomeCount += 1;
    } else if (transaction.type === 'expense') {
      totalExpensesInCents += amountInCents;
      expenseCount += 1;
    }
  }

  const balanceInCents =
    totalIncomeInCents - totalExpensesInCents;

  return {
    period: {
      startDate: filters.startDate ?? null,
      endDate: filters.endDate ?? null
    },
    totalIncome: fromCents(totalIncomeInCents),
    totalExpenses: fromCents(totalExpensesInCents),
    balance: fromCents(balanceInCents),
    transactionCount: transactions.length,
    incomeCount,
    expenseCount
  };
}

export default {
  getSummary
};