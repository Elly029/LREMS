# Facilitator Access Rules - LR-EMS

## Overview
This document outlines the access control rules for all facilitators in the Learning Resource Evaluation and Management System (LR-EMS). Each facilitator has been assigned specific learning areas and/or grade levels they can access.

---

## Facilitator Access Rules

### 📚 Subject-Specific Facilitators

#### 1. **Celso**
- **Learning Areas**: MATH, TLE, EPP
- **Grade Levels**: All (1-12)
- **Description**: Handles Mathematics, Technology and Livelihood Education, and Edukasyon sa Paghahanapbuhay at Pang-kabuhayan materials across all grade levels

#### 2. **Mak**
- **Learning Areas**: English, Reading & Literature
- **Grade Levels**: All (1-12)
- **Description**: Manages English language and Reading & Literature materials for all grades

#### 3. **Rhod**
- **Learning Areas**: Values Education, GMRC
- **Grade Levels**: All (1-12)
- **Description**: Oversees Values Education and Good Manners and Right Conduct (GMRC) materials across all grade levels

#### 4. **Ven**
- **Learning Areas**: GMRC
- **Grade Levels**: All (1-12)
- **Description**: Focuses exclusively on Good Manners and Right Conduct (GMRC) materials for all grades

#### 5. **Micah**
- **Learning Areas**: AP, MAKABANSA
- **Grade Levels**: All (1-12)
- **Description**: Handles Araling Panlipunan (AP) and MAKABANSA materials across all grade levels

#### 6. **Leo**
- **Learning Areas**: Science
- **Grade Levels**: All (1-12)
- **Description**: Manages Science materials for all grade levels

#### 7. **Rejoice**
- **Learning Areas**: Language, Filipino
- **Grade Levels**: All (1-12)
- **Description**: Oversees Language and Filipino materials across all grade levels

---

### 🎓 Grade-Specific Facilitators

#### 8. **JC**
- **Learning Areas**: All (*)
- **Grade Levels**: 1, 3 only
- **Description**: Has access to ALL learning areas but ONLY for Grades 1 and 3
- **Special Note**: Can see books from any subject area as long as they are for Grade 1 or Grade 3

#### 9. **Nonie**
- **Learning Areas**: All (*)
- **Grade Levels**: 1, 3 only
- **Description**: Has access to ALL learning areas but ONLY for Grades 1 and 3
- **Special Note**: Can see books from any subject area as long as they are for Grade 1 or Grade 3

---

## Access Control Matrix

| Facilitator | MATH | TLE | EPP | English | Reading & Lit | Values Ed | GMRC | AP | MAKABANSA | Science | Language | Filipino | Grade Levels |
|-------------|------|-----|-----|---------|---------------|-----------|------|----|-----------|---------| ---------|----------|--------------|
| **Celso**   | ✅   | ✅  | ✅  | ❌      | ❌            | ❌        | ❌   | ❌ | ❌        | ❌      | ❌       | ❌       | All          |
| **Mak**     | ❌   | ❌  | ❌  | ✅      | ✅            | ❌        | ❌   | ❌ | ❌        | ❌      | ❌       | ❌       | All          |
| **Rhod**    | ❌   | ❌  | ❌  | ❌      | ❌            | ✅        | ✅   | ❌ | ❌        | ❌      | ❌       | ❌       | All          |
| **Ven**     | ❌   | ❌  | ❌  | ❌      | ❌            | ❌        | ✅   | ❌ | ❌        | ❌      | ❌       | ❌       | All          |
| **Micah**   | ❌   | ❌  | ❌  | ❌      | ❌            | ❌        | ❌   | ✅ | ✅        | ❌      | ❌       | ❌       | All          |
| **Leo**     | ❌   | ❌  | ❌  | ❌      | ❌            | ❌        | ❌   | ❌ | ❌        | ✅      | ❌       | ❌       | All          |
| **Rejoice** | ❌   | ❌  | ❌  | ❌      | ❌            | ❌        | ❌   | ❌ | ❌        | ❌      | ✅       | ✅       | All          |
| **JC**      | ✅   | ✅  | ✅  | ✅      | ✅            | ✅        | ✅   | ✅ | ✅        | ✅      | ✅       | ✅       | **1, 3 only**|
| **Nonie**   | ✅   | ✅  | ✅  | ✅      | ✅            | ✅        | ✅   | ✅ | ✅        | ✅      | ✅       | ✅       | **1, 3 only**|

---

## How Access Control Works

### For Subject-Specific Facilitators (Celso, Mak, Rhod, Ven, Micah, Leo, Rejoice)

When these users log in, they will:
- ✅ **See** books only in their assigned learning areas
- ✅ **Access** all grade levels (1-12) within their assigned areas
- ❌ **Not see** books from other learning areas
- ✅ **Can** add, edit, and manage books in their assigned areas
- ✅ **Can** add remarks and monitor books in their assigned areas

**Example**: 
- **Celso** logs in → sees only MATH, TLE, and EPP books across all grades
- **Leo** logs in → sees only Science books across all grades

