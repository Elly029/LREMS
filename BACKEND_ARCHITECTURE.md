# Grades 1 and 3 TX and TM records - Backend Architecture

## Executive Summary

This document outlines the comprehensive backend architecture for the Grades 1 and 3 TX and TM records, designed to support a modern React frontend with advanced filtering, sorting, search, and CRUD operations for book inventory management.

---

## 1. Technology Stack Recommendations

### 1.1 Database Technology: PostgreSQL

**Recommendation: PostgreSQL 15+**

**Rationale:**
- **ACID Compliance**: Essential for data integrity in inventory management
- **Advanced Indexing**: GIN/GiST indexes for full-text search and complex queries
- **JSON Support**: Native JSONB fields for flexible remark storage
- **Scalability**: Horizontal and vertical scaling capabilities
- **Reliability**: Robust backup and replication features
- **Extensibility**: Rich ecosystem of extensions and tools

**Why PostgreSQL over alternatives:**
- **vs MySQL**: Better JSON support, superior indexing, more analytical functions
- **vs MongoDB**: Stronger consistency for inventory data, better relational queries
- **vs SQL Server**: Cost-effective, open-source, excellent performance

### 1.2 Backend Framework: Node.js with Express.js

**Recommendation: Node.js 20+ with Express.js 4.18+**

**Rationale:**
- **JavaScript Ecosystem**: Consistent language with React frontend
- **Rapid Development**: Rich middleware ecosystem, fast prototyping
- **Performance**: Excellent for I/O-bound operations (database queries, API calls)
- **Scalability**: Event-driven, non-blocking architecture
- **Community**: Extensive library support for most requirements

**Alternative consideration: Python with FastAPI**
- **Pros**: Excellent for data validation, auto-documentation, async support
- **Cons**: Different language from frontend, smaller ecosystem for this use case

### 1.3 Authentication/Authorization Strategy

**Recommendation: JWT-based Authentication with Role-Based Access Control (RBAC)**

**Components:**
- **JWT Tokens**: Access + Refresh token strategy
- **User Roles**: Admin, Editor, Viewer roles
- **Permissions**: Fine-grained permission system
- **Session Management**: Secure token handling

**Implementation:**
```javascript
// JWT Payload Structure
{
  "sub": "user_id",
  "email": "user@example.com",
  "role": "editor",
  "permissions": ["books:read", "books:write", "remarks:write"],
  "iat": 1703123456,
  "exp": 1703127056
}
```

### 1.4 Deployment and Hosting Strategy

**Recommended Stack:**

1. **Container Orchestration**: Docker + Kubernetes
2. **Cloud Platform**: AWS/Azure/GCP
3. **Database Hosting**: Managed PostgreSQL (RDS/Azure Database)
4. **Caching**: Redis for session management and query caching
5. **API Gateway**: Nginx or cloud-based API gateway
6. **Monitoring**: Prometheus + Grafana, ELK stack
7. **CI/CD**: GitHub Actions or GitLab CI

**Infrastructure Diagram:**
```
[Load Balancer] → [API Gateway] → [App Servers (Express.js)]
                                    ↓
                            [Redis Cache] → [PostgreSQL Database]
```

---

## 2. API Design Specification

### 2.1 RESTful API Endpoints

#### 2.1.1 GET `/api/books`

**Description**: Retrieve paginated list of books with optional filtering and sorting

**Query Parameters:**
```typescript
{
  page?: number;           // Default: 1
  limit?: number;          // Default: 10, Max: 100
  sortBy?: string;         // bookCode, learningArea, gradeLevel, publisher, title, status, createdAt
  sortOrder?: 'asc'|'desc'; // Default: 'asc'
  search?: string;         // Full-text search across all text fields
  status?: string[];       // Array of status values
  learningArea?: string[]; // Filter by learning area
  gradeLevel?: number[];   // Filter by grade levels
  publisher?: string[];    // Filter by publishers
  hasRemarks?: boolean;    // Filter books with/without remarks
}
```

