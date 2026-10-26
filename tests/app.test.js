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

test('GET /api/health should return HTTP 200 and status ok', async () => {
  const response = await fetch(`${baseUrl}/api/health`);

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    status: 'ok'
  });
});

test('Unknown routes should return a standardized HTTP 404 response', async () => {
  const response = await fetch(`${baseUrl}/api/unknown`);

  assert.equal(response.status, 404);
  assert.deepEqual(await response.json(), {
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: 'The requested route was not found.'
    }
  });
});

test('Invalid JSON should return a standardized HTTP 400 response', async () => {
  const response = await fetch(`${baseUrl}/api/health`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: '{invalid json'
  });

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), {
    error: {
      code: 'INVALID_JSON',
      message: 'Request body contains invalid JSON.'
    }
  });
});