# Grades 1 and 3 TX and TM records - Backend API

A complete Node.js/Express backend for managing book inventory data with advanced filtering, search, and CRUD operations.

## Features

- **RESTful API** with Express.js and TypeScript
- **PostgreSQL Database** with optimized schema and indexes
- **Advanced Search & Filtering** with full-text search capabilities
- **Pagination** with customizable page sizes
- **Data Validation** using Joi
- **Error Handling** with standardized error responses
- **Security** with CORS, helmet, and rate limiting
- **Logging** with Winston
- **Development Tools** with hot reload and testing

## Quick Start

### Prerequisites

- Node.js 20+ 
- PostgreSQL 15+
- npm or yarn

### Installation

1. **Clone and setup:**
```bash
cd backend
npm install
```

2. **Database Setup:**
```bash
# Create PostgreSQL database
createdb book_management

# Run migrations
psql -d book_management -f src/database/migrations/001_initial_schema.sql
```

3. **Environment Configuration:**
```bash
cp .env.example .env
# Edit .env with your database credentials
```

4. **Start Development Server:**
```bash
npm run dev
```

The API will be available at `http://localhost:3000`

## API Endpoints

### Books Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/books` | Fetch books with filtering, search, pagination |
| GET | `/api/books/:bookCode` | Get specific book by code |
| POST | `/api/books` | Create new book |
| PUT | `/api/books/:bookCode` | Update existing book |
| DELETE | `/api/books/:bookCode` | Delete book |
| POST | `/api/books/:bookCode/remarks` | Add remark to book |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Service health check |

## API Documentation

### GET `/api/books`

Fetch paginated list of books with optional filtering and sorting.

**Query Parameters:**
```typescript
{
  page?: number;           // Default: 1
  limit?: number;          // Default: 10, Max: 100
  sortBy?: string;         // book_code, learning_area, grade_level, publisher, title, status, created_at, updated_at
  sortOrder?: 'asc'|'desc'; // Default: 'desc'
  search?: string;         // Full-text search across all text fields
  status?: string[];       // Array of status values
  learningArea?: string[]; // Filter by learning area
  gradeLevel?: number[];   // Filter by grade levels
  publisher?: string[];    // Filter by publishers
  hasRemarks?: boolean;    // Filter books with/without remarks
}
```

**Response:**
```typescript
{
  success: boolean;
  data: Book[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: {
    availableStatuses: string[];
    availableLearningAreas: string[];
    availablePublishers: string[];
    gradeLevels: number[];
  };
}
```

### POST `/api/books`

Create a new book entry.

**Request Body:**
```typescript
{
  learningArea: string;     // Required, max 100 chars
  gradeLevel: number;       // Required, 1-12
  publisher: string;        // Required, max 200 chars
  title: string;           // Required, max 500 chars
  status: Status;          // Required, enum value
  remark?: string;         // Optional initial remark
  isNew?: boolean;         // Optional, default true
}
```

**Status Values:**
- "For Evaluation"
- "For Revision" 
- "For ROR"
- "For Finalization"
- "For FRR"
- "For Signing off"
- "NOT FOUND"
- "RETURNED"
- "In Progress"
 - "RTP"

## Database Schema

The system uses PostgreSQL with the following main tables:

### `books`
- Primary table for book data
- Includes book_code, learning_area, grade_level, publisher, title, status
- Full-text search index for efficient text search
- Automatic timestamp tracking with triggers

### `remarks`
- Stores book remarks/notes
- Cascades with book deletion
- Unique constraint on book_code + timestamp

### `users` (for future auth)
- User management for authentication
- Role-based access control ready

## Development

### Scripts

```bash
npm run dev        # Start development server with hot reload
npm run build      # Build TypeScript to JavaScript
npm start          # Start production server
npm test           # Run tests
npm run lint       # Run ESLint
npm run migrate    # Run database migrations
```

### Environment Variables

```env
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=postgresql://book_user:book_password@localhost:5432/book_management
DB_HOST=localhost
DB_PORT=5432
DB_NAME=book_management
DB_USER=book_user
DB_PASSWORD=book_password

# Security
JWT_SECRET=your-super-secure-jwt-secret-key
JWT_REFRESH_SECRET=your-super-secure-refresh-secret-key

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
CORS_ORIGIN=http://localhost:5173
```

### Testing

The backend includes comprehensive testing setup:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test -- --coverage
```

### Error Handling

Standardized error response format:

```typescript
{
  success: false;
  error: {
    code: string;          // Machine-readable error code
    message: string;       // Human-readable error message
    details?: object;      // Additional error details
    timestamp: string;     // ISO 8601 timestamp
    path: string;          // Request path that caused error
  }
}
```

**Common Error Codes:**
- `VALIDATION_ERROR` - Input validation failed
- `NOT_FOUND` - Resource not found
- `UNAUTHORIZED` - Authentication required
- `FORBIDDEN` - Insufficient permissions
- `RATE_LIMITED` - Too many requests
- `SERVER_ERROR` - Internal server error

## Architecture

### Project Structure

```
backend/
├── src/
│   ├── config/           # Configuration files
│   │   ├── database.ts   # Database configuration
│   │   └── environment.ts # Environment variables
│   ├── middleware/       # Express middleware
│   │   ├── errorHandler.ts
│   │   └── validation.ts
│   ├── routes/          # API routes
│   │   └── books.ts     # Books API endpoints
│   ├── services/        # Business logic
│   │   └── bookService.ts
│   ├── types/           # TypeScript definitions
│   │   └── index.ts
│   ├── utils/           # Utilities
│   │   └── logger.ts
│   ├── database/        # Database files
│   │   └── migrations/
│   ├── app.ts          # Express app configuration
│   └── server.ts       # Server entry point
├── package.json
├── tsconfig.json
└── .env.example
```

### Key Features

- **Service Layer Pattern** - Business logic separated from routes
- **Repository Pattern** - Data access abstraction
- **Middleware Stack** - Comprehensive request/response handling
- **Error Boundaries** - Centralized error handling
- **Type Safety** - Full TypeScript coverage
- **Security First** - Built-in security middleware

## Deployment

### Production Setup

1. **Build the application:**
```bash
npm run build
```

2. **Set production environment:**
```bash
export NODE_ENV=production
```

3. **Start production server:**
```bash
npm start
```

### Docker Support

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

USER node

CMD ["npm", "start"]
```

### Database Migration

```bash
# Run all migrations
npm run migrate

# The schema is automatically created from:
# src/database/migrations/001_initial_schema.sql
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## Performance

- **Database Indexing** - Optimized indexes for common queries
- **Full-text Search** - PostgreSQL GIN indexes for text search
- **Connection Pooling** - Configurable database connection pool
- **Compression** - Response compression middleware
- **Rate Limiting** - API rate limiting to prevent abuse

## License

MIT License - see LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Check the API documentation at `/api-docs` (when server is running)
- Review the health check endpoint at `/health`