**Response Schema:**
```typescript
{
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

**HTTP Status Codes:**
- `200 OK`: Successful response
- `400 Bad Request`: Invalid query parameters
- `500 Internal Server Error`: Server error

#### 2.1.2 POST `/api/books`

**Description**: Create a new book entry

**Request Schema:**
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

**Response Schema:**
```typescript
{
  success: boolean;
  data: Book;
  message: string;
}
```

**HTTP Status Codes:**
- `201 Created`: Book created successfully
- `400 Bad Request`: Validation error
- `409 Conflict`: Duplicate book code (if implementing unique constraints)
- `500 Internal Server Error`: Server error

#### 2.1.3 PUT `/api/books/:bookCode`

**Description**: Update an existing book

**Request Schema:**
```typescript
{
  learningArea?: string;
  gradeLevel?: number;
  publisher?: string;
  title?: string;
  status?: Status;
  isNew?: boolean;
  remark?: string;  // Optional remark to add during update
}
```

**Response Schema:**
```typescript
{
  success: boolean;
  data: Book;
  message: string;
}
```

**HTTP Status Codes:**
- `200 OK`: Book updated successfully
- `404 Not Found`: Book not found
- `400 Bad Request`: Validation error
- `500 Internal Server Error`: Server error

#### 2.1.4 DELETE `/api/books/:bookCode`

**Description**: Delete a book entry

**Response Schema:**
```typescript
{
  success: boolean;
  message: string;
}
```

**HTTP Status Codes:**
- `204 No Content`: Book deleted successfully
- `404 Not Found`: Book not found
- `409 Conflict`: Cannot delete if book has dependencies
- `500 Internal Server Error`: Server error

#### 2.1.5 POST `/api/books/:bookCode/remarks`

**Description**: Add a remark to a specific book

**Request Schema:**
```typescript
{
  text: string;            // Required, max 1000 chars
  timestamp?: string;      // Optional, ISO 8601 format, defaults to now
}
```

**Response Schema:**
```typescript
{
  success: boolean;
  data: Remark;
  message: string;
}
```

**HTTP Status Codes:**
- `201 Created`: Remark added successfully
- `404 Not Found`: Book not found
- `400 Bad Request`: Validation error
- `500 Internal Server Error`: Server error

### 2.2 Error Handling Patterns

**Standard Error Response Format:**
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
- `VALIDATION_ERROR`: Input validation failed
- `NOT_FOUND`: Resource not found
- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: Insufficient permissions
- `RATE_LIMITED`: Too many requests
- `SERVER_ERROR`: Internal server error

### 2.3 Response Format Standards

**Success Response Format:**
```typescript
{
  success: boolean;
  data?: any;              // Response payload
  message?: string;        // Optional human-readable message
  pagination?: object;     // For paginated responses
}
```

---

## 3. Data Model Design

### 3.1 Database Schema

#### 3.1.1 Books Table

```sql
CREATE TABLE books (
    book_code VARCHAR(20) PRIMARY KEY,
    learning_area VARCHAR(100) NOT NULL,
    grade_level INTEGER NOT NULL CHECK (grade_level >= 1 AND grade_level <= 12),
    publisher VARCHAR(200) NOT NULL,
    title VARCHAR(500) NOT NULL,
    status VARCHAR(50) NOT NULL,
    is_new BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    
    -- Constraints
    CONSTRAINT valid_status CHECK (status IN (
        'For Evaluation',
        'For Revision',
        'For ROR',
        'For Finalization',
        'For FRR',
        'For Signing off',
        'NOT FOUND',
        'RETURNED',
        'In Progress'
    ))
);

-- Indexes for performance
CREATE INDEX idx_books_learning_area ON books(learning_area);
CREATE INDEX idx_books_grade_level ON books(grade_level);
CREATE INDEX idx_books_publisher ON books(publisher);
CREATE INDEX idx_books_status ON books(status);
CREATE INDEX idx_books_created_at ON books(created_at DESC);
CREATE INDEX idx_books_search ON books USING gin(to_tsvector('english', learning_area || ' ' || publisher || ' ' || title));

