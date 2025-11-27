# Database Alignment Documentation

## Overview
This document outlines the database structure and alignment for the Evaluation Monitoring feature that was added to the Textbooks and Teacher's Manual Inventory system.

## Database Collections

### 1. Books Collection (Existing)
**Collection Name:** `books`

**Schema:**
```typescript
{
  book_code: string (unique, indexed)
  learning_area: string (indexed)
  grade_level: number (indexed)
  publisher: string
  title: string
  status: enum (indexed)
  is_new: boolean
  created_at: Date
  updated_at: Date
  created_by: string
  updated_by: string
}
```

### 2. Evaluation Monitoring Collection (New)
**Collection Name:** `evaluationmonitorings`

**Schema:**
```typescript
{
  book_code: string (unique, indexed)
  learning_area: string (indexed)
  evaluators: Array<Evaluator>
  event_name: string (optional, indexed)
  event_date: string (optional)
  created_at: Date
  updated_at: Date
  created_by: string
  updated_by: string
}
```

**Evaluator Sub-Schema:**
```typescript
{
  id: string
  name: string
  regionDivision: string
  designation: string
  contactNumber: string
  depedEmail: string
  areaOfSpecialization: string
  areasOfEvaluation: string[]
  hasTxAndTm: 'Yes' | 'No'
  individualUpload: 'Done' | 'Pending'
  teamUpload: 'Done' | 'Pending'
  txAndTmWithMarginalNotes: 'Done' | 'Pending'
  signedSummaryForm: 'Done' | 'Pending'
  clearance: 'Done' | 'Pending'
}
```

## API Endpoints

### Monitoring Endpoints

