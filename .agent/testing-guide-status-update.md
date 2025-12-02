# Testing Guide: Book Status Update Fix

## Overview
This guide provides step-by-step instructions to test the fix for the book status update persistence bug.

## Prerequisites
- Application must be running (both frontend and backend)
- User must be logged in with appropriate permissions
- At least one book must exist in the inventory

## Test Cases

### Test Case 1: Basic Status Update
**Objective:** Verify that a simple status change persists after page refresh

**Steps:**
1. Navigate to the Inventory view
2. Locate any book in the list
3. Note the current status of the book
4. Click the edit button for that book
5. Change the status to a different value (e.g., from "For Evaluation" to "In Progress")
6. Click Save
7. Verify the success toast message appears
8. Press F5 to refresh the page
9. Locate the same book in the list
10. Verify the status shows the new value (not the original)

**Expected Result:** ✅ Status should persist after refresh

**Actual Result:** _____________

---

### Test Case 2: Multiple Sequential Updates
**Objective:** Verify that multiple status changes in succession all persist

**Steps:**
1. Navigate to the Inventory view
2. Select a book and note its current status
3. Edit the book and change status to "For Revision"
4. Save and verify success message
5. Immediately edit the same book again
6. Change status to "For ROR"
7. Save and verify success message
8. Refresh the page
9. Verify the status is "For ROR" (the last update)

**Expected Result:** ✅ Final status should be "For ROR"

**Actual Result:** _____________

---

### Test Case 3: All Status Values
**Objective:** Verify each status value can be saved successfully

**Steps:**
For each status value:
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
- RTP

1. Edit a book
2. Set the status to the value being tested
3. Save the changes
4. Refresh the page
5. Verify the status persisted

**Expected Result:** ✅ All status values should persist

**Actual Result:** _____________

---

### Test Case 4: Status Update with Other Fields
**Objective:** Verify status updates work when combined with other field changes

**Steps:**
1. Edit a book
2. Change the status to "In Progress"
3. Also change the title to add " (Updated)" at the end
4. Save the changes
5. Refresh the page
6. Verify both the status AND title changes persisted

**Expected Result:** ✅ Both status and title should be updated

**Actual Result:** _____________

---

### Test Case 5: Browser Console Verification
**Objective:** Verify the debugging logs are working correctly

**Steps:**
1. Open browser Developer Tools (F12)
2. Go to the Console tab
3. Edit a book and change its status
4. Save the changes
5. Look for the console log message: "Updating book with data:"
6. Verify the logged object contains the correct status value

**Expected Result:** ✅ Console should show the update data with correct status

**Actual Result:** _____________

---

### Test Case 6: Backend Logs Verification
**Objective:** Verify the backend is receiving and processing the update

**Steps:**
1. Access the backend console/logs
2. Edit a book in the frontend and change its status
3. Save the changes
4. Check the backend logs for:
   - "Attempting to update book [bookCode] with fields:"
   - "Database update completed for [bookCode]"
   - "Status changed: [oldStatus] -> [newStatus] for [bookCode]"

**Expected Result:** ✅ All three log messages should appear

**Actual Result:** _____________

---

### Test Case 7: Database Direct Verification
**Objective:** Verify the database is actually being updated

**Steps:**
1. Connect to the MongoDB database directly (using MongoDB Compass or CLI)
2. Note a book's current status in the database
3. Update that book's status in the application
4. Query the database again
5. Verify the `status` field has the new value
6. Verify the `updated_at` field has a new timestamp

**Expected Result:** ✅ Database should reflect the new status and timestamp

**Actual Result:** _____________

---

### Test Case 8: Concurrent Updates
**Objective:** Verify behavior when the same book is updated from multiple sessions

**Steps:**
1. Open the application in two different browser tabs (or browsers)
2. Log in to both
3. Navigate to the same book in both tabs
4. In Tab 1: Change status to "For Revision" and save
5. In Tab 2: Change status to "In Progress" and save
6. Refresh both tabs
7. Verify both tabs show "In Progress" (the last update)

**Expected Result:** ✅ Last update should win, both tabs should show same status

**Actual Result:** _____________

---

### Test Case 9: Network Error Handling
**Objective:** Verify proper error handling when update fails

**Steps:**
1. Open browser Developer Tools (F12)
2. Go to Network tab
3. Enable "Offline" mode
4. Try to update a book's status
5. Verify an error toast message appears
6. Disable "Offline" mode
7. Try the update again
8. Verify it now succeeds

**Expected Result:** ✅ Should show error when offline, success when online

**Actual Result:** _____________

---

### Test Case 10: Permission-Based Updates
**Objective:** Verify users can only update books they have permission for

**Steps:**
1. Log in as a user with restricted access (non-admin)
2. Try to update a book's status that the user has access to
3. Verify the update succeeds
4. Try to update a book's status that the user does NOT have access to
5. Verify the update is rejected with appropriate error

**Expected Result:** ✅ Updates should respect access control rules

**Actual Result:** _____________

---

## Debugging Checklist

If any test fails, check the following:

### Frontend Debugging
- [ ] Open browser console and check for errors
- [ ] Verify the "Updating book with data:" log appears
- [ ] Verify the logged data contains the `status` field
- [ ] Check Network tab for the PUT request to `/api/books/:bookCode`
- [ ] Verify the request payload includes the status field
- [ ] Check the response status code (should be 200)

### Backend Debugging
- [ ] Check backend console for error messages
- [ ] Verify "Attempting to update book" log appears
- [ ] Verify "Database update completed" log appears
- [ ] Check if the `updateFields` object includes the status
- [ ] Verify no database connection errors
- [ ] Check MongoDB logs for update queries

### Database Debugging
- [ ] Connect to MongoDB directly
- [ ] Query the book by book_code
- [ ] Verify the status field exists and has the correct type
- [ ] Check if there are any database constraints preventing the update
- [ ] Verify the `updated_at` timestamp changes after updates

## Success Criteria

The fix is considered successful if:
- ✅ All 10 test cases pass
- ✅ Frontend logs show correct data being sent
- ✅ Backend logs show database updates executing
- ✅ Database queries confirm data persistence
- ✅ No errors appear in console or logs

## Rollback Plan

If the fix causes issues:
1. Revert the changes to `src/services/bookService.ts`
2. Revert the changes to `backend/src/services/bookService.ts`
3. Restart both frontend and backend services
4. Document the issue for further investigation

## Notes

- Test with different user roles (admin, evaluator, regular user)
- Test with books that have remarks vs. books without remarks
- Test with new books vs. existing books
- Monitor performance impact of additional logging
- Consider removing debug logs after verification