-- Updated timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_books_updated_at BEFORE UPDATE ON books
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

#### 3.1.2 Remarks Table

```sql
CREATE TABLE remarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_code VARCHAR(20) NOT NULL REFERENCES books(book_code) ON DELETE CASCADE,
    text TEXT NOT NULL CHECK (length(text) <= 1000),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    
    -- Composite index for efficient book+timestamp queries
    CONSTRAINT unique_book_timestamp UNIQUE (book_code, timestamp)
);

-- Indexes for performance
CREATE INDEX idx_remarks_book_code ON remarks(book_code);
CREATE INDEX idx_remarks_timestamp ON remarks(book_code, timestamp DESC);

-- Updated timestamp trigger (if we want to track remark edits)
CREATE TRIGGER update_remarks_updated_at BEFORE UPDATE ON remarks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

#### 3.1.3 Users Table

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'viewer',
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_role CHECK (role IN ('admin', 'editor', 'viewer'))
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);

-- Updated timestamp trigger
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

#### 3.1.4 User Sessions Table (for JWT blacklisting)

```sql
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    revoked_at TIMESTAMPTZ,
    
    CONSTRAINT unique_token UNIQUE (token_hash)
);

CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX idx_user_sessions_revoked ON user_sessions(revoked_at);
```

### 3.2 Data Relationships

```
users (1) ----< (N) books
users (1) ----< (N) remarks
users (1) ----< (N) user_sessions

books (1) ----< (N) remarks
```

---

## 4. Business Logic Planning

### 4.1 Data Validation Rules

#### 4.1.1 Book Validation Rules

```typescript
interface BookValidationRules {
  bookCode: {
    pattern: /^[0-9A-Z]+$/;
    maxLength: 20;
    unique: true;
  };
  learningArea: {
    required: true;
    maxLength: 100;
    format: 'alphanumeric_with_spaces';
  };
  gradeLevel: {
    required: true;
    type: 'integer';
    min: 1;
    max: 12;
  };
  publisher: {
    required: true;
    maxLength: 200;
    format: 'alphanumeric_with_spaces_punctuation';
  };
  title: {
    required: true;
    maxLength: 500;
    minLength: 1;
  };
  status: {
    required: true;
    enum: Status[];
  };
}
```

#### 4.1.2 Remark Validation Rules

```typescript
interface RemarkValidationRules {
  text: {
    required: true;
    maxLength: 1000;
    minLength: 1;
    format: 'text_with_preserved_whitespace';
  };
  timestamp: {
    type: 'ISO_8601';
    maxFuture: '1_hour'; // Prevent future timestamps beyond 1 hour
  };
}
```

### 4.2 Business Constraints and Rules

1. **Unique Book Code**: Each book must have a unique identifier
2. **Status Workflow**: Optional business rules for status transitions
3. **Audit Trail**: All changes must be tracked with user and timestamp
4. **Remark Integrity**: Remarks cannot exist without an associated book
5. **Soft Delete**: Books should be soft-deleted to preserve audit trail
6. **Data Retention**: Implement retention policies for old remarks

### 4.3 Audit Trails and Logging

#### 4.3.1 Audit Table Design

```sql
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name VARCHAR(50) NOT NULL,
    record_id VARCHAR(50) NOT NULL,
    operation VARCHAR(10) NOT NULL, -- INSERT, UPDATE, DELETE
    old_values JSONB,
    new_values JSONB,
    changed_by UUID REFERENCES users(id),
    changed_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Indexes
    CONSTRAINT valid_operation CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE'))
);

