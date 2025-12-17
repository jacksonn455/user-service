# User Service

User authentication and management service developed in Node.js with TypeScript, providing secure user registration, login, and profile management with internal microservice communication.

## Project Structure

```
user-service/
├── src/                          # Source code directory
│   ├── config/                   # Configuration files (database, Redis, RabbitMQ, New Relic)
│   ├── controllers/              # HTTP request handlers
│   ├── entities/                 # Database models and schemas
│   ├── middlewares/              # Custom middleware (auth, validation)
│   ├── repositories/             # Data access layer
│   ├── routes/                   # API route definitions
│   ├── services/                 # Business logic layer
│   ├── types/                    # TypeScript type definitions
│   ├── utils/                    # Utility functions (logger, JWT helpers)
│   └── server.ts                 # Entry point for the Express server
├── .env                          # Environment variables (copy from .env.example)
├── .env.example                  # Sample environment variables
├── .gitignore                    # Git ignore rules
├── docker-compose.yml            # Docker Compose for multi-container setup
├── Dockerfile                    # Docker image build instructions
├── newrelic.js                   # New Relic APM integration
├── package-lock.json             # NPM dependency lockfile
├── package.json                  # Project dependencies and scripts
├── README.md                     # Project documentation
└── tsconfig.json                 # TypeScript configuration
```

## Technologies

- **Node.js** with **TypeScript**
- **Express** - Web framework
- **PostgreSQL** - Relational database
- **TypeORM** - ORM
- **RabbitMQ** - Message broker for async events
- **Redis** - Cache and session management
- **JWT** - Authentication (external and internal)
- **Bcrypt** - Password hashing
- **Axios** - HTTP client for microservice communication
- **Docker** - Containerization

## Features

- ✅ User registration with email validation
- ✅ Secure login with JWT tokens
- ✅ Password hashing with bcrypt
- ✅ User profile management
- ✅ Internal communication with Wallet Service
- ✅ Dual JWT authentication (external + internal)
- ✅ User caching with Redis
- ✅ Event publishing via RabbitMQ
- ✅ Input validation with express-validator
- ✅ Production-ready monitoring with New Relic

## Architecture

The service is built using a modular architecture following microservices best practices:

- **API Layer:** Handles HTTP requests, validation, and authentication
- **Service Layer:** Contains business logic for user management
- **Repository Layer:** Abstracts data access using TypeORM
- **Communication Layer:** Manages internal service-to-service communication
- **Message Queue:** RabbitMQ for event-driven architecture
- **Cache:** Redis for performance optimization

## Installation

To install and run the project, follow these steps:

1. **Clone the repository:**
    ```bash
    git clone https://github.com/jacksonn455/user-service.git
    ```

2. **Enter the project folder:**
    ```bash
    cd user-service
    ```

3. **Install dependencies:**
    ```bash
    npm install
    ```

4. **Setup environment variables:**
    ```bash
    cp .env.example .env
    ```
    Configure your environment variables in the `.env` file.

5. **Run the development server:**
    ```bash
    npm run dev
    ```

The API will be available at http://localhost:3002

## Environment Variables

| Variable | Description |
|----------|-------------|
| PORT | Application port (3002) |
| JWT_SECRET | JWT private key for external auth (ILIACHALLENGE) |
| JWT_EXPIRES_IN | Token expiration time (24h) |
| JWT_INTERNAL_SECRET | JWT key for service-to-service auth (ILIACHALLENGE_INTERNAL) |
| JWT_INTERNAL_EXPIRES_IN | Internal token expiration (1h) |
| RABBITMQ_URL | RabbitMQ connection URL |
| RABBITMQ_QUEUE | Queue name for user events |
| REDIS_HOST | Redis host |
| REDIS_PORT | Redis port |
| REDIS_PASSWORD | Redis password (optional) |
| DB_HOST | PostgreSQL host |
| DB_PORT | PostgreSQL port |
| DB_USER | PostgreSQL user |
| DB_PASSWORD | PostgreSQL password |
| DB_NAME | PostgreSQL database name |
| WALLET_SERVICE_URL | Wallet Service URL for internal communication |
| WALLET_SERVICE_ENABLED | Enable/disable wallet communication |
| NEW_RELIC_LICENSE_KEY | New Relic APM license key |
| NEW_RELIC_APP_NAME | Application name in New Relic |
| NEW_RELIC_LOG_LEVEL | New Relic log level |
| NEW_RELIC_ENABLED | Enable/disable New Relic |

