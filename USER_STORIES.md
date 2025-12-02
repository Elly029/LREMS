# User Stories - Learning Resource Evaluation and Management System (LR-EMS)

## Overview
This document outlines the user stories for the three primary user roles in the LR-EMS web application: **Facilitators**, **Evaluators**, and **Administrators**.

---

## 1. FACILITATORS (Learning Resource Facilitators)

### Role Description
Facilitators are DepEd staff members responsible for managing the day-to-day operations of learning resource evaluation. They coordinate between publishers, evaluators, and administrators to ensure smooth processing of textbooks and teacher's manuals.

### User Stories

#### Book Management
**As a Facilitator, I want to:**

1. **Add New Learning Resources**
   - Add new textbooks and teacher's manuals to the inventory
   - Specify book details: code, title, publisher, learning area, grade level, and status
   - Add initial remarks when creating a book entry
   - **So that** I can track all submitted materials from publishers

2. **Update Book Information**
   - Edit book details when information changes
   - Update the status as books move through the evaluation workflow
   - Modify publisher information if corrections are needed
   - **So that** the inventory reflects accurate, up-to-date information

3. **Track Book Status**
   - View books in different workflow stages (For Evaluation, For Revision, For ROR, etc.)
   - Filter books by status to see what needs attention
   - Monitor books that are "NOT FOUND" or "RETURNED"
   - **So that** I can prioritize my work and follow up on delayed items

4. **Delete Obsolete Entries**
   - Remove books that were entered in error
   - Delete duplicate entries
   - **So that** the inventory remains clean and accurate

#### Remarks & Documentation
**As a Facilitator, I want to:**

5. **Add Detailed Remarks**
   - Add timestamped notes to any book
   - Include information about who sent/received the book
   - Track delay days (DepEd and Publisher delays)
   - Record status changes and important dates
   - **So that** there's a complete audit trail of each book's journey

6. **View Remark History**
   - See all remarks for a book in chronological order
   - Identify who added each remark and when
   - Track the complete communication history
   - **So that** I can understand the full context of any book's status

7. **Edit Existing Remarks**
   - Correct typos or update information in remarks
   - Add missing details to previous remarks
   - **So that** documentation remains accurate and complete

#### Search & Filtering
**As a Facilitator, I want to:**

8. **Search Across All Fields**
   - Search by book code, title, publisher, or remark content
   - Get instant results as I type
   - **So that** I can quickly find specific books

9. **Filter by Multiple Criteria**
   - Filter by status (single or multiple statuses)
   - Filter by learning area (Math, Science, English, etc.)
   - Filter by grade level (1-12)
   - Filter by publisher
   - Filter books that have remarks
   - **So that** I can focus on specific subsets of books

10. **Save Filter Preferences**
    - Have my filters persist during my session
    - Return to the same filtered view after navigating away
    - **So that** I don't have to re-apply filters repeatedly

#### Monitoring & Evaluation
**As a Facilitator, I want to:**

11. **Create Evaluation Events**
    - Set up new evaluation events with names and dates
    - Select multiple books to include in an evaluation
    - **So that** I can organize evaluation activities efficiently

12. **Add Books to Monitoring**
    - Add books to the monitoring system for tracking
    - Assign evaluators to specific books
    - Set event names and dates for monitoring items
    - **So that** I can track which evaluators are working on which materials

13. **Update Monitoring Information**
    - Change assigned evaluators
    - Update event names and dates
    - Modify book assignments
    - **So that** monitoring information stays current

14. **Remove Books from Monitoring**
    - Remove completed evaluations from active monitoring
    - Clean up cancelled or obsolete monitoring entries
    - **So that** the monitoring list shows only active items

#### Communication
**As a Facilitator, I want to:**

15. **Chat with Evaluators**
    - Send direct messages to individual evaluators
    - Create group conversations for specific evaluations
    - Send broadcast messages to all evaluators
    - Receive notifications of unread messages
    - **So that** I can coordinate effectively with the evaluation team

16. **View Evaluator Profiles**
    - See which evaluators are available
    - View evaluator specializations and contact information
    - Check evaluator workload and assignments
    - **So that** I can make informed assignment decisions

#### Reporting & Export
**As a Facilitator, I want to:**

17. **Export Data**
    - Export filtered book lists to Excel
    - Generate PDF reports of current inventory
    - Export monitoring data for reporting
    - **So that** I can share information with stakeholders