CREATE INDEX idx_audit_table_record ON audit_log(table_name, record_id);
CREATE INDEX idx_audit_changed_by ON audit_log(changed_by);
CREATE INDEX idx_audit_changed_at ON audit_log(changed_at);
```

#### 4.3.2 Logging Strategy

```javascript
// Application-level logging
const auditLogger = {
  logChange: async (table, recordId, operation, oldValues, newValues, userId) => {
    await db.audit_log.insert({
      table_name: table,
      record_id: recordId,
      operation,
      old_values: oldValues,
      new_values: newValues,
      changed_by: userId
    });
  }
};
```

### 4.4 Data Relationships and Foreign Keys

1. **Cascading Deletes**: Remarks cascade delete with books
2. **User Constraints**: Users cannot be deleted if they have associated records
3. **Referential Integrity**: All foreign key constraints enforced
4. **Data Consistency**: Triggers ensure data consistency across related tables

---

## 5. Scalability & Security

### 5.1 Performance Optimization Strategies

#### 5.1.1 Database Optimization

```sql
-- Full-text search index for books
CREATE INDEX idx_books_fulltext ON books 
USING gin(to_tsvector('english', learning_area || ' ' || publisher || ' ' || title));

-- Composite indexes for common query patterns
CREATE INDEX idx_books_status_grade ON books(status, grade_level);
CREATE INDEX idx_books_publisher_grade ON books(publisher, grade_level);

-- Partial indexes for active records
CREATE INDEX idx_books_active ON books(created_at DESC) 
WHERE is_new = true;
```

#### 5.1.2 Caching Strategy

```javascript
// Redis cache implementation
const cacheConfig = {
  bookList: {
    ttl: 300, // 5 minutes
    key: 'books:list:{page}:{limit}:{filtersHash}'
  },
  bookDetail: {
    ttl: 600, // 10 minutes
    key: 'books:detail:{bookCode}'
  },
  filterOptions: {
    ttl: 3600, // 1 hour
    key: 'books:filters'
  }
};

// Cache invalidation strategy
const invalidateCache = {
  onBookChange: async (bookCode) => {
    await redis.del(`books:detail:${bookCode}`);
    await redis.delPattern('books:list:*');
    await redis.del('books:filters');
  }
};
```

#### 5.1.3 Query Optimization

```javascript
// Optimized query builder
const bookQueryBuilder = {
  buildSearchQuery: (params) => {
    return db.books
      .select(`
        *,
        remarks:remarks(count).order(remarks.timestamp.desc).limit(5)
      `)
      .where(builder => {
        // Apply filters
        if (params.search) {
          builder.whereRaw(
            "to_tsvector('english', learning_area || ' ' || publisher || ' ' || title) @@ plainto_tsquery(?)",
            [params.search]
          );
        }
        
        if (params.status?.length) {
          builder.whereIn('status', params.status);
        }
        
        // Add other filters...
      })
      .orderBy(params.sortBy || 'created_at', params.sortOrder || 'desc')
      .limit(params.limit || 10)
      .offset((params.page - 1) * (params.limit || 10));
  }
};
```

### 5.2 Security Best Practices

#### 5.2.1 Authentication & Authorization

```javascript
// JWT middleware with role-based access
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Access token required' }
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await db.users.findById(decoded.sub);
    
    if (!user || !user.is_active) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Invalid or expired token' }
      });
    }
    
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'Invalid token' }
    });
  }
};

// Role-based authorization middleware
const requirePermission = (permission) => {
  return (req, res, next) => {
    const userPermissions = getUserPermissions(req.user.role);
    
    if (!userPermissions.includes(permission)) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Insufficient permissions' }
      });
    }
    
    next();
  };
};
```

#### 5.2.2 Input Validation & Sanitization

```javascript
// Input validation using Joi
const bookValidationSchema = Joi.object({
  learningArea: Joi.string().max(100).required(),
  gradeLevel: Joi.number().integer().min(1).max(12).required(),
  publisher: Joi.string().max(200).required(),
  title: Joi.string().max(500).required(),
  status: Joi.string().valid(...Object.values(Status)).required(),
  isNew: Joi.boolean(),
  remark: Joi.string().max(1000).optional()
});

