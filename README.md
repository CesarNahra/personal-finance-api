# Personal Finance API

A RESTful API built with Node.js and Express for managing personal finances. The application allows users to organize income and expenses, manage financial categories, filter transactions, and generate financial summaries.

This project was developed as a learning exercise focused on REST API design, modular architecture, data validation, error handling, automated testing, and API documentation.

## Features

- **Category Management:** Create, retrieve, update, and delete financial categories.
- **Transaction Management:** Create, retrieve, update, and delete financial transactions.
- **Transaction Filtering:** Filter transactions by type, category, and date range.
- **Financial Reports:** Generate summaries containing total income, total expenses, balance, and transaction counts.
- **Monetary Precision:** Represent monetary values internally as integer cents to reduce floating-point precision issues.
- **Input Validation:** Validate request data, transaction amounts, dates, and category references.
- **Centralized Error Handling:** Return consistent error responses for invalid requests and unexpected failures.
- **API Documentation:** Explore endpoints interactively through Swagger UI.
- **Automated Testing:** Run tests using Node.js's built-in test runner.

## Technologies

- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [dotenv](https://github.com/motdotla/dotenv)
- [Swagger UI Express](https://github.com/scottie1984/swagger-ui-express)
- [YAML](https://eemeli.org/yaml/)
- Native Node.js test runner (`node:test`)
- OpenAPI 3.0.3

## Project Structure

```text
personal-finance-api/
├── docs/
│   └── openapi.yaml
├── src/
│   ├── app.js
│   ├── server.js
│   ├── controllers/
│   ├── middlewares/
│   ├── repositories/
│   ├── routes/
│   ├── services/
│   └── utils/
│       └── money.js
├── test/
├── .env
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

The exact contents of individual directories may vary as the project evolves.

### Architecture

The application follows a modular structure that separates responsibilities:

- **Routes:** Define API endpoints and connect them to controllers.
- **Controllers:** Handle HTTP requests and responses.
- **Services:** Implement business rules and validate application data.
- **Repositories:** Manage the application's in-memory data.
- **Middlewares:** Handle errors and unmatched routes.
- **Utilities:** Provide reusable functionality, including monetary conversions.
- **Documentation:** Stores the OpenAPI specification.

## Prerequisites

Make sure the following tools are installed:

- Node.js
- npm

You can verify your installation with:

```bash
node --version
npm --version
```

## Installation

Clone the repository:

```bash
git clone https://github.com/CesarNahra/personal-finance-api.git
```

Navigate to the project directory:

```bash
cd personal-finance-api
```

Install dependencies:

```bash
npm install
```

## Running the Application

Start the server:

```bash
npm start
```

For development, use Node.js watch mode:

```bash
npm run dev
```

The API is available locally at:

```text
http://localhost:3000
```

The examples above assume the application is configured to use port `3000`.

## API Documentation

Interactive API documentation is available through Swagger UI:

```text
http://localhost:3000/api-docs
```

The raw OpenAPI specification can be accessed at:

```text
http://localhost:3000/api-docs/openapi.yaml
```

The documentation describes the available endpoints, request parameters, request bodies, response schemas, and expected HTTP status codes.

## API Endpoints

All API endpoints use the `/api` prefix, except for the documentation routes.

### Health

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Check API health |

### Categories

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/categories` | Retrieve all categories |
| `POST` | `/api/categories` | Create a category |
| `GET` | `/api/categories/:id` | Retrieve a category by ID |
| `PUT` | `/api/categories/:id` | Update a category |
| `DELETE` | `/api/categories/:id` | Delete a category |

Categories have a name and a type: `income` or `expense`.

Category deletion is rejected when the category is referenced by existing transactions.

### Transactions

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/transactions` | Retrieve transactions |
| `POST` | `/api/transactions` | Create a transaction |
| `GET` | `/api/transactions/:id` | Retrieve a transaction by ID |
| `PUT` | `/api/transactions/:id` | Update a transaction |
| `DELETE` | `/api/transactions/:id` | Delete a transaction |

Transactions include a description, amount, type, category ID, and date, along with server-managed timestamps and an identifier.

Supported transaction types are `income` and `expense`.

#### Transaction Filtering

The transaction listing endpoint supports optional query parameters:

| Parameter | Description | Example |
|---|---|---|
| `type` | Filter by transaction type | `type=expense` |
| `categoryId` | Filter by category | `categoryId=1` |
| `startDate` | Include transactions on or after this date | `startDate=2026-10-01` |
| `endDate` | Include transactions on or before this date | `endDate=2026-10-31` |

Example request:

```http
GET /api/transactions?type=expense&startDate=2026-10-01&endDate=2026-10-31
```

Filters can be combined to narrow the results.

### Financial Reports

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/reports/summary` | Generate a financial summary |

The summary provides:

- `totalIncome`: Total income for the selected period.
- `totalExpenses`: Total expenses for the selected period.
- `balance`: Difference between total income and total expenses.
- `transactionCount`: Total number of transactions.
- `incomeCount`: Number of income transactions.
- `expenseCount`: Number of expense transactions.
- `period`: The start and end dates used for the report.

Optional query parameters:

| Parameter | Description |
|---|---|
| `startDate` | Start of the reporting period |
| `endDate` | End of the reporting period |

Example request:

```http
GET /api/reports/summary?startDate=2026-10-01&endDate=2026-10-31
```

When no date filters are provided, the report covers all transactions currently stored in memory.

## Example Requests

The following examples assume the server is running locally on port `3000`.

### Create a Category

```http
POST /api/categories
Content-Type: application/json
```

```json
{
  "name": "Salary",
  "type": "income"
}
```

### Create a Transaction

```http
POST /api/transactions
Content-Type: application/json
```

```json
{
  "description": "Monthly salary",
  "amount": 3500.00,
  "type": "income",
  "categoryId": "1",
  "date": "2026-10-27"
}
```

The referenced category must exist, and its type must match the transaction type.

The examples use illustrative identifiers and values. Use the actual category ID returned by your API when creating a transaction.

## Error Handling

The API validates incoming requests and returns appropriate HTTP status codes.

Common status codes include:

| Status Code | Meaning |
|---|---|
| `200 OK` | Request completed successfully |
| `201 Created` | Resource created successfully |
| `204 No Content` | Resource deleted successfully |
| `400 Bad Request` | Invalid request data |
| `404 Not Found` | Requested resource does not exist |
| `409 Conflict` | Request conflicts with an existing resource or business rule |
| `500 Internal Server Error` | Unexpected server-side error |

Error responses include an error code and a descriptive message, according to the application's error-handling implementation.

## Monetary Precision

Financial amounts are exposed through the API as monetary values and stored internally as integer cents.

For example:

```text
R$ 125.50 → 12550 cents
```

This approach helps avoid common floating-point precision problems when calculating monetary totals.

Transaction amounts must be positive and cannot contain more than two decimal places.

## Testing

Run the automated test suite with:

```bash
npm test
```

The project uses Node.js's built-in test runner, avoiding the need for an additional testing framework.

## Data Storage

The application currently uses in-memory repositories.

This means:

- Data is available while the server process is running.
- Data is lost when the server process stops or restarts.
- The application does not currently provide persistent storage through a database.

This limitation is intentional for the current learning project. Database integration can be considered as a future enhancement.

## Future Improvements

Potential future enhancements include:

- Persistent storage using a relational database.
- User authentication and authorization.
- Separate financial records for multiple users.
- Pagination for transaction listings.
- Additional financial reports and analytics.
- Continuous integration for automated testing.
- Deployment to a cloud platform.

These are possible extensions, not features currently included in the implementation.

## Learning Objectives

This project explores several backend development concepts:

- Designing RESTful endpoints.
- Separating application responsibilities through modular architecture.
- Implementing business rules and input validation.
- Handling monetary values safely.
- Building automated tests with native Node.js tools.
- Documenting APIs with OpenAPI and Swagger UI.
- Managing dependencies and environment configuration.

## License

No license has been specified yet. If you intend to distribute the project publicly, consider adding a `LICENSE` file that reflects how you want others to use the code.