18. **View Analytics**
    - See status distribution charts
    - View statistics by learning area and grade level
    - Track completion rates and timelines
    - **So that** I can report on progress and identify bottlenecks

#### Access Control
**As a Facilitator, I want to:**

19. **Access Assigned Learning Areas**
    - View only books in my assigned learning areas (if restricted)
    - See all books if I have full facilitator access
    - **So that** I focus on my area of responsibility

20. **Change My Password**
    - Update my password for security
    - **So that** I can maintain account security

---

## 2. EVALUATORS (Learning Resource Evaluators)

### Role Description
Evaluators are subject matter experts who review and assess textbooks and teacher's manuals for quality, accuracy, and alignment with curriculum standards. They provide detailed feedback and recommendations.

### User Stories

#### Dashboard & Overview
**As an Evaluator, I want to:**

1. **View My Assigned Materials**
   - See a dashboard of all books assigned to me
   - View materials organized by evaluation event
   - See upcoming deadlines and priorities
   - **So that** I know what work I need to complete

2. **Access Evaluator Dashboard**
   - Have a dedicated dashboard showing my assignments
   - See my workload at a glance
   - View evaluation events I'm participating in
   - **So that** I can manage my evaluation responsibilities efficiently

3. **Take a Guided Tour**
   - Access an onboarding tour when I first log in
   - Learn how to use the evaluator dashboard
   - Understand my role and responsibilities
   - **So that** I can start working quickly and confidently

#### Book Review
**As an Evaluator, I want to:**

4. **View Book Details**
   - See complete information about assigned books
   - View publisher information and book specifications
   - Read the current status and history
   - **So that** I have all necessary context for evaluation

5. **Read Remark History**
   - View all previous remarks and feedback
   - See what other evaluators have noted
   - Understand the book's evaluation journey
   - **So that** I can provide informed, comprehensive feedback

6. **Add Evaluation Remarks**
   - Add detailed remarks about my evaluation findings
   - Note specific issues or recommendations
   - Record dates and status changes
   - **So that** my feedback is documented and actionable

7. **Track My Evaluations**
   - See which books I've completed
   - View which books are still pending
   - Monitor my progress on evaluation events
   - **So that** I can manage my workload and meet deadlines

#### Filtering & Search
**As an Evaluator, I want to:**

8. **Filter My Assignments**
   - Filter by evaluation event
   - Filter by learning area
   - Filter by status (pending, completed, etc.)
   - **So that** I can focus on specific evaluation tasks

9. **Search My Materials**
   - Search within my assigned books
   - Find specific titles or publishers quickly
   - **So that** I can locate materials efficiently

#### Communication
**As an Evaluator, I want to:**

10. **Chat with Facilitators**
    - Send messages to facilitators about questions or issues
    - Participate in group discussions about evaluations
    - Receive messages about new assignments or updates
    - **So that** I can get clarification and coordinate effectively

11. **Chat with Other Evaluators**
    - Discuss evaluation approaches with peers
    - Share insights about common issues
    - Collaborate on multi-evaluator assignments
    - **So that** I can benefit from collective expertise

12. **Receive Notifications**
    - Get notified of new assignments
    - Receive alerts about deadline changes
    - See unread message counts
    - **So that** I stay informed and responsive

#### Profile Management
**As an Evaluator, I want to:**

13. **View My Profile**
    - See my evaluator information
    - View my specializations and areas of expertise
    - Check my contact information
    - **So that** I can verify my profile is accurate

14. **Edit My Profile**
    - Update my contact information
    - Modify my areas of expertise
    - Change my availability status
    - **So that** my profile reflects current information

15. **Change My Password**
    - Update my password for security
    - **So that** I can maintain account security

#### Access Control
**As an Evaluator, I want to:**

16. **See Only My Assignments**
    - View only books assigned to me
    - Not see materials assigned to other evaluators
    - **So that** I can focus on my specific responsibilities

17. **Access Monitoring Information**
    - View evaluation events I'm part of
    - See other evaluators on the same event (if applicable)
    - **So that** I understand the broader evaluation context

---

## 3. ADMINISTRATORS

### Role Description
Administrators have full system access and are responsible for overall system management, user administration, data integrity, and system configuration. They oversee the entire learning resource evaluation process.