## Authentication Architecture

This service implements **dual JWT authentication**:

### External Authentication (Clients → User Service)
- **Secret:** `ILIACHALLENGE`
- **Purpose:** Client applications (frontend/mobile)
- **Duration:** 24 hours
- **Endpoints:** All public and protected user routes

### Internal Authentication (User Service ↔ Wallet Service)
- **Secret:** `ILIACHALLENGE_INTERNAL`
- **Purpose:** Service-to-service communication
- **Duration:** 1 hour
- **Endpoints:** Internal API calls between microservices

## API Endpoints

### Public Endpoints (No Authentication Required)

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
    "email": "user@example.com",
    "password": "secure_password",
    "name": "John Doe"
}
```

**Response:**
```json
{
    "success": true,
    "message": "User registered successfully",
    "data": {
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "user": {
            "id": "uuid",
            "email": "user@example.com",
            "name": "John Doe"
        }
    }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
    "email": "user@example.com",
    "password": "secure_password"
}
```

**Response:**
```json
{
    "success": true,
    "message": "Login successful",
    "data": {
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "user": {
            "id": "uuid",
            "email": "user@example.com",
            "name": "John Doe"
        }
    }
}
```

### Protected Endpoints (Authentication Required)

#### Get User Profile
```http
GET /api/profile
Authorization: Bearer <token>
```

**Response:**
```json
{
    "success": true,
    "data": {
        "id": "uuid",
        "email": "user@example.com",
        "name": "John Doe",
        "isActive": true,
        "createdAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-01-15T10:30:00Z"
    }
}
```

#### Get Profile with Financial Data
```http
GET /api/profile/financial
Authorization: Bearer <token>
```

**Response:**
```json
{
    "success": true,
    "data": {
        "user": {
            "id": "uuid",
            "email": "user@example.com",
            "name": "John Doe",
            "isActive": true,
            "createdAt": "2024-01-15T10:30:00Z",
            "updatedAt": "2024-01-15T10:30:00Z"
        },
        "wallet": {
            "balance": {
                "userId": "uuid",
                "balance": 1500.00,
                "totalCredits": 2000.00,
                "totalDebits": 500.00,
                "transactionsCount": 10
            },
            "transactions": [
                {
                    "id": "transaction_uuid",
                    "userId": "uuid",
                    "amount": 100.00,
                    "type": "CREDIT",
                    "description": "Deposit",
                    "createdAt": "2024-01-15T10:30:00Z"
                }
            ]
        }
    }
}
```

#### List All Users
```http
GET /api/users
Authorization: Bearer <token>
```

**Response:**
```json
{
    "success": true,
    "data": [
        {
            "id": "uuid",
            "email": "user@example.com",
            "name": "John Doe",
            "isActive": true,
            "createdAt": "2024-01-15T10:30:00Z",
            "updatedAt": "2024-01-15T10:30:00Z"
        }
    ],
    "count": 1
}
```

## Internal Communication

The User Service communicates with the Wallet Service using REST API with internal JWT authentication.

### Events Published to RabbitMQ

| Event | Description | Payload |
|-------|-------------|---------|
| `USER_REGISTERED` | User created successfully | `{ userId, email, name }` |
| `USER_LOGGED_IN` | User authenticated | `{ userId, email }` |

### Internal API Calls to Wallet Service

The service makes authenticated calls to Wallet Service endpoints:

- `POST /api/internal/events` - Notify wallet about user events
- `GET /api/internal/balance/:userId` - Get user wallet balance
- `GET /api/internal/transactions/:userId` - Get user transactions

All internal calls use JWT with `ILIACHALLENGE_INTERNAL` secret.

## Validation Rules

### Registration
- **Email:** Must be valid email format
- **Password:** Minimum 6 characters
- **Name:** Between 2-100 characters

### Login
- **Email:** Must be valid email format
- **Password:** Required

## Security Features

- ✅ Password hashing with bcrypt (10 rounds)
- ✅ JWT token authentication
- ✅ Input validation and sanitization
- ✅ Rate limiting (100 requests per 15 minutes)
- ✅ Helmet security headers
- ✅ CORS protection
- ✅ Separate secrets for external and internal auth

## Docker Setup

You can run the service using either **Docker** or **Docker Compose**.

### Using Docker

1. **Build the Docker image:**
    ```bash
    docker build -t user-service .
    ```

2. **Run the Docker container:**
    ```bash
    docker run -p 3002:3002 user-service
    ```

3. **Access the API:**
    Open your browser and go to `http://localhost:3002`.