// SQL injection prevention
const sanitizeInput = (input) => {
  return input.replace(/[<>'"&]/g, (char) => {
    const entities = {
      '<': '<',
      '>': '>',
      '"': '"',
      "'": '&#x27;',
      '&': '&'
    };
    return entities[char] || char;
  });
};
```

#### 5.2.3 Rate Limiting & API Protection

```javascript
// Rate limiting configuration
const rateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many requests, please try again later'
    }
  },
  standardHeaders: true,
  legacyHeaders: false
};

// API security headers
const securityHeaders = (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
};
```

### 5.3 Database Indexing Strategies

#### 5.3.1 Performance Indexes

```sql
-- Primary search index
CREATE INDEX CONCURRENTLY idx_books_search_main 
ON books USING gin(to_tsvector('english', title || ' ' || publisher || ' ' || learning_area));

-- Filter combination indexes
CREATE INDEX CONCURRENTLY idx_books_status_grade_publisher 
ON books(status, grade_level, publisher);

-- Sort optimization indexes
CREATE INDEX CONCURRENTLY idx_books_created_desc 
ON books(created_at DESC);

CREATE INDEX CONCURRENTLY idx_books_title_asc 
ON books(title ASC);

-- Remarks optimization
CREATE INDEX CONCURRENTLY idx_remarks_book_timestamp 
ON remarks(book_code, timestamp DESC);

-- Partial indexes for common filters
CREATE INDEX CONCURRENTLY idx_books_new_status 
ON books(status, created_at DESC) 
WHERE is_new = true;
```

#### 5.3.2 Maintenance Strategy

```sql
-- Regular maintenance queries
ANALYZE books;
ANALYZE remarks;
ANALYZE users;

-- Update statistics for query planner
VACUUM ANALYZE books;
VACUUM ANALYZE remarks;

-- Check index usage
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

---

## 6. Development Roadmap

### 6.1 Phase 1: Basic CRUD Operations (Weeks 1-3)

**Objectives**: Implement core functionality for book management

**Tasks**:
- [ ] Set up development environment and database
- [ ] Implement database schema and relationships
- [ ] Create basic Express.js server structure
- [ ] Implement authentication middleware
- [ ] Build Book CRUD endpoints (GET, POST, PUT, DELETE)
- [ ] Build Remark endpoints (POST for adding remarks)
- [ ] Add basic input validation
- [ ] Implement error handling patterns
- [ ] Set up basic logging

**Deliverables**:
- Working API with all CRUD operations
- Database with proper schema
- Basic authentication
- Error handling and logging
- API documentation

**Code Example - Basic Express Setup**:
```javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { authenticateToken } = require('./middleware/auth');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Protected routes
app.use('/api/books', authenticateToken, require('./routes/books'));
app.use('/api/auth', require('./routes/auth'));

module.exports = app;
```

### 6.2 Phase 2: Advanced Features (Weeks 4-6)

**Objectives**: Add search, filtering, pagination, and performance optimization

**Tasks**:
- [ ] Implement advanced search with full-text search
- [ ] Add multi-field filtering capabilities
- [ ] Implement pagination with cursor-based approach
- [ ] Add sorting on all fields including remarks
- [ ] Set up Redis caching layer
- [ ] Implement database query optimization
- [ ] Add comprehensive filtering options
- [ ] Performance testing and optimization

**Deliverables**:
- Advanced search and filtering
- Optimized database queries
- Caching implementation
- Performance benchmarks
- Enhanced API response times