### User Stories

#### System Overview
**As an Administrator, I want to:**

1. **View All System Data**
   - Access all books regardless of learning area or grade level
   - View all monitoring entries and evaluation events
   - See all user accounts and evaluator profiles
   - **So that** I have complete visibility into system operations

2. **Access All Views**
   - Switch between Inventory, Monitoring, Admin, and Analytics views
   - Access the Evaluators management section
   - View the Create Evaluation Event interface
   - **So that** I can manage all aspects of the system

3. **View System Analytics**
   - See comprehensive status distribution charts
   - View statistics across all learning areas and grade levels
   - Track system-wide completion rates and timelines
   - Monitor user activity and system usage
   - **So that** I can make data-driven decisions and report to leadership

#### Book Management (Full Access)
**As an Administrator, I want to:**

4. **Manage All Books**
   - Create, read, update, and delete any book
   - Bulk import books from Excel files
   - Bulk update book statuses or information
   - **So that** I can maintain the complete inventory

5. **Override Access Rules**
   - View and edit books in all learning areas
   - Access books regardless of grade level restrictions
   - **So that** I can handle exceptions and special cases

6. **Manage Book Workflow**
   - Move books through workflow stages
   - Handle special status cases (NOT FOUND, RETURNED, etc.)
   - Resolve data conflicts or duplicates
   - **So that** the evaluation process runs smoothly

#### User & Evaluator Management
**As an Administrator, I want to:**

7. **Create User Accounts**
   - Add new facilitator accounts
   - Create evaluator user accounts
   - Set initial passwords
   - **So that** new staff can access the system

8. **Manage User Access Rules**
   - Define which learning areas a user can access
   - Set grade level restrictions
   - Grant or revoke admin access
   - **So that** users have appropriate permissions

9. **Create Evaluator Profiles**
   - Add new evaluators to the system
   - Specify their areas of expertise
   - Set contact information and availability
   - **So that** we can assign evaluations appropriately

10. **Edit Evaluator Profiles**
    - Update evaluator information
    - Modify areas of expertise
    - Change contact details
    - **So that** evaluator information stays current

11. **Delete Evaluators**
    - Remove evaluators who are no longer active
    - Archive evaluator data if needed
    - **So that** the evaluator list reflects current staff

12. **Link Evaluators to User Accounts**
    - Connect evaluator profiles to user accounts
    - Ensure evaluators can log in and access their assignments
    - **So that** evaluators can use the system effectively

#### Monitoring & Evaluation Management
**As an Administrator, I want to:**

13. **Create Evaluation Events**
    - Set up new evaluation events with names and dates
    - Select books from the entire inventory
    - Assign multiple evaluators to events
    - **So that** I can organize large-scale evaluations

14. **Manage All Monitoring Entries**
    - View all monitoring entries across all events
    - Update any monitoring entry
    - Reassign evaluators as needed
    - Remove completed or cancelled entries
    - **So that** monitoring data is accurate and current

15. **Bulk Add to Monitoring**
    - Add multiple books to monitoring at once
    - Create monitoring entries for entire evaluation events
    - **So that** I can set up evaluations efficiently

16. **Update Event Names**
    - Rename evaluation events
    - Update event dates
    - Apply changes across all related monitoring entries
    - **So that** event information is consistent

#### Communication Management
**As an Administrator, I want to:**

17. **Access All Conversations**
    - View all chat conversations in the system
    - Monitor communication between users
    - **So that** I can ensure professional communication

18. **Send Broadcast Messages**
    - Send system-wide announcements
    - Broadcast to all evaluators
    - Send targeted messages to specific groups
    - **So that** I can communicate important information efficiently

19. **Manage Chat System**
    - Create group conversations
    - Add or remove participants
    - Archive old conversations
    - **So that** communication channels are well-organized

#### Data Management & Reporting
**As an Administrator, I want to:**

20. **Export System Data**
    - Export complete book inventory to Excel
    - Generate comprehensive PDF reports
    - Export monitoring data for analysis
    - Export user and evaluator lists
    - **So that** I can provide reports to stakeholders

21. **Import Data**
    - Bulk import books from Excel files
    - Import evaluator information
    - **So that** I can populate the system efficiently

22. **Backup Data**
    - Export complete database to JSON
    - Create system backups
    - **So that** data is protected and recoverable