### Using Docker Compose

1. **Start the services:**
    ```bash
    docker-compose up --build
    ```

2. **Access the API:**
    Open your browser and go to `http://localhost:3002`.

> The `docker-compose.yml` file includes all necessary services like PostgreSQL, Redis, and RabbitMQ.

## Testing the API

### Quick Test Script

```bash
# 1. Register a new user
curl -X POST http://localhost:3002/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123",
    "name": "Test User"
  }'

# 2. Login (save the token)
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123"
  }'

# 3. Get profile (use token from login)
TOKEN="your-token-here"
curl http://localhost:3002/api/profile \
  -H "Authorization: Bearer $TOKEN"

# 4. Get profile with financial data
curl http://localhost:3002/api/profile/financial \
  -H "Authorization: Bearer $TOKEN"
```

## Monitoring

This application is integrated with **New Relic APM** for comprehensive monitoring:

### Features
- **Real-time Performance Tracking:** Monitor API response times
- **Distributed Tracing:** End-to-end request tracing
- **Error Analytics:** Automatic error tracking
- **Custom Events:** User registration and login tracking
- **Cache Metrics:** Redis hit/miss ratios

### Custom Metrics Tracked
- User registration events
- Login success/failure rates
- Cache performance
- Internal communication latency
- Authentication errors

## Integration with Wallet Service

This service is designed to work alongside the Wallet Service:

1. **User Registration Flow:**
   - User registers → User Service creates account
   - Publishes `USER_REGISTERED` event to RabbitMQ
   - Calls Wallet Service internal API to notify user creation
   - Returns JWT token to client

2. **Financial Data Retrieval:**
   - Client requests profile with financial data
   - User Service validates external JWT
   - Generates internal JWT token
   - Calls Wallet Service internal endpoints
   - Combines user and wallet data
   - Returns complete profile

3. **Service Communication:**
   ```
   Client → User Service (JWT: ILIACHALLENGE)
            ↓
   User Service → Wallet Service (JWT: ILIACHALLENGE_INTERNAL)
   ```

## Health Checks

The service provides health check endpoints:

```http
GET /health
```

**Response:**
```json
{
    "status": "OK",
    "service": "user-service",
    "timestamp": "2024-01-15T10:30:00Z"
}
```

## Error Handling

The API returns standardized error responses:

```json
{
    "success": false,
    "message": "Error description",
    "errors": []
}
```

### Common HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Resource created |
| 400 | Bad request / Validation error |
| 401 | Unauthorized / Invalid token |
| 403 | Forbidden |
| 404 | Resource not found |
| 409 | Conflict (e.g., user already exists) |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

## 🔮 Future Improvements
- Centralized log storage using MongoDB
- Test coverage and code quality analysis with SonarQube
- CI/CD automation with quality gates
- Loading and stress test using K6

## Gitflow & Code Review

This project follows Gitflow practices:
- Development was done using feature branches
- At least one Pull Request was created and reviewed
- All changes were merged into the main branch via PR

## Author

<img src="https://avatars1.githubusercontent.com/u/46221221?s=460&u=0d161e390cdad66e925f3d52cece6c3e65a23eb2&v=4" width=115>  

<sub>@jacksonn455</sub>

---

**ília Digital - Code Challenge NodeJS**  
User Microservice - Part 2
