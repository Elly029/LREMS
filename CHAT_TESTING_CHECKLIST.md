# Chat Feature - Testing Checklist

## Pre-Testing Setup

- [ ] Backend server is running
- [ ] Frontend development server is running  
- [ ] MongoDB is connected
- [ ] At least 3 test users are available:
  - [ ] 1 Admin user
  - [ ] 2 Evaluator/regular users

---

## Test Scenario 1: Chat Button Visibility

### For Admin User:
- [ ] Login as admin user
- [ ] Chat button appears in bottom-right corner
- [ ] Chat button shows correct icon (speech bubble)
- [ ] Unread count badge shows (if there are unread messages)

### For Evaluator User:
- [ ] Login as evaluator user
- [ ] Chat button appears in bottom-right corner
- [ ] Chat button shows correct icon
- [ ] Unread count badge shows (if applicable)

### For Regular User:
- [ ] Login as regular user
- [ ] Chat button appears in bottom-right corner
- [ ] Chat button shows correct icon
- [ ] Unread count badge shows (if applicable)

**Expected Result**: ✅ Chat button visible for ALL user types

---

## Test Scenario 2: Opening Chat Panel

- [ ] Click chat button
- [ ] Chat panel opens as modal overlay
- [ ] Dark backdrop appears behind panel
- [ ] Panel shows "Messages" header
- [ ] "New Chat" and "New Group" buttons appear
- [ ] Close button (X) appears in top-right
- [ ] Conversations list area is visible (may be empty)

**Expected Result**: ✅ Chat panel opens correctly with all UI elements visible

---

## Test Scenario 3: Creating Direct Message

### As User 1 (Admin):
- [ ] Click "New Chat" button
- [ ] User list appears
- [ ] Search box is functional
- [ ] Other users appear in list
- [ ] Each user shows: name, username, role badge
- [ ] Click on User 2 (Evaluator)
- [ ] Conversation opens
- [ ] Input field appears at bottom
- [ ] Type a message: "Hello, this is a test message"
- [ ] Press Enter or click Send
- [ ] Message appears in chat (blue bubble on right)
- [ ] Timestamp shows below message

### As User 2 (Evaluator):
- [ ] Login as User 2
- [ ] Open chat panel
- [ ] Conversation with User 1 appears in list
- [ ] Unread badge shows "1"
- [ ] Click on conversation
- [ ] Message from User 1 appears (gray bubble on left)
- [ ] Sender name "User 1" shows above message
- [ ] Role badge shows "admin"
- [ ] Reply with: "Hi, I received your message"
- [ ] Message sends successfully
- [ ] Unread count clears

### Verify on User 1:
- [ ] Message from User 2 appears automatically (or within 5 seconds)
- [ ] Conversation shows in list
- [ ] Last message preview shows in conversation list

**Expected Result**: ✅ Direct messaging works bidirectionally

---

## Test Scenario 4: Creating Group Chat

### As User 1 (Admin):
- [ ] Open chat panel
- [ ] Click "New Group"
- [ ] Enter group name: "Test Group Chat"
- [ ] Search for User 2
- [ ] Click User 2 (appears in selected users with green tag)
- [ ] Search for User 3
- [ ] Click User 3 (appears in selected users)
- [ ] Button shows "Create Group (2 members)"
- [ ] Click "Create Group"
- [ ] Group conversation opens
- [ ] Header shows "Test Group Chat"
- [ ] Subtitle shows "3 members"
- [ ] System message appears: "User 1 created the group..."
- [ ] Send message: "Welcome everyone to the group!"

### As User 2:
- [ ] Open chat panel
- [ ] "Test Group Chat" appears in conversations list
- [ ] Green icon and green background indicate group chat
- [ ] Badge says "Group"
- [ ] Unread count shows
- [ ] Click on group
- [ ] All messages visible (system message + welcome message)
- [ ] Send message: "Thanks for adding me!"

### As User 3:
- [ ] Open chat panel
- [ ] "Test Group Chat" appears
- [ ] All previous messages visible
- [ ] Send message: "Hello everyone!"

### Verify on All Users:
- [ ] All 3 messages appear for everyone
- [ ] Messages show sender names
- [ ] Role badges display correctly
- [ ] Timestamps are correct

**Expected Result**: ✅ Group chat works with multiple participants

---

## Test Scenario 5: Admin Broadcast Feature

### Verify Broadcast Button Visibility:
- [ ] Login as Admin - "📢 Broadcast Message" button IS visible
- [ ] Login as Evaluator - "📢 Broadcast Message" button NOT visible
- [ ] Login as User - "📢 Broadcast Message" button NOT visible

