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

test('Categories should support creation, retrieval, updating, and deletion', async () => {
  const createResponse = await fetch(`${baseUrl}/api/categories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: 'Test Category',
      type: 'expense'
    })
  });

  assert.equal(createResponse.status, 201);

  const createdBody = await createResponse.json();
  const createdCategory = createdBody.data;

  assert.equal(createdCategory.name, 'Test Category');
  assert.equal(createdCategory.type, 'expense');
  assert.equal(typeof createdCategory.id, 'string');
  assert.equal(typeof createdCategory.createdAt, 'string');

  const getResponse = await fetch(
    `${baseUrl}/api/categories/${createdCategory.id}`
  );

  assert.equal(getResponse.status, 200);

  const retrievedBody = await getResponse.json();

  assert.deepEqual(retrievedBody.data, createdCategory);

  const updateResponse = await fetch(
    `${baseUrl}/api/categories/${createdCategory.id}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Updated Category'
      })
    }
  );

  assert.equal(updateResponse.status, 200);

  const updatedBody = await updateResponse.json();

  assert.equal(updatedBody.data.name, 'Updated Category');
  assert.equal(updatedBody.data.type, 'expense');
  assert.equal(
    updatedBody.data.createdAt,
    createdCategory.createdAt
  );

  const deleteResponse = await fetch(
    `${baseUrl}/api/categories/${createdCategory.id}`,
    {
      method: 'DELETE'
    }
  );

  assert.equal(deleteResponse.status, 204);

  const missingResponse = await fetch(
    `${baseUrl}/api/categories/${createdCategory.id}`
  );

  assert.equal(missingResponse.status, 404);
  assert.deepEqual(await missingResponse.json(), {
    error: {
      code: 'CATEGORY_NOT_FOUND',
      message: 'Category was not found.'
    }
  });
});

test('Categories with the same name and type should be rejected', async () => {
  const categoryData = {
    name: 'Duplicate Test',
    type: 'expense'
  };

  const firstResponse = await fetch(`${baseUrl}/api/categories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(categoryData)
  });

  assert.equal(firstResponse.status, 201);

  const firstBody = await firstResponse.json();

  const duplicateResponse = await fetch(
    `${baseUrl}/api/categories`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: ' duplicate test ',
        type: 'expense'
      })
    }
  );

  assert.equal(duplicateResponse.status, 409);
  assert.deepEqual(await duplicateResponse.json(), {
    error: {
      code: 'CATEGORY_ALREADY_EXISTS',
      message: 'A category with this name and type already exists.'
    }
  });

  const differentTypeResponse = await fetch(
    `${baseUrl}/api/categories`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Duplicate Test',
        type: 'income'
      })
    }
  );

  assert.equal(differentTypeResponse.status, 201);

  const differentTypeBody = await differentTypeResponse.json();

  await fetch(`${baseUrl}/api/categories/${firstBody.data.id}`, {
    method: 'DELETE'
  });

  await fetch(
    `${baseUrl}/api/categories/${differentTypeBody.data.id}`,
    {
      method: 'DELETE'
    }
  );
});

test('Invalid category data should return HTTP 400', async () => {
  const invalidCases = [
    {
      body: {
        name: '',
        type: 'expense'
      },
      expectedCode: 'INVALID_CATEGORY_NAME'
    },
    {
      body: {
        name: '   ',
        type: 'expense'
      },
      expectedCode: 'INVALID_CATEGORY_NAME'
    },
    {
      body: {
        name: 'Salary',
        type: 'saving'
      },
      expectedCode: 'INVALID_CATEGORY_TYPE'
    },
    {
      body: {
        type: 'expense'
      },
      expectedCode: 'INVALID_CATEGORY_NAME'
    },
    {
      body: null,
      expectedCode: 'INVALID_CATEGORY_DATA'
    }
  ];

  for (const invalidCase of invalidCases) {
    const response = await fetch(`${baseUrl}/api/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(invalidCase.body)
    });

    assert.equal(response.status, 400);

    const responseBody = await response.json();

    assert.equal(
      responseBody.error.code,
      invalidCase.expectedCode
    );
  }
});

test('Updating a category that does not exist should return HTTP 404', async () => {
  const response = await fetch(
    `${baseUrl}/api/categories/non-existent-id`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Updated Category'
      })
    }
  );

  assert.equal(response.status, 404);
  assert.deepEqual(await response.json(), {
    error: {
      code: 'CATEGORY_NOT_FOUND',
      message: 'Category was not found.'
    }
  });
});

test('GET /api/categories should return an array', async () => {
  const response = await fetch(`${baseUrl}/api/categories`);

  assert.equal(response.status, 200);

  const responseBody = await response.json();

  assert.ok(Array.isArray(responseBody.data));
});