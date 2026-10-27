import test from 'node:test';
import assert from 'node:assert/strict';

import app from '../src/app.js';

let server;
let baseUrl;

let incomeCategory;
let expenseCategory;

async function request(path, options = {}) {
  return fetch(`${baseUrl}${path}`, options);
}

async function createCategory(name, type) {
  const response = await request('/api/categories', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name, type })
  });

  assert.equal(response.status, 201);

  const body = await response.json();

  return body.data;
}

async function createTransaction({
  description,
  amount,
  type,
  categoryId,
  date
}) {
  const response = await request('/api/transactions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      description,
      amount,
      type,
      categoryId,
      date
    })
  });

  assert.equal(response.status, 201);

  return response.json();
}

test.before(async () => {
  server = app.listen(0);

  await new Promise((resolve, reject) => {
    server.once('listening', resolve);
    server.once('error', reject);
  });

  const address = server.address();

  baseUrl = `http://127.0.0.1:${address.port}`;

  incomeCategory = await createCategory(
    'Report Income',
    'income'
  );

  expenseCategory = await createCategory(
    'Report Expense',
    'expense'
  );

  await createTransaction({
    description: 'October salary',
    amount: 5000,
    type: 'income',
    categoryId: incomeCategory.id,
    date: '2026-10-05'
  });

  await createTransaction({
    description: 'October freelance work',
    amount: 250.50,
    type: 'income',
    categoryId: incomeCategory.id,
    date: '2026-10-15'
  });

  await createTransaction({
    description: 'October groceries',
    amount: 150.25,
    type: 'expense',
    categoryId: expenseCategory.id,
    date: '2026-10-10'
  });

  await createTransaction({
    description: 'September expense',
    amount: 50.10,
    type: 'expense',
    categoryId: expenseCategory.id,
    date: '2026-09-25'
  });
});

test.after(async () => {
  if (server) {
    await new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }
});

test('Summary should calculate financial totals correctly', async () => {
  const response = await request('/api/reports/summary');

  assert.equal(response.status, 200);

  const body = await response.json();
  const summary = body.data;

  assert.equal(summary.totalIncome, 5250.50);
  assert.equal(summary.totalExpenses, 200.35);
  assert.equal(summary.balance, 5050.15);

  assert.equal(summary.transactionCount, 4);
  assert.equal(summary.incomeCount, 2);
  assert.equal(summary.expenseCount, 2);

  assert.equal(summary.period.startDate, null);
  assert.equal(summary.period.endDate, null);
});

test('Summary should filter transactions by date range', async () => {
  const response = await request(
    '/api/reports/summary?startDate=2026-10-01&endDate=2026-10-31'
  );

  assert.equal(response.status, 200);

  const body = await response.json();
  const summary = body.data;

  assert.equal(summary.totalIncome, 5250.50);
  assert.equal(summary.totalExpenses, 150.25);
  assert.equal(summary.balance, 5100.25);

  assert.equal(summary.transactionCount, 3);
  assert.equal(summary.incomeCount, 2);
  assert.equal(summary.expenseCount, 1);
});

test('Summary should return zeros when no transactions match', async () => {
  const response = await request(
    '/api/reports/summary?startDate=2020-01-01&endDate=2020-01-31'
  );

  assert.equal(response.status, 200);

  const body = await response.json();
  const summary = body.data;

  assert.equal(summary.totalIncome, 0);
  assert.equal(summary.totalExpenses, 0);
  assert.equal(summary.balance, 0);

  assert.equal(summary.transactionCount, 0);
  assert.equal(summary.incomeCount, 0);
  assert.equal(summary.expenseCount, 0);
});

test('Summary should reject invalid dates', async () => {
  const response = await request(
    '/api/reports/summary?startDate=2026-02-30'
  );

  assert.equal(response.status, 400);

  const body = await response.json();

  assert.equal(body.error.code, 'INVALID_START_DATE');
});

test('Summary should reject an invalid date range', async () => {
  const response = await request(
    '/api/reports/summary?startDate=2026-10-31&endDate=2026-10-01'
  );

  assert.equal(response.status, 400);

  const body = await response.json();

  assert.equal(body.error.code, 'INVALID_DATE_RANGE');
});

test('Summary should reject unsupported filters', async () => {
  const response = await request(
    '/api/reports/summary?type=expense'
  );

  assert.equal(response.status, 400);

  const body = await response.json();

  assert.equal(body.error.code, 'INVALID_REPORT_FILTER');
});