#### GET /api/monitoring
Fetch all monitoring entries (filtered by user access rules)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "bookCode": "25G1-S001",
      "learningArea": "Science",
      "evaluators": [...],
      "eventName": "Q4 Science Evaluation",
      "eventDate": "11/24/2025 - 12/15/2025"
    }
  ]
}
```

#### GET /api/monitoring/:bookCode
Get specific monitoring entry by book code

#### POST /api/monitoring
Create a new monitoring entry

**Request Body:**
```json
{
  "bookCode": "25G1-S001",
  "learningArea": "Science",
  "evaluators": [],
  "eventName": "Q4 Science Evaluation",
  "eventDate": "11/24/2025 - 12/15/2025"
}
```

#### POST /api/monitoring/bulk
Bulk create monitoring entries

**Request Body:**
```json
{
  "entries": [
    {
      "bookCode": "25G1-S001",
      "learningArea": "Science",
      "evaluators": [],
      "eventName": "Q4 Science Evaluation"
    },
    ...
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "results": [...],
    "errors": [
      {
        "bookCode": "25G1-S002",
        "error": "Monitoring entry already exists"
      }
    ]
  },
  "message": "Created 5 monitoring entries, 1 failed"
}
```

#### PUT /api/monitoring/:bookCode
Update monitoring entry

**Request Body:**
```json
{
  "bookCode": "25G1-S002",  // Can change book code
  "learningArea": "Science",
  "evaluators": [...],
  "eventName": "Updated Event Name",
  "eventDate": "12/01/2025"
}
```

#### DELETE /api/monitoring/:bookCode
Delete monitoring entry

## Data Flow

### Creating Monitoring Entries

1. **Frontend (Admin Access Page)**
   - User selects books from the inventory
   - Optionally adds event name and date range
   - Clicks "Add to Monitoring" or "Create Evaluation Event"

2. **API Call**
   - Frontend calls `monitoringApi.bulkCreate(entries)`
   - Sends array of monitoring entries to `/api/monitoring/bulk`

3. **Backend Processing**
   - Validates user permissions (access rules)
   - Checks if books exist in inventory
   - Checks for duplicate monitoring entries
   - Creates entries in database
   - Returns results and errors

4. **Frontend Update**
   - Shows success/error toast messages
   - Redirects to Monitoring view
   - Fetches updated monitoring data

### Updating Monitoring Entries

1. **Frontend (Monitoring Table)**
   - User clicks "Edit" button on monitoring entry
   - Modal opens with current book details
   - User can change book, event name, or event date

2. **API Call**
   - Frontend calls `monitoringApi.update(bookCode, updatedData)`
   - Sends updated data to `/api/monitoring/:bookCode`

3. **Backend Processing**
   - Validates user permissions
   - Checks if new book code is available (if changed)
   - Updates entry in database
   - Returns updated entry

4. **Frontend Update**
   - Refreshes monitoring data
   - Shows success toast

### Removing Monitoring Entries

1. **Frontend (Edit Modal)**
   - User clicks "Remove from Monitoring"
   - Confirmation dialog appears

2. **API Call**
   - Frontend calls `monitoringApi.delete(bookCode)`
   - Sends DELETE request to `/api/monitoring/:bookCode`

3. **Backend Processing**
   - Validates user permissions
   - Deletes entry from database

4. **Frontend Update**
   - Refreshes monitoring data
   - Shows success toast

## Access Control

### Permission Rules

1. **Admin Users** (`is_admin_access: true`)
   - Full access to all monitoring entries
   - Can create, update, and delete any entry

2. **Regular Users**
   - Access filtered by `access_rules`
   - Can only view/modify entries in their assigned learning areas
   - Example:
     ```json
     {
       "access_rules": [
         {
           "learning_areas": ["Science", "Mathematics"],
           "grade_levels": [1, 3]
         }
       ]
     }
     ```

3. **Super Admin** (wildcard access)
   - `access_rules` contains `learning_areas: ["*"]`
   - Full access to all learning areas

## Migration Steps

### Setting Up the Database

1. **Run Migration Script**
   ```bash
   cd backend
   npm run ts-node src/database/migrations/create-monitoring-collection.ts
   ```

2. **Verify Collection**
   ```bash
   mongosh
   use textbooks_inventory
   db.evaluationmonitorings.getIndexes()
   ```

3. **Expected Indexes:**
   - `book_code` (unique)
   - `learning_area`
   - `event_name`

### Data Migration (If Needed)

If you have existing monitoring data in the frontend state that needs to be migrated:

1. Export current monitoring data from frontend
2. Use the bulk create endpoint to import
3. Verify data integrity

## Frontend-Backend Alignment

### Field Name Mapping

| Frontend (camelCase) | Backend (snake_case) |
|---------------------|---------------------|
| bookCode            | book_code           |
| learningArea        | learning_area       |
| eventName           | event_name          |
| eventDate           | event_date          |
| createdAt           | created_at          |
| updatedAt           | updated_at          |

### Transformation Functions

**Frontend Service** (`src/services/monitoringService.ts`):
- `transformMonitoringFromBackend()` - Converts snake_case to camelCase
- `transformMonitoringToBackend()` - Converts camelCase to snake_case

## Testing

### Manual Testing Checklist

- [ ] Create monitoring entry from Admin Access page
- [ ] View monitoring entries in Monitoring view
- [ ] Edit monitoring entry (change book)
- [ ] Edit monitoring entry (change event details)
- [ ] Remove monitoring entry
- [ ] Bulk create multiple entries
- [ ] Test access control (regular user)
- [ ] Test access control (admin user)
- [ ] Verify data persistence after page refresh
- [ ] Test error handling (duplicate entries)
- [ ] Test error handling (non-existent books)

### API Testing

Use tools like Postman or curl to test endpoints:

```bash
# Get all monitoring entries
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/monitoring

# Create monitoring entry
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"bookCode":"25G1-S001","learningArea":"Science"}' \
  http://localhost:3000/api/monitoring

# Update monitoring entry
curl -X PUT \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"eventName":"Updated Event"}' \
  http://localhost:3000/api/monitoring/25G1-S001

# Delete monitoring entry
curl -X DELETE \
  -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/monitoring/25G1-S001
```

## Troubleshooting

### Common Issues

1. **"Monitoring entry already exists"**
   - Check if book is already in monitoring
   - Use update endpoint instead of create

2. **"Book not found"**
   - Verify book exists in inventory
   - Check book code spelling

3. **"Unauthorized" errors**
   - Verify user access rules
   - Check if user has permission for learning area

4. **Data not persisting**
   - Check MongoDB connection
   - Verify collection was created
   - Check server logs for errors

### Debug Commands

```bash
# Check MongoDB connection
mongosh
use textbooks_inventory
db.evaluationmonitorings.find().pretty()

# Check backend logs
cd backend
npm run dev
# Watch for errors in console

# Check frontend network requests
# Open browser DevTools > Network tab
# Filter by "monitoring"
```

## Future Enhancements

1. **Event Management**
   - Dedicated events collection
   - Link multiple books to single event
   - Event templates

2. **Evaluator Pool**
   - Dedicated evaluators collection
   - Reusable evaluator profiles
   - Assignment history

3. **Progress Tracking**
   - Automated progress calculations
   - Deadline tracking
   - Notification system

4. **Reporting**
   - Export monitoring reports
   - Progress analytics
   - Evaluator performance metrics