### Send Broadcast to Everyone:
- [ ] Login as Admin
- [ ] Click "📢 Broadcast Message"
- [ ] Target audience buttons appear: Everyone, Evaluators, Admins
- [ ] "Everyone" is selected by default
- [ ] Type message: "This is a broadcast to all users"
- [ ] Click Send
- [ ] Success (view returns to conversations or confirmation shown)

### Verify Reception:
- [ ] Login as Admin (different admin if available)
- [ ] Broadcast appears in conversations
- [ ] Purple icon and "Broadcast" badge visible
- [ ] Message content is correct
- [ ] Title shows "Broadcast from [Admin name]"

- [ ] Login as Evaluator
- [ ] Broadcast appears in conversations
- [ ] Message is readable

- [ ] Login as Regular User
- [ ] Broadcast appears in conversations
- [ ] Message is readable

### Broadcast to Evaluators Only:
- [ ] Login as Admin
- [ ] Click "📢 Broadcast Message"
- [ ] Select "Evaluators"
- [ ] Type message: "This is for evaluators only"
- [ ] Send
- [ ] Verify Evaluators receive it
- [ ] Verify Admin does NOT receive it (check own conversations)
- [ ] Verify Regular users do NOT receive it

### Broadcast to Admins Only:
- [ ] Login as Admin
- [ ] Click "📢 Broadcast Message"
- [ ] Select "Admins"
- [ ] Type message: "Admin-only announcement"
- [ ] Send
- [ ] Verify Admins receive it
- [ ] Verify Evaluators do NOT receive it
- [ ] Verify Regular users do NOT receive it

**Expected Result**: ✅ Broadcasts work correctly with proper targeting

---

## Test Scenario 6: Unread Message Counts

### Setup:
- [ ] User 1 sends message to User 2 (direct)
- [ ] User 1 sends message in Test Group

### As User 2 (before reading):
- [ ] Chat button shows unread badge
- [ ] Number matches total unread count
- [ ] Direct conversation shows unread badge
- [ ] Group conversation shows unread badge

### Click on Direct Conversation:
- [ ] Messages load
- [ ] Unread badge clears from conversation
- [ ] Chat button badge updates (decreases by number of messages read)

### Click on Group Conversation:
- [ ] Messages load
- [ ] Unread badge clears from conversation
- [ ] Chat button badge updates

### After Reading All:
- [ ] Chat button unread badge disappears or shows "0"
- [ ] All conversation unread badges are clear

**Expected Result**: ✅ Unread counts update correctly

---

## Test Scenario 7: Real-Time Updates

### Setup Two Browser Windows:
- [ ] Window A: Login as User 1
- [ ] Window B: Login as User 2
- [ ] Both: Open chat panel
- [ ] Both: Open same direct conversation

### Send from Window A:
- [ ] Type message in Window A
- [ ] Send message
- [ ] Message appears immediately in Window A

### Verify Window B:
- [ ] Wait up to 5 seconds
- [ ] Message from Window A appears automatically
- [ ] No manual refresh needed

### Send from Window B:
- [ ] Type reply in Window B
- [ ] Send message
- [ ] Message appears in Window B

### Verify Window A:
- [ ] Wait up to 5 seconds
- [ ] Message from Window B appears

**Expected Result**: ✅ Messages update in real-time (5s polling)

---

## Test Scenario 8: Search Functionality

### In "New Chat":
- [ ] Click "New Chat"
- [ ] Search box is empty
- [ ] All users appear
- [ ] Type first name of a user
- [ ] List filters to match
- [ ] Type username
- [ ] List filters correctly
- [ ] Clear search
- [ ] All users appear again

### In "New Group":
- [ ] Click "New Group"
- [ ] Same search behavior as above
-  [ ] Selected users remain selected when searching

**Expected Result**: ✅ Search filters users correctly

---

## Test Scenario 9: UI/UX Elements

### Visual Indicators:
- [ ] Direct chat: Blue icon, blue background
- [ ] Group chat: Green icon, green background
- [ ] Broadcast: Purple icon, purple background

### Role Badges:
- [ ] Admin: Purple background
- [ ] Evaluator: Blue background
- [ ] User: Gray background

### Message Bubbles:
- [ ] Own messages: Blue, right-aligned
- [ ] Others' messages: Gray, left-aligned

### Conversation List:
- [ ] Shows last message preview
- [ ] Shows conversation type badge
- [ ] Shows unread count if > 0
- [ ] Sorted by most recent

### Auto-Scroll:
- [ ] Opening conversation scrolls to bottom
- [ ] New messages auto-scroll to bottom
- [ ] Smooth scroll animation

**Expected Result**: ✅ All visual elements match spec

---

## Test Scenario 10: Error Handling

### Empty Message:
- [ ] Try sending empty message
- [ ] Send button is disabled
- [ ] Nothing happens