### For Grade-Specific Facilitators (JC, Nonie)

When these users log in, they will:
- ✅ **See** books from ALL learning areas
- ✅ **Access** ONLY Grade 1 and Grade 3 books
- ❌ **Not see** books from other grade levels (2, 4-12)
- ✅ **Can** add, edit, and manage books for Grades 1 and 3 only
- ✅ **Can** add remarks and monitor books for Grades 1 and 3

**Example**: 
- **JC** logs in → sees MATH, Science, English, Filipino, etc., but ONLY for Grades 1 and 3
- **Nonie** logs in → sees all subjects but ONLY for Grades 1 and 3

---

## Database Structure

Access rules are stored in the `users` collection with the following structure:

```json
{
  "username": "celso",
  "name": "Celso",
  "access_rules": [
    {
      "learning_areas": ["MATH", "TLE", "EPP"],
      "grade_levels": []  // Empty array means all grade levels
    }
  ],
  "is_admin_access": false
}
```

For grade-specific access (JC and Nonie):

```json
{
  "username": "jc",
  "name": "JC",
  "access_rules": [
    {
      "learning_areas": ["*"],  // Asterisk means all learning areas
      "grade_levels": [1, 3]    // Specific grade levels only
    }
  ],
  "is_admin_access": false
}
```

---

## Backend Implementation

The backend enforces these access rules in:

### 1. **Book Filtering** (`bookService.ts`)
```typescript
private validateAccess(user: IUser, learningArea: string, gradeLevel: number): boolean {
  if (!user || !user.access_rules || user.access_rules.length === 0) {
    return false;
  }

  for (const rule of user.access_rules) {
    const areaMatch = rule.learning_areas.includes('*') || 
                      rule.learning_areas.includes(learningArea);
    const gradeMatch = !rule.grade_levels || 
                       rule.grade_levels.length === 0 || 
                       rule.grade_levels.includes(gradeLevel);

    if (areaMatch && gradeMatch) return true;
  }
  return false;
}
```

### 2. **Monitoring Access** (`evaluationMonitoringService.ts`)
- Filters monitoring entries based on user's learning area access
- Ensures users only see monitoring data for their assigned areas/grades

### 3. **API Endpoints**
- `GET /api/books` - Automatically filters books based on user's access rules
- `GET /api/monitoring` - Filters monitoring entries based on access rules

---

## Testing Access Rules

### Test Cases

#### Test 1: Celso's Access
1. Log in as `celso`
2. Navigate to Inventory
3. **Expected**: See only MATH, TLE, and EPP books (all grades)
4. **Expected**: Cannot see English, Science, Filipino, etc.

#### Test 2: JC's Access
1. Log in as `jc`
2. Navigate to Inventory
3. **Expected**: See books from ALL subjects
4. **Expected**: See ONLY Grade 1 and Grade 3 books
5. **Expected**: Cannot see Grade 2, 4, 5, etc.

#### Test 3: Leo's Access
1. Log in as `leo`
2. Navigate to Inventory
3. **Expected**: See only Science books (all grades)
4. **Expected**: Cannot see any other subject

#### Test 4: Filtering
1. Log in as any facilitator
2. Apply filters (status, publisher, etc.)
3. **Expected**: Filters work within their access scope
4. **Expected**: Still cannot see books outside their access

---

## Admin Override

**Administrators** (users with `is_admin_access: true`) have:
- ✅ Full access to ALL learning areas
- ✅ Full access to ALL grade levels
- ✅ Can see and manage all books regardless of access rules
- ✅ Can modify access rules for other users

---

## Updating Access Rules

To update access rules, use the script:

```bash
cd backend
npx ts-node scripts/update-facilitator-access.ts
```

Or manually update in MongoDB:

```javascript
db.users.updateOne(
  { username: "celso" },
  { 
    $set: { 
      access_rules: [
        {
          learning_areas: ["MATH", "TLE", "EPP"],
          grade_levels: []
        }
      ]
    }
  }
)
```

---

## Important Notes

1. **Session Refresh Required**: After updating access rules, users must log out and log back in for changes to take effect

2. **Empty Grade Levels Array**: An empty `grade_levels` array means the user has access to ALL grade levels

3. **Wildcard Learning Areas**: The `*` in `learning_areas` means access to ALL learning areas

4. **Multiple Rules**: A user can have multiple access rules, and access is granted if ANY rule matches

5. **No Access**: If a user has an empty `access_rules` array and `is_admin_access: false`, they will see NO books

---

## Troubleshooting

### User sees no books
- Check if `access_rules` array is empty
- Verify learning area names match exactly (case-sensitive)
- Ensure user has logged out and back in after rule changes

### User sees wrong books
- Verify the learning area names in database match book data
- Check for typos in learning area names
- Confirm grade levels are correct

### Access rule not working
- Check backend logs for access validation
- Verify MongoDB connection
- Ensure frontend is sending correct user token

---

**Last Updated**: December 2, 2025  
**Script Used**: `backend/scripts/update-facilitator-access.ts`  
**Status**: ✅ All 9 facilitators updated successfully
