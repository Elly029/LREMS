# Web App Summary - Grades 1 and 3 TX and TM Records

## Overview
A full-stack book inventory management system for tracking textbook (TX) and teacher's manual (TM) records for Grades 1 and 3, with advanced filtering, search, and CRUD operations.

## Technology Stack

### Frontend
- **Framework**: React 19.2.0 with TypeScript
- **Build Tool**: Vite 6.2.0
- **Styling**: Tailwind CSS (utility-first)
- **State Management**: React Hooks (useState, useEffect, useMemo)
- **Export Features**: jsPDF, xlsx for PDF/Excel exports
- **UI Libraries**: react-datepicker, driver.js (onboarding)

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Express.js 4.18
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken) with bcrypt
- **Security**: Helmet, CORS, express-rate-limit
- **Logging**: Winston
- **Validation**: Joi, express-validator

## Architecture

### Frontend Structure
```
src/
├── components/          # React components
│   ├── DataTable.tsx   # Main table with mobile card view
│   ├── Layout.tsx      # Navigation and layout wrapper
│   ├── BookFormModal.tsx
│   ├── AddRemarkModal.tsx
│   ├── ExportButtons.tsx
│   └── StatusFilterDropdown.tsx
├── hooks/              # Custom React hooks
│   ├── useDebounce.ts
│   ├── useFilterPersistence.ts
│   ├── useMediaQuery.ts
│   └── useOnClickOutside.ts
├── services/           # API integration
│   ├── api.ts
│   └── bookService.ts
├── types.ts           # TypeScript definitions
└── App.tsx            # Main application
```

### Backend Structure
```
backend/src/
├── config/            # Configuration
│   ├── database.ts
│   └── environment.ts
├── middleware/        # Express middleware
│   ├── auth.ts
│   ├── errorHandler.ts
│   └── validation.ts
├── models/           # Mongoose models
│   ├── Book.ts
│   ├── Remark.ts
│   └── User.ts
├── routes/           # API routes
│   ├── books.ts
│   └── auth.ts
├── services/         # Business logic
│   └── bookService.ts
├── utils/            # Utilities
│   └── logger.ts
├── app.ts           # Express app setup
└── server.ts        # Server entry point
```

## Core Features

### 1. Book Management
- **CRUD Operations**: Create, Read, Update, Delete books
- **Auto-generated Book Codes**: Unique identifiers for each book
- **Book Properties**:
  - Book Code (unique identifier)
  - Learning Area (subject)
  - Grade Level (1-12)
  - Publisher
  - Title
  - Status (workflow states)
  - Is New flag

### 2. Status Workflow
Books can have the following statuses:
- For Evaluation
- For Revision
- For ROR
- For Finalization
- For FRR and Signing Off
- Final Revised copy
- NOT FOUND
- RETURNED
- DQ/FOR RETURN
- In Progress

### 3. Remarks System
- **Timestamped Notes**: Add remarks to any book
- **Remark History**: View all remarks chronologically
- **Rich Metadata**: Includes creator, from/to, status changes, delay tracking
- **Cascade Delete**: Remarks deleted when book is deleted

### 4. Advanced Search & Filtering
- **Full-text Search**: Search across title, publisher, learning area
- **Multi-field Filters**:
  - Status (multi-select)
  - Learning Area
  - Grade Level
  - Publisher
  - Has Remarks (boolean)
- **Filter Persistence**: Filters saved to sessionStorage
- **Active Filter Display**: Visual chips showing active filters

### 5. Sorting & Pagination
- **Sortable Columns**: All fields including remarks
- **Ascending/Descending**: Toggle sort direction
- **Pagination**: Configurable page size (default 10, max 100)
- **Sort Persistence**: Sort config saved to sessionStorage

### 6. Authentication & Authorization
- **JWT-based Auth**: Access + refresh token strategy
- **Role-based Access Control**:
  - Admin: Full access to all books
  - User: Access based on learning area and grade level rules
- **Access Rules**: Fine-grained permissions per user
- **Session Management**: Token stored in localStorage
- **Password Management**: Change password functionality

### 7. Responsive Design
- **Mobile-first**: Optimized for all screen sizes
- **Breakpoints**:
  - Mobile: < 768px (card view)
  - Tablet: 768px - 1023px
  - Desktop: ≥ 1024px
- **Adaptive UI**: Table switches to card view on mobile
- **Touch-friendly**: Large tap targets, swipe gestures

### 8. Export Features
- **PDF Export**: Generate PDF reports with jsPDF
- **Excel Export**: Export to .xlsx format
- **Filtered Exports**: Export respects current filters

### 9. Dashboard Statistics
- **Total Books**: Count of all books
- **Total Publishers**: Unique publisher count
- **Learning Areas**: Unique subject count
- **Filtered Count**: Shows filtered vs total

## Data Models

### Book Schema (MongoDB)
```typescript
{
  book_code: string (unique, indexed)
  learning_area: string (indexed)
  grade_level: number (1-12, indexed)
  publisher: string (indexed)
  title: string
  status: enum (indexed)
  is_new: boolean
  created_at: Date
  updated_at: Date
  created_by: string
  updated_by: string
}
```

### Remark Schema (MongoDB)
```typescript
{
  book_code: string (foreign key, indexed)
  text: string (max 1000 chars)
  timestamp: Date (indexed)
  created_by: string
  from: string (optional)
  to: string (optional)
  status: string (optional)
  days_delay_deped: number (optional)
  days_delay_publisher: number (optional)
}
```

### User Schema (MongoDB)
```typescript
{
  username: string (unique)
  password: string (hashed)
  name: string
  access_rules: [{
    learning_areas: string[]
    grade_levels: number[]
  }]
  created_at: Date
  updated_at: Date
}
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/change-password` - Change password

