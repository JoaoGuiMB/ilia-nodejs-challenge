# FinTech Wallet Platform - Documentation

## Overview

A fullstack FinTech wallet application built with a microservices architecture. The platform allows users to manage their digital wallet, perform credit and debit transactions, and track their balance in real-time.

---

## Tech Stack

### Backend

| Technology      | Version | Purpose                  |
| --------------- | ------- | ------------------------ |
| NestJS          | 10.4.15 | Backend framework        |
| TypeScript      | 5.7.2   | Language                 |
| PostgreSQL      | 17      | Database                 |
| TypeORM         | 0.3.28  | ORM                      |
| Passport.js     | -       | Authentication           |
| JWT             | -       | Token-based auth         |
| Jest            | -       | Unit/Integration testing |
| Swagger/OpenAPI | -       | API documentation        |

### Frontend

| Technology      | Version | Purpose                 |
| --------------- | ------- | ----------------------- |
| React           | 19.2.0  | UI framework            |
| TypeScript      | 5.9.3   | Language                |
| Vite            | 7.3.1   | Build tool              |
| Chakra UI       | 3.33.0  | Component library       |
| React Query     | 5.90.21 | Server state management |
| React Hook Form | 7.71.1  | Form management         |
| Zod             | -       | Schema validation       |
| i18next         | -       | Internationalization    |
| Vitest          | 4.0.18  | Unit testing            |
| Playwright      | -       | E2E testing             |

### DevOps

| Technology     | Purpose                    |
| -------------- | -------------------------- |
| Docker         | Containerization           |
| Docker Compose | Service orchestration      |
| Nginx          | Frontend production server |

---

## Architectural Patterns

### 1. Microservices Architecture

The backend is split into two independent services:

- **Users Service** (Port 3002): Handles user registration, authentication, and profile management
- **Wallet Service** (Port 3001): Manages transactions and balance calculations

### 2. Repository Pattern

Data access is abstracted through repository interfaces, separating business logic from database operations.

```
Controller → Service → Repository → Database
```

### 3. Dependency Injection

NestJS's built-in DI container manages service instantiation and lifecycle.

### 4. JWT Authentication

- **External JWT**: User authentication (`JWT_SECRET`)
- **Internal JWT**: Service-to-service communication (`JWT_INTERNAL_SECRET`)

### 5. Module-Based Architecture

Features are organized into self-contained modules:

```
modules/
├── auth/        # Authentication logic
├── users/       # User management
├── transactions/# Transaction handling
├── balance/     # Balance calculations
└── health/      # Health checks
```

### 6. Context API Pattern (Frontend)

React Context manages authentication state across the application.

### 7. Custom Hooks Pattern (Frontend)

Reusable hooks abstract data fetching and business logic:

- `useAuth`: Authentication state and actions
- `useBalance`: Balance data fetching
- `useTransactions`: Transaction operations

---

## Test Coverage

### Users Service

| Module        | Statements | Branch     | Functions  | Lines      |
| ------------- | ---------- | ---------- | ---------- | ---------- |
| **Overall**   | **82.16%** | **71.42%** | **93.02%** | **81.94%** |
| Auth Module   | 100%       | 100%       | 100%       | 100%       |
| Users Module  | 98.94%     | 93.75%     | 100%       | 98.83%     |
| Wallet Client | 84.84%     | 100%       | 100%       | 89.65%     |
| Health Module | 70.58%     | 100%       | 100%       | 76.92%     |

**Test Results**: 99 tests passed (12 test suites)

### Wallet Service

| Module        | Statements | Branch     | Functions  | Lines      |
| ------------- | ---------- | ---------- | ---------- | ---------- |
| **Overall**   | **77.85%** | **83.33%** | **91.66%** | **77.48%** |
| Auth Module   | 100%       | 100%       | 100%       | 100%       |
| Transactions  | 84.41%     | 100%       | 93.75%     | 85.07%     |
| Balance       | 77.77%     | 80%        | 100%       | 80%        |
| Health Module | 70.58%     | 100%       | 100%       | 76.92%     |

**Test Results**: 84 tests passed (12 test suites)

### Frontend

| Category    | Statements | Branch     | Functions  | Lines      |
| ----------- | ---------- | ---------- | ---------- | ---------- |
| **Overall** | **86.77%** | **74.86%** | **91.66%** | **86.97%** |
| Components  | ~95%       | ~85%       | ~95%       | ~95%       |
| Hooks       | 100%       | 94.73%     | 100%       | 100%       |
| Services    | 96.87%     | 83.33%     | 90.9%      | 96.77%     |
| Schemas     | 100%       | 100%       | 100%       | 100%       |
| Pages       | 100%       | ~95%       | 100%       | 100%       |

**Test Results**: 156 tests passed (21 test suites)

### E2E Tests (Playwright)

- Authentication flow (register, login, logout)
- Transaction creation and filtering
- Balance display verification

---

## Service Architecture

### Users Service (Port 3002)

```
src/
├── modules/
│   ├── auth/
│   │   ├── strategies/jwt.strategy.ts
│   │   ├── guards/jwt-auth.guard.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── dto/login.dto.ts
│   ├── users/
│   │   ├── entities/user.entity.ts
│   │   ├── users.repository.ts
│   │   ├── users.service.ts
│   │   ├── users.controller.ts
│   │   └── dto/
│   ├── wallet-client/
│   │   └── wallet-client.service.ts
│   └── health/
├── common/filters/
└── main.ts
```

