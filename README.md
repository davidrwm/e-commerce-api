# E-commerce REST API

A portfolio e-commerce backend built with **Node.js, Express.js, PostgreSQL, and Prisma ORM**. This REST API provides user authentication, product and category management, shopping cart functionality, and order processing.

## Features

- **Authentication** — Register, log in, and access protected endpoints using JWT.
- **Role-based authorization** — Separate customer and admin permissions.
- **Categories** — Browse categories and manage them as an administrator.
- **Products** — Browse products, search and filter listings, and perform admin-only management.
- **Shopping cart** — Add products, update quantities, remove items, and clear the cart.
- **Orders** — Checkout, view order history, and retrieve order details.
- **Order management** — Administrators can view orders and update order statuses.
- **Validation and error handling** — Request validation with Zod and consistent JSON error responses.
- **API documentation** — Interactive Swagger UI with OpenAPI specifications.
- **Automated tests** — Jest and Supertest for API testing.

## Tech Stack

- Node.js
- Express.js
- PostgreSQL
- Prisma ORM
- JSON Web Tokens (JWT)
- bcrypt
- Zod
- Jest and Supertest
- Swagger UI and OpenAPI

## Prerequisites

Before running the project, install:

- Node.js and npm
- PostgreSQL
- Git

## Getting Started

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd ecommerce-api
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create your local `.env` file from the example:

```bash
cp .env.example .env
```

On Windows PowerShell, you can use:

```powershell
Copy-Item .env.example .env
```

Configure the required values in `.env`. For example:

```env
DATABASE_URL="postgresql://USERNAME:PASSWORD@localhost:5432/ecommerce_db"
JWT_SECRET="replace-with-a-long-random-secret"
JWT_EXPIRES_IN="7d"
PORT=3000
NODE_ENV=development
```

Adjust these values to match your actual configuration. Create the PostgreSQL database if it does not already exist.

**Security:** Never commit `.env` or real credentials to version control. Use a separate test environment configuration in `.env.test`.

### 4. Set up the database

Apply the project's Prisma migrations:

```bash
npx prisma migrate dev
```

Generate the Prisma Client if your setup requires it:

```bash
npx prisma generate
```

The project uses Prisma 7 and a PostgreSQL driver adapter. Follow the existing `prisma.config.ts` and Prisma client configuration if your local setup requires additional options.

### 5. Seed the database

```bash
npm run seed
```

Check `prisma/seed.js` for the records created by the seed script.

### 6. Start the development server

```bash
npm run dev
```

For production-style startup:

```bash
npm start
```

The server uses the port configured in your environment variables.

## API Documentation

Once the server is running, open:

**`http://localhost:3000/api-docs`**

Replace `3000` if you configured a different port.

## API Endpoints

All application endpoints use the `/api/v1` prefix.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/health` | Check API health |
| POST | `/api/v1/auth/register` | Register a user |
| POST | `/api/v1/auth/login` | Log in |
| GET | `/api/v1/auth/me` | Get the authenticated user |
| GET | `/api/v1/categories` | List categories |
| GET | `/api/v1/categories/:id` | Get a category |
| POST | `/api/v1/categories` | Create a category (admin) |
| PATCH | `/api/v1/categories/:id` | Update a category (admin) |
| DELETE | `/api/v1/categories/:id` | Delete a category (admin) |
| GET | `/api/v1/products` | List and filter products |
| GET | `/api/v1/products/:id` | Get a product |
| POST | `/api/v1/products` | Create a product (admin) |
| PATCH | `/api/v1/products/:id` | Update a product (admin) |
| DELETE | `/api/v1/products/:id` | Delete a product (admin) |
| GET | `/api/v1/cart` | Get the current user's cart |
| POST | `/api/v1/cart/items` | Add an item to the cart |
| PATCH | `/api/v1/cart/items/:productId` | Update cart item quantity |
| DELETE | `/api/v1/cart/items/:productId` | Remove a cart item |
| DELETE | `/api/v1/cart` | Clear the cart |
| POST | `/api/v1/orders` | Checkout and create an order |
| GET | `/api/v1/orders` | List the current user's orders |
| GET | `/api/v1/orders/:id` | Get one of the user's orders |
| GET | `/api/v1/admin/orders` | List all orders (admin) |
| PATCH | `/api/v1/admin/orders/:id/status` | Update order status (admin) |

See Swagger UI for request bodies, response schemas, validation rules, and authentication requirements.

## Authentication

Protected endpoints use a JWT bearer token.

Include the token in the request header:

```http
Authorization: Bearer <your-token>
```

Register or log in to obtain a token, then use it to access protected endpoints. Admin-only endpoints require an account with the `ADMIN` role.

## Running Tests

Configure `.env.test` with a dedicated test database and the environment variables required by the application.

Run the automated test suite:

```bash
npm test
```

Tests run sequentially using Jest's `--runInBand` option. Use a dedicated test database to avoid modifying development data.

## Validate API Documentation

Run the OpenAPI validation script:

```bash
npm run validate:openapi
```

## Project Structure

```text
ecommerce-api/
├── prisma/
│   ├── migrations/
│   ├── schema.prisma
│   └── seed.js
├── src/
│   ├── config/
│   ├── middleware/
│   ├── modules/
│   │   ├── auth/
│   │   ├── categories/
│   │   ├── products/
│   │   ├── cart/
│   │   └── orders/
│   ├── app.js
│   └── server.js
├── tests/
├── prisma.config.ts
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Future Improvements

Potential future enhancements include refresh tokens, rate limiting, payment integration, and deployment automation.

## License

This project currently uses the ISC license as specified in `package.json`.
