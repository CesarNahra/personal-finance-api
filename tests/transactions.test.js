import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';

import app from '../src/app.js';

let server;
let baseUrl;

before(async () => {
  server = app.listen(0);

  await new Promise((resolve) => {
    server.once('listening', resolve);
  });

  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
});

async function createCategory(name, type) {
  const response = await fetch(`${baseUrl}/api/categories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name,
      type
    })
  });

  assert.equal(response.status, 201);

  const responseBody = await response.json();

  return responseBody.data;
}

async function createTransaction(transactionData) {
  return fetch(`${baseUrl}/api/transactions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(transactionData)
  });
}

test('Transactions should support creation, retrieval, updating, and deletion', async () => {
  const category = await createCategory('Transaction Test', 'expense');

  const transactionData = {
    description: 'Weekly groceries',
    amount: 125.50,
    type: 'expense',
    categoryId: category.id,
    date: '2026-10-27'
  };

  const createResponse = await createTransaction(transactionData);

  assert.equal(createResponse.status, 201);

  const createdBody = await createResponse.json();
  const transaction = createdBody.data;

  assert.equal(transaction.description, 'Weekly groceries');
  assert.equal(transaction.amount, 125.50);
  assert.equal(transaction.type, 'expense');
  assert.equal(transaction.categoryId, category.id);
  assert.equal(transaction.date, '2026-10-27');
  assert.equal(typeof transaction.id, 'string');
  assert.equal(typeof transaction.createdAt, 'string');
  assert.equal(typeof transaction.updatedAt, 'string');

  const getResponse = await fetch(
    `${baseUrl}/api/transactions/${transaction.id}`
  );

  assert.equal(getResponse.status, 200);

  const retrievedBody = await getResponse.json();

  assert.deepEqual(retrievedBody.data, transaction);

  const updateResponse = await fetch(
    `${baseUrl}/api/transactions/${transaction.id}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        description: 'Monthly groceries'
      })
    }
  );

  assert.equal(updateResponse.status, 200);

  const updatedBody = await updateResponse.json();

  assert.equal(updatedBody.data.description, 'Monthly groceries');
  assert.equal(updatedBody.data.amount, 125.50);
  assert.equal(updatedBody.data.id, transaction.id);
  assert.equal(updatedBody.data.createdAt, transaction.createdAt);

  const deleteResponse = await fetch(
    `${baseUrl}/api/transactions/${transaction.id}`,
    {
      method: 'DELETE'
    }
  );

  assert.equal(deleteResponse.status, 204);

  const missingResponse = await fetch(
    `${baseUrl}/api/transactions/${transaction.id}`
  );

  assert.equal(missingResponse.status, 404);

  const categoryDeleteResponse = await fetch(
    `${baseUrl}/api/categories/${category.id}`,
    {
      method: 'DELETE'
    }
  );

  assert.equal(categoryDeleteResponse.status, 204);
});

test('Invalid transaction data should return HTTP 400', async () => {
  const category = await createCategory(
    'Validation Test',
    'expense'
  );

  const invalidCases = [
    {
      body: {
        description: '',
        amount: 10,
        type: 'expense',
        categoryId: category.id,
        date: '2026-10-27'
      },
      expectedCode: 'INVALID_TRANSACTION_DESCRIPTION'
    },
    {
      body: {
        description: 'Invalid amount',
        amount: 0,
        type: 'expense',
        categoryId: category.id,
        date: '2026-10-27'
      },
      expectedCode: 'INVALID_TRANSACTION_AMOUNT'
    },
    {
      body: {
        description: 'Negative amount',
        amount: -10,
        type: 'expense',
        categoryId: category.id,
        date: '2026-10-27'
      },
      expectedCode: 'INVALID_TRANSACTION_AMOUNT'
    },
    {
      body: {
        description: 'Invalid type',
        amount: 10,
        type: 'transfer',
        categoryId: category.id,
        date: '2026-10-27'
      },
      expectedCode: 'INVALID_TRANSACTION_TYPE'
    },
    {
      body: {
        description: 'Invalid date',
        amount: 10,
        type: 'expense',
        categoryId: category.id,
        date: '2026-02-30'
      },
      expectedCode: 'INVALID_TRANSACTION_DATE'
    },
    {
      body: {
        description: 'Invalid category',
        amount: 10,
        type: 'expense',
        categoryId: '',
        date: '2026-10-27'
      },
      expectedCode: 'INVALID_TRANSACTION_CATEGORY'
    },
    {
      body: null,
      expectedCode: 'INVALID_TRANSACTION_DATA'
    }
  ];

  for (const invalidCase of invalidCases) {
    const response = await createTransaction(invalidCase.body);

    assert.equal(response.status, 400);

    const responseBody = await response.json();

    assert.equal(
      responseBody.error.code,
      invalidCase.expectedCode
    );
  }

  await fetch(`${baseUrl}/api/categories/${category.id}`, {
    method: 'DELETE'
  });
});

test('Transactions must reference an existing category', async () => {
  const response = await createTransaction({
    description: 'Unknown category',
    amount: 25,
    type: 'expense',
    categoryId: 'non-existent-category',
    date: '2026-10-27'
  });

  assert.equal(response.status, 404);

  assert.deepEqual(await response.json(), {
    error: {
      code: 'CATEGORY_NOT_FOUND',
      message: 'Category was not found.'
    }
  });
});

test('Transaction type must match category type', async () => {
  const category = await createCategory(
    'Income Test',
    'income'
  );

  const response = await createTransaction({
    description: 'Incorrect transaction type',
    amount: 100,
    type: 'expense',
    categoryId: category.id,
    date: '2026-10-27'
  });

  assert.equal(response.status, 400);

  assert.deepEqual(await response.json(), {
    error: {
      code: 'CATEGORY_TYPE_MISMATCH',
      message: 'Transaction type must match the category type.'
    }
  });

  const deleteResponse = await fetch(
    `${baseUrl}/api/categories/${category.id}`,
    {
      method: 'DELETE'
    }
  );

  assert.equal(deleteResponse.status, 204);
});

test('Categories in use cannot be deleted', async () => {
  const category = await createCategory(
    'Protected Category',
    'expense'
  );

  const transactionResponse = await createTransaction({
    description: 'Protected transaction',
    amount: 50,
    type: 'expense',
    categoryId: category.id,
    date: '2026-10-27'
  });

  assert.equal(transactionResponse.status, 201);

  const deleteCategoryResponse = await fetch(
    `${baseUrl}/api/categories/${category.id}`,
    {
      method: 'DELETE'
    }
  );

  assert.equal(deleteCategoryResponse.status, 409);

  assert.deepEqual(await deleteCategoryResponse.json(), {
    error: {
      code: 'CATEGORY_IN_USE',
      message:
        'Category cannot be deleted while it is associated with transactions.'
    }
  });

  const transactionBody = await transactionResponse.json();

  await fetch(
    `${baseUrl}/api/transactions/${transactionBody.data.id}`,
    {
      method: 'DELETE'
    }
  );

  const finalDeleteResponse = await fetch(
    `${baseUrl}/api/categories/${category.id}`,
    {
      method: 'DELETE'
    }
  );

  assert.equal(finalDeleteResponse.status, 204);
});

test('GET /api/transactions should return an array', async () => {
  const response = await fetch(`${baseUrl}/api/transactions`);

  assert.equal(response.status, 200);

  const responseBody = await response.json();

  assert.ok(Array.isArray(responseBody.data));
});

test('Updating a nonexistent transaction should return HTTP 404', async () => {
  const response = await fetch(
    `${baseUrl}/api/transactions/non-existent-id`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        description: 'Updated transaction'
      })
    }
  );

  assert.equal(response.status, 404);

  assert.deepEqual(await response.json(), {
    error: {
      code: 'TRANSACTION_NOT_FOUND',
      message: 'Transaction was not found.'
    }
  });
});