**API Endpoints:**

- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /users/me` - Get current user profile
- `PATCH /users/me` - Update user profile
- `GET /health` - Health check

### Wallet Service (Port 3001)

```
src/
├── modules/
│   ├── auth/
│   │   ├── strategies/
│   │   │   ├── jwt.strategy.ts
│   │   │   └── internal-jwt.strategy.ts
│   │   └── guards/
│   ├── transactions/
│   │   ├── entities/transaction.entity.ts
│   │   ├── transactions.repository.ts
│   │   ├── transactions.service.ts
│   │   ├── transactions.controller.ts
│   │   └── internal-transactions.controller.ts
│   ├── balance/
│   │   ├── balance.service.ts
│   │   └── balance.controller.ts
│   └── health/
├── common/types/
└── main.ts
```

**API Endpoints:**

- `POST /transactions` - Create transaction
- `GET /transactions` - List transactions (with pagination)
- `GET /balance` - Get current balance
- `POST /internal/transactions` - Internal: Create transaction for user
- `GET /health` - Health check

### Frontend

```
src/
├── pages/
│   ├── Login/
│   ├── Register/
│   └── Transactions/
├── components/
│   ├── BalanceCard/
│   ├── TransactionForm/
│   ├── TransactionList/
│   ├── TransactionFilter/
│   └── ...
├── contexts/
│   └── AuthContext.tsx
├── hooks/
│   ├── use-auth.ts
│   ├── use-balance.ts
│   └── use-transactions.ts
├── services/
│   └── api.ts
├── schemas/
│   └── index.ts
├── i18n/
│   └── locales/
│       ├── en.json
│       └── pt.json
└── router/
```

---

## Database Schema

### Users Database (users_db)

**User Entity:**

```typescript
{
  id: UUID(PK);
  firstName: string;
  lastName: string;
  email: string(unique);
  password: string(hashed);
  createdAt: timestamp;
  updatedAt: timestamp;
}
```

### Wallet Database (wallet_db)

**Transaction Entity:**

```typescript
{
  id: UUID(PK);
  userId: UUID(indexed);
  type: "CREDIT" | "DEBIT";
  amount: decimal;
  createdAt: timestamp;
}
```

---

## Inter-Service Communication

```
┌─────────────────┐         Internal JWT          ┌─────────────────┐
│  Users Service  │ ─────────────────────────────▶│  Wallet Service │
│    (3002)       │    POST /internal/transactions│    (3001)       │
└─────────────────┘                               └─────────────────┘
```

The Users Service communicates with the Wallet Service using:

- Internal JWT token signed with `JWT_INTERNAL_SECRET`
- Token payload: `{ sub: 'users-service', type: 'internal' }`
- Token expiration: 5 minutes

---

## Docker Configuration

### Services

| Service        | Port | Database         |
| -------------- | ---- | ---------------- |
| frontend       | 3000 | -                |
| users-service  | 3002 | users-db (5432)  |
| wallet-service | 3001 | wallet-db (5433) |
| users-db       | 5432 | PostgreSQL 17    |
| wallet-db      | 5433 | PostgreSQL 17    |

### Running with Docker

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

---

## Environment Variables

### Users Service

```env
PORT=3002
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=users_db
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
JWT_SECRET=ILIACHALLENGE
JWT_INTERNAL_SECRET=ILIACHALLENGE_INTERNAL
WALLET_SERVICE_URL=http://localhost:3001
```

### Wallet Service

```env
PORT=3001
DATABASE_HOST=localhost
DATABASE_PORT=5433
DATABASE_NAME=wallet_db
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
JWT_SECRET=ILIACHALLENGE
JWT_INTERNAL_SECRET=ILIACHALLENGE_INTERNAL
```

### Frontend

```env
VITE_USERS_API_URL=http://localhost:3002
VITE_WALLET_API_URL=http://localhost:3001
```

---

## Features

### Authentication

- User registration with email validation
- JWT-based login with 24h token expiration
- Protected routes with authentication guards

### Transactions

- Create credit/debit transactions
- Paginated transaction history
- Filter transactions by type
- Real-time balance calculation

### User Experience

- Responsive design with Chakra UI
- Dark/Light theme toggle
- Multi-language support (EN/PT)
- Accessibility features (skip links)

---

## API Documentation

Both backend services expose Swagger documentation:

- Users Service: `http://localhost:3002/api/docs`
- Wallet Service: `http://localhost:3001/api`

---

## Running Tests

### Backend

```bash
# Users Service
cd users-service
npm run test        # Run tests
npm run test:cov    # Run with coverage
npm run test:e2e    # Run E2E tests

# Wallet Service
cd wallet-service
npm run test        # Run tests
npm run test:cov    # Run with coverage
npm run test:e2e    # Run E2E tests
```

### Frontend

```bash
cd frontend
npm run test              # Run unit tests
npm run test:coverage     # Run with coverage
npm run test:e2e          # Run Playwright E2E tests
```

---

## Development Setup

### Prerequisites

- Node.js 22+
- npm
- Docker & Docker Compose
- PostgreSQL 17 (or use Docker)

### Local Development

```bash
# Clone the repository
git clone <repository-url>

# Install dependencies
cd users-service && npm install
cd ../wallet-service && npm install
cd ../frontend && npm install

# Start databases
docker-compose up -d users-db wallet-db

# Start services (in separate terminals)
cd users-service && npm run start:dev
cd wallet-service && npm run start:dev
cd frontend && npm run dev
```