### Network Error Simulation:
- [ ] Disconnect network
- [ ] Try sending message
- [ ] Check browser console for error
- [ ] Reconnect network
- [ ] Verify recovery

### Invalid Conversation:
- [ ] Manually navigate to invalid conversation ID
- [ ] Error is handled gracefully
- [ ] User can return to conversation list

**Expected Result**: ✅ Errors are handled gracefully

---

## Test Scenario 11: Persistence

### Send Messages:
- [ ] User 1 sends several messages
- [ ] User 2 replies

### Refresh Browser:
- [ ] Hard refresh page (Ctrl+Shift+R)
- [ ] Login again if needed
- [ ] Open chat
- [ ] All conversations still present
- [ ] All messages still visible
- [ ] Unread counts persist correctly

### Logout and Login:
- [ ] Logout
- [ ] Login as same user
- [ ] Open chat
- [ ] Conversations and messages persist

**Expected Result**: ✅ All data persists correctly

---

## Test Scenario 12: Multiple Conversations

### Create Multiple Chats:
- [ ] User 1: Create 3 different direct chats
- [ ] User 1: Create 2 different group chats
- [ ] User 1: Participate in 1 broadcast

### Verify Conversation List:
- [ ] All 6 conversations appear
- [ ] Sorted by most recent activity
- [ ] Can identify each type by icon/badge
- [ ] Can  select and view each one
- [ ] Active conversation highlighted

### Switch Between Conversations:
- [ ] Click different conversations
- [ ] Previous conversation closes
- [ ] New conversation loads
- [ ] Messages display correctly
- [ ] Input field works in each

**Expected Result**: ✅ Multiple conversations work smoothly

---

## Test Scenario 13: Close and Reopen

### While Chatting:
- [ ] Open chat panel
- [ ] Start conversation
- [ ] Click X to close
- [ ] Panel closes completely
- [ ] Backdrop disappears
- [ ] Click chat button again
- [ ] Panel reopens
- [ ] Last viewed conversation still selected
- [ ] Can continue chatting

**Expected Result**: ✅ Panel opens/closes cleanly

---

## Test Scenario 14: Mobile Responsiveness

### Resize Browser:
- [ ] Open chat in full desktop view
- [ ] Resize to tablet width (~768px)
- [ ] Panel adjusts size
- [ ] All features remain functional

- [ ] Resize to mobile width (~375px)
- [ ] Panel fills screen appropriately
- [ ] Sidebar and message view stack properly
- [ ] "Back" button appears on mobile
- [ ] Touch targets are adequate

**Expected Result**: ✅ Responsive design works

---

## Test Scenario 15: Performance

### Load Test:
- [ ] Create group with 5+ members
- [ ] Send 20+ messages in quick succession
- [ ] Interface remains responsive
- [ ] Messages appear correctly
- [ ] Scroll performance is smooth

### Long Message:
- [ ] Send very long message (500+ characters)
- [ ] Message displays completely
- [ ] Bubble wraps text properly
- [ ] Scroll works

### Many Conversations:
- [ ] Have 10+ active conversations
- [ ] Conversation list scrolls smoothly
- [ ] Can find and select any conversation
- [ ] Performance is acceptable

**Expected Result**: ✅ Acceptable performance under load

---

## Bugs Found

Use this section to document any bugs discovered during testing:

### Bug Template:
```
**Bug #**: [number]
**Severity**: [Critical/High/Medium/Low]
**Component**: [Chat Button/Panel/Direct Message/Group/Broadcast/etc.]
**Description**: [What happened]
**Steps to Reproduce**:
1. 
2. 
3. 
**Expected**: [What should happen]
**Actual**: [What actually happened]
**Browser**: [Chrome/Firefox/Safari/Edge + version]
**User Type**: [Admin/Evaluator/User]
```

---

## Testing Summary

- **Total Test Cases**: 15 scenarios
- **Tests Passed**: _____ / 15
- **Tests Failed**: _____ / 15
- **Bugs Found**: _____
- **Critical Bugs**: _____
- **Blocker Issues**: _____

### Sign-Off:
- **Tester Name**: _____________________
- **Date**: _____________________
- **Status**: [ ] Approved [ ] Needs Fixes
- **Notes**: _____________________

---

## Next Steps

After successful testing:
1. [ ] Document any bugs found
2. [ ] Create tickets for fixes needed
3. [ ] Retest after bug fixes
4. [ ] Update user documentation if needed
5. [ ] Deploy to production
6. [ ] Monitor for issues
7. [ ] Gather user feedback

---

**Test Environment**:
- Backend URL: _____________________
- Frontend URL: _____________________
- Database: _____________________
- Branch/Commit: _____________________
