# RateStore — Store Rating Platform with Role-Based Access Control

RateStore is a production-ready, full-stack monorepo application where users can search, browse, and rate storefront locations. It features a complete role-based access control (RBAC) system with three distinct roles: `admin`, `owner`, and `user`.

## Monorepo Project Structure

```
  /
  ├── db/
  │   ├── schema.sql          # Raw SQL schema representation
  │   └── seed.sql            # Raw SQL seed script with precomputed hashes
  ├── backend/
  │   ├── src/
  │   │   ├── config/         # Sequelize configuration, Swagger, and db connection
  │   │   ├── controllers/    # Controller handlers containing core business logic
  │   │   ├── middleware/     # Auth checks, RBAC guards, validations, and global errors
  │   │   ├── models/         # Sequelize ORM model mapping and associations
  │   │   ├── routes/         # Express routing endpoints (with OpenAPI annotations)
  │   │   └── app.js          # Main Express application bootstrap
  │   ├── .env.example        # Reference configurations file
  │   └── package.json        # Express dependencies and scripts
  └── frontend/
      ├── src/
      │   ├── api/            # Central Axios client configuration (token injection, 401 hooks)
      │   ├── components/     # Reusable layout sidebar, tables, filters, star rating modal
      │   ├── contexts/       # AuthContext session hydrator
      │   ├── hooks/          # Custom useAuth, useDebounce selectors
      │   ├── pages/          # Navigation screens separated by role (auth, admin, user, owner, shared)
      │   ├── App.jsx         # Central React Router setup with route guards
      │   └── index.css       # Premium custom global Vanilla CSS design system
      └── package.json        # Vite/React configuration and script mappings
```

---

## Prerequisites

Ensure you have the following installed on your system:
1. **Node.js** (v18 or higher)
2. **npm** (v9 or higher)
3. **MySQL Database Server** (v8 or higher, running locally on port 3306)

---

## Database Setup

You can initialize and seed the MySQL database in one of two ways:

### Option A: Using Sequelize CLI (Recommended)
1. Ensure your MySQL server is running.
2. In `/backend/.env`, configure your database credentials (`DB_USER`, `DB_PASSWORD`, `DB_NAME`).
3. Run the following command inside `/backend` to automatically create, migrate, and seed the tables:
   ```bash
   # From the /backend directory
   npm run db:create    # If database doesn't exist
   npm run db:migrate   # Run migrations
   npm run db:seed      # Seed initial demo data
   ```

### Option B: Raw SQL Execution
Import the SQL files directly into your MySQL server:
1. Execute `/db/schema.sql` to initialize the database structure.
2. Execute `/db/seed.sql` to load default data.

---

## Backend Setup & Run Instructions

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install Node.js dependencies:
   ```bash
   npm install
   ```
3. Create your `.env` file from the example:
   ```bash
   cp .env.example .env
   # Edit .env with your local MySQL password and PORT configuration
   ```
4. Start the server in development mode (hot reloading with nodemon):
   ```bash
   npm run dev
   ```
   *The server starts by default on `http://localhost:5000`.*
5. View API Documentation (Swagger OpenAPI UI):
   Open `http://localhost:5000/api-docs` in your browser.

---

## Frontend Setup & Run Instructions

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install React dependencies:
   ```bash
   npm install
   ```
3. Start the Vite React development server:
   ```bash
   npm run dev
   ```
   *The client will start by default on `http://localhost:5173`.*

---

## Default Access Credentials

Use these seeded credentials to test the application flows:

| Role | Email Address | Password | Name |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@ratestore.com` | `Admin@1234` | System Administrator Account |
| **Store Owner** | `owner@ratestore.com` | `Owner@1234` | Store Owner Administrator |
| **Customer User** | `user@ratestore.com` | `User@1234` | Regular Testing Customer |

---

## Features & Custom Validation Rules

### Strict Validation (Enforced Frontend & Backend)
- **Name**: Between 20 and 60 characters.
- **Address**: Maximum 400 characters.
- **Password**: 8 to 16 characters containing at least 1 uppercase letter and 1 special symbol.
- **Email**: Standard RFC format.

### Role-Based Access Control (RBAC)
- **Administrators**: Manage users (create/detail), manage stores (create/link to owner), and view total dashboard counters.
- **Store Owners**: Monitor overall rating averages and view detailed customer review lists.
- **Normal Users (Customers)**: Query/filter store lists, view stars, and submit/edit star ratings (limited to 1 rating per store).