**Code Example - Advanced Search Implementation**:
```javascript
const searchBooks = async (filters) => {
  const {
    search,
    status,
    learningArea,
    gradeLevel,
    publisher,
    hasRemarks,
    page = 1,
    limit = 10,
    sortBy = 'created_at',
    sortOrder = 'desc'
  } = filters;

  // Build dynamic query with caching
  const cacheKey = `books:search:${hash(JSON.stringify(filters))}`;
  const cached = await redis.get(cacheKey);
  
  if (cached) {
    return JSON.parse(cached);
  }

  let query = db.books
    .select(`
      *,
      remarks:remarks(count).order(remarks.timestamp.desc).limit(3)
    `)
    .where(builder => {
      // Full-text search
      if (search) {
        builder.whereRaw(
          "to_tsvector('english', title || ' ' || publisher || ' ' || learning_area) @@ plainto_tsquery(?)",
          [search]
        );
      }

      // Multi-field filtering
      if (status?.length) {
        builder.whereIn('status', status);
      }

      if (learningArea?.length) {
        builder.whereIn('learning_area', learningArea);
      }

      if (gradeLevel?.length) {
        builder.whereIn('grade_level', gradeLevel);
      }

      if (publisher?.length) {
        builder.whereIn('publisher', publisher);
      }

      if (hasRemarks !== undefined) {
        if (hasRemarks) {
          builder.whereExists(db.remarks.select(1).where('book_code', '=', db.ref('books.book_code')));
        } else {
          builder.whereNotExists(db.remarks.select(1).where('book_code', '=', db.ref('books.book_code')));
        }
      }
    })
    .orderBy(sortBy, sortOrder)
    .limit(limit)
    .offset((page - 1) * limit);

  const [books, totalCount] = await Promise.all([
    query,
    getTotalCount(filters) // Separate count query for performance
  ]);

  // Cache results
  await redis.setex(cacheKey, 300, JSON.stringify(books));

  return {
    data: books,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      totalItems: totalCount,
      itemsPerPage: limit
    }
  };
};
```

### 6.3 Phase 3: Authentication & Authorization (Weeks 7-8)

**Objectives**: Implement comprehensive security and user management

**Tasks**:
- [ ] Implement JWT authentication with refresh tokens
- [ ] Create role-based access control (RBAC)
- [ ] Add user management endpoints
- [ ] Implement session management and token blacklisting
- [ ] Add comprehensive audit logging
- [ ] Security testing and penetration testing
- [ ] Add API documentation with Swagger/OpenAPI

**Deliverables**:
- Complete authentication system
- Role-based access control
- Audit logging system
- Security-hardened API
- API documentation

**Code Example - JWT Authentication**:
```javascript
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

class AuthService {
  generateTokens(user) {
    const accessToken = jwt.sign(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
        permissions: getUserPermissions(user.role)
      },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { sub: user.id, tokenVersion: user.token_version },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    return { accessToken, refreshToken };
  }

  async validatePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  async revokeUserTokens(userId) {
    // Increment token version to invalidate all existing tokens
    await db.users
      .where({ id: userId })
      .increment('token_version', 1);
    
    // Add current tokens to blacklist
    await db.user_sessions
      .where({ user_id: userId, revoked_at: null })
      .update({ revoked_at: new Date() });
  }
}
```

### 6.4 Phase 4: Performance Optimization & Monitoring (Weeks 9-10)

**Objectives**: Optimize performance and implement comprehensive monitoring

**Tasks**:
- [ ] Implement database connection pooling
- [ ] Add comprehensive monitoring and alerting
- [ ] Performance optimization and load testing
- [ ] Implement health checks and status endpoints
- [ ] Add comprehensive error tracking
- [ ] Set up CI/CD pipeline
- [ ] Documentation and deployment guides

**Deliverables**:
- Production-ready performance optimizations
- Monitoring and alerting system
- Automated deployment pipeline
- Complete documentation
- Load testing reports