23. **View Audit Trails**
    - See complete remark history for all books
    - Track who made changes and when
    - Monitor system activity
    - **So that** I can ensure accountability and trace issues

#### System Configuration
**As an Administrator, I want to:**

24. **Configure System Settings**
    - Manage status options and workflow stages
    - Configure learning areas and grade levels
    - Set system-wide defaults
    - **So that** the system matches DepEd requirements

25. **Manage Access Control**
    - Define role-based permissions
    - Set up access rules for different user types
    - **So that** data security is maintained

26. **Monitor System Health**
    - View system performance metrics
    - Check database connection status
    - Monitor API response times
    - **So that** I can ensure system reliability

#### Security & Compliance
**As an Administrator, I want to:**

27. **Reset User Passwords**
    - Reset passwords for users who forget them
    - Force password changes for security
    - **So that** users can regain access securely

28. **Audit User Activity**
    - See login history
    - Track user actions
    - Monitor data changes
    - **So that** I can ensure compliance and security

29. **Manage Data Privacy**
    - Control who can see what data
    - Ensure evaluators only see their assignments
    - Protect sensitive information
    - **So that** data privacy is maintained

30. **Handle Data Issues**
    - Resolve duplicate entries
    - Fix data inconsistencies
    - Correct errors in book information
    - **So that** data integrity is maintained

---

## Common User Stories (All Roles)

### Authentication & Security
**As any user, I want to:**

1. **Log In Securely**
   - Enter my username and password
   - Have my session persist until I log out
   - **So that** I can access the system securely

2. **Log Out**
   - End my session when I'm done
   - **So that** my account remains secure

3. **Change My Password**
   - Update my password at any time
   - **So that** I can maintain account security

### User Experience
**As any user, I want to:**

4. **Use on Any Device**
   - Access the system on desktop, tablet, or mobile
   - Have a responsive interface that adapts to my screen
   - **So that** I can work from anywhere

5. **See Loading States**
   - Know when data is being loaded
   - See progress indicators for long operations
   - **So that** I understand what the system is doing

6. **Receive Feedback**
   - See success messages when actions complete
   - Get error messages when something goes wrong
   - **So that** I know the result of my actions

7. **Navigate Easily**
   - Use clear, intuitive navigation
   - Access all features I'm authorized to use
   - **So that** I can work efficiently

8. **Get Help**
   - Access guided tours for new features
   - See tooltips and help text
   - **So that** I can learn to use the system effectively

---

## Technical User Stories (System Requirements)

### Performance
**As the system, I need to:**

1. **Load Data Quickly**
   - Fetch and display books in under 2 seconds
   - Handle 1000+ books without performance degradation
   - **So that** users have a smooth experience

2. **Handle Concurrent Users**
   - Support multiple users working simultaneously
   - Prevent data conflicts and race conditions
   - **So that** the system is reliable for team use

### Data Integrity
**As the system, I need to:**

3. **Prevent Duplicates**
   - Ensure book codes are unique
   - Prevent duplicate monitoring entries
   - **So that** data remains consistent

4. **Maintain Relationships**
   - Keep remarks linked to correct books
   - Maintain evaluator-to-monitoring relationships
   - **So that** data relationships are preserved

5. **Cascade Deletes**
   - Delete related remarks when a book is deleted
   - Clean up monitoring entries when books are removed
   - **So that** orphaned data doesn't accumulate

### Security
**As the system, I need to:**

6. **Protect Data**
   - Encrypt passwords
   - Use secure authentication tokens
   - Prevent unauthorized access
   - **So that** user data is protected

7. **Enforce Access Control**
   - Respect user access rules
   - Filter data based on permissions
   - **So that** users only see authorized data

---

## Summary

This document outlines **90+ user stories** across three primary roles:

- **Facilitators**: 20 core user stories focused on book management, monitoring, and coordination
- **Evaluators**: 17 core user stories focused on reviewing assignments and providing feedback
- **Administrators**: 30 core user stories focused on system management and oversight
- **Common**: 8 user stories applicable to all roles
- **Technical**: 7 system-level requirements

Each user story follows the format:
> **As a [role], I want to [action], so that [benefit]**

This ensures that every feature is tied to a specific user need and business value.

---

**Last Updated**: December 2, 2025  
**Version**: 1.0  
**Status**: Complete