### Books
- `GET /api/books` - List books (with filters, search, pagination)
- `GET /api/books/:bookCode` - Get single book
- `POST /api/books` - Create new book
- `PUT /api/books/:bookCode` - Update book
- `DELETE /api/books/:bookCode` - Delete book
- `POST /api/books/:bookCode/remarks` - Add remark to book

### Query Parameters (GET /api/books)
```typescript
{
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  search?: string
  status?: string[]
  learningArea?: string[]
  gradeLevel?: number[]
  publisher?: string[]
  hasRemarks?: boolean
}
```

## Security Features

### Backend Security
- **Helmet**: Security headers
- **CORS**: Configured origin whitelist
- **Rate Limiting**: 100 requests per 15 minutes
- **Input Validation**: Joi schemas for all inputs
- **SQL Injection Prevention**: Mongoose ODM parameterization
- **XSS Protection**: Input sanitization
- **JWT Expiration**: 15-minute access tokens

### Frontend Security
- **Token Storage**: localStorage with expiration
- **Protected Routes**: Authentication required
- **HTTPS Only**: Production deployment
- **Content Security Policy**: Helmet CSP headers

## Performance Optimizations

### Frontend
- **Debounced Search**: 300ms delay to reduce API calls
- **Memoization**: useMemo for expensive computations
- **Lazy Loading**: Components loaded on demand
- **Session Storage**: Reduce server requests for filters
- **Optimistic Updates**: Immediate UI feedback

### Backend
- **Database Indexes**: On frequently queried fields
- **Aggregation Pipeline**: Efficient MongoDB queries
- **Connection Pooling**: Mongoose connection management
- **Compression**: gzip compression middleware
- **Query Optimization**: Lean queries, field projection

### Database Indexes
```javascript
book_code: unique index
status: index
learning_area: index
grade_level: index
remarks.book_code: index
remarks.timestamp: index (descending)
```

## Development Workflow

### Frontend Development
```bash
npm install          # Install dependencies
npm run dev          # Start dev server (port 5173)
npm run build        # Production build
npm run preview      # Preview production build
```

### Backend Development
```bash
cd backend
npm install          # Install dependencies
npm run dev          # Start dev server with nodemon (port 3000)
npm run build        # Compile TypeScript
npm start            # Start production server
npm test             # Run tests
```

### Environment Variables

**Frontend (.env)**
```
VITE_API_URL=http://localhost:3000
```

**Backend (.env)**
```
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/book_management
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
CORS_ORIGIN=http://localhost:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Deployment

### Docker Support
- **Dockerfile**: Multi-stage build for backend
- **docker-compose.yml**: Full stack orchestration
- **Services**: Backend, MongoDB, optional Redis

### Production Checklist
- [ ] Set NODE_ENV=production
- [ ] Configure MongoDB connection string
- [ ] Set strong JWT secrets
- [ ] Configure CORS origins
- [ ] Enable HTTPS
- [ ] Set up monitoring (Winston logs)
- [ ] Configure rate limiting
- [ ] Set up backups
- [ ] Configure CDN for static assets

## Key Custom Hooks

### useFilterPersistence
Persists filter state to sessionStorage with automatic save/restore.

### useMediaQuery
Responsive breakpoint detection (mobile, tablet, desktop).

### useDebounce
Debounces rapid input changes to reduce API calls.

### useOnClickOutside
Detects clicks outside a component (for dropdowns, modals).

## User Experience Features

### Filter Persistence
- Filters saved to sessionStorage
- Restored on page reload
- Clear all filters button
- Visual active filter chips

### Loading States
- Skeleton loaders
- Spinner animations
- Optimistic updates
- Error boundaries

### Toast Notifications
- Success messages (green)
- Error messages (red)
- Auto-dismiss after 3 seconds
- Non-blocking UI

### Accessibility
- ARIA labels on interactive elements
- Keyboard navigation support
- Focus indicators
- Screen reader friendly
- Color contrast compliance (WCAG AA)

## Testing Strategy

### Manual Testing
- Responsive design across devices
- Filter combinations
- CRUD operations
- Authentication flows
- Error handling

### Browser Support
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Documentation Files

- `README.md` - Project overview
- `BACKEND_ARCHITECTURE.md` - Detailed backend design
- `DEVELOPER_GUIDE.md` - Development guidelines
- `RESPONSIVE_BREAKPOINTS.md` - Responsive design specs
- `UI_OPTIMIZATION_SUMMARY.md` - UI improvements
- `CHANGES_SUMMARY.md` - Change log
- `QA_TESTING_CHECKLIST.md` - Testing checklist

## Future Enhancements

### Planned Features
- Bulk import/export
- Advanced reporting
- Email notifications
- Audit trail visualization
- Real-time collaboration
- Mobile app (React Native)
- Advanced analytics dashboard
- File attachments for books
- Comment threads on remarks
- Workflow automation

### Performance Improvements
- Redis caching layer
- GraphQL API option
- Server-side rendering (SSR)
- Progressive Web App (PWA)
- Offline support
- WebSocket for real-time updates

## Support & Maintenance

### Logging
- Winston logger for backend
- Console logging for frontend (dev mode)
- Error tracking integration ready
- Request/response logging

### Monitoring
- Health check endpoint: `/health`
- Uptime monitoring ready
- Performance metrics collection
- Error rate tracking

### Backup Strategy
- MongoDB automated backups
- Point-in-time recovery
- Data retention policies
- Disaster recovery plan

---

**Last Updated**: November 20, 2025
**Version**: 1.0.0
**Status**: Production Ready