**Code Example - Monitoring & Health Checks**:
```javascript
const prometheus = require('prom-client');

// Metrics collection
const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status']
});

const httpRequestsTotal = new prometheus.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status']
});

// Health check endpoint
app.get('/health', async (req, res) => {
  const healthCheck = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    checks: {}
  };

  try {
    // Database health check
    await db.raw('SELECT 1');
    healthCheck.checks.database = 'OK';
  } catch (error) {
    healthCheck.checks.database = 'ERROR';
    healthCheck.status = 'ERROR';
  }

  try {
    // Redis health check
    await redis.ping();
    healthCheck.checks.redis = 'OK';
  } catch (error) {
    healthCheck.checks.redis = 'ERROR';
    healthCheck.status = 'ERROR';
  }

  const statusCode = healthCheck.status === 'OK' ? 200 : 503;
  res.status(statusCode).json(healthCheck);
});

// Metrics endpoint
app.get('/metrics', (req, res) => {
  res.set('Content-Type', prometheus.register.contentType);
  res.end(prometheus.register.metrics());
});
```

---

## 7. Implementation Guidance

### 7.1 Development Setup

**Prerequisites:**
- Node.js 20+
- PostgreSQL 15+
- Redis 7+
- Docker (optional)

**Environment Configuration:**
```bash
# .env file
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/book_management
DB_POOL_MIN=5
DB_POOL_MAX=20

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secure-jwt-secret
JWT_REFRESH_SECRET=your-super-secure-refresh-secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
```

### 7.2 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js
│   │   ├── redis.js
│   │   └── environment.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── validation.js
│   │   ├── rateLimit.js
│   │   └── errorHandler.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── books.js
│   │   └── users.js
│   ├── services/
│   │   ├── bookService.js
│   │   ├── authService.js
│   │   ├── cacheService.js
│   │   └── auditService.js
│   ├── models/
│   │   ├── Book.js
│   │   ├── User.js
│   │   └── Remark.js
│   ├── utils/
│   │   ├── logger.js
│   │   ├── validation.js
│   │   └── hash.js
│   ├── migrations/
│   └── tests/
├── docs/
├── scripts/
└── package.json
```

### 7.3 Testing Strategy

**Unit Tests Example:**
```javascript
const request = require('supertest');
const app = require('../src/app');

describe('Books API', () => {
  describe('GET /api/books', () => {
    it('should return paginated list of books', async () => {
      const response = await request(app)
        .get('/api/books?page=1&limit=10')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should filter books by status', async () => {
      const response = await request(app)
        .get('/api/books?status=In%20Progress')
        .expect(200);

      expect(response.body.data.every(book => 
        book.status === 'In Progress'
      )).toBe(true);
    });
  });

  describe('POST /api/books', () => {
    it('should create a new book', async () => {
      const bookData = {
        learningArea: 'Mathematics',
        gradeLevel: 5,
        publisher: 'Test Publisher',
        title: 'Test Book',
        status: 'For Evaluation'
      };

      const response = await request(app)
        .post('/api/books')
        .send(bookData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('bookCode');
      expect(response.body.data.title).toBe(bookData.title);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/books')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });
});
```

### 7.4 Deployment Considerations

**Docker Configuration:**
```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

USER node

CMD ["node", "src/server.js"]
```

**Kubernetes Deployment:**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: book-management-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: book-management-api
  template:
    metadata:
      labels:
        app: book-management-api
    spec:
      containers:
      - name: api
        image: book-management-api:latest
        ports:
        - containerPort: 3000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: database-secret
              key: url
```

---

## Conclusion

This comprehensive backend architecture provides a scalable, secure, and performant foundation for the Grades 1 and 3 TX and TM records. The design emphasizes:

1. **Scalability**: Through database optimization, caching, and modern architecture patterns
2. **Security**: With comprehensive authentication, authorization, and data protection
3. **Performance**: Via optimized queries, caching strategies, and efficient data structures
4. **Maintainability**: Through clean architecture, comprehensive testing, and documentation
5. **Extensibility**: With flexible data models and modular design patterns

The phased development approach allows for incremental delivery and testing, ensuring each component is thoroughly validated before moving to the next phase. The technology choices prioritize modern standards, community support, and long-term maintainability.

The provided code examples and implementation guidance serve as a foundation that can be directly implemented, with clear patterns for extending functionality as requirements evolve.