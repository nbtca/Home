# Member Onboarding Process Implementation

## Overview

This document describes the member onboarding process implementation, which allows new members to apply to join the association and requires admin approval before they become official members.

## Features

- **Public Application Form**: New members can submit applications with required information
- **Admin Approval System**: Admins can review, approve, or reject applications
- **Status Tracking**: Applications have three states: pending, approved, rejected
- **Automatic Member Creation**: Approved applications automatically create member records
- **Search and Filter**: Admins can search and filter applications by status
- **Mobile Responsive**: Works on both desktop and mobile devices

## Architecture

### Required Fields for New Members

As specified in the requirements, the following fields are mandatory:
- `memberId` (学号) - Student ID
- `name` (姓名) - Full name
- `phone` (手机号) - Phone number
- `section` (部门) - Department/Section

### Optional Fields
- `qq` - QQ number
- `email` - Email address
- `major` (专业) - Major
- `class` (班级) - Class
- `memo` (备注) - Self introduction

### Application States

```
pending → approved → Member created
        ↓
      rejected
```

## File Structure

```
src/
├── types/
│   └── member-application.ts           # TypeScript type definitions
│
├── pages/
│   ├── join/
│   │   ├── index.astro                 # Public application page
│   │   └── react/
│   │       └── MemberApplicationForm.tsx  # Application form component
│   │
│   └── admin/
│       └── member-applications/
│           ├── index.astro             # Admin page wrapper
│           └── react/
│               ├── MemberApplicationAdmin.tsx     # Main admin component
│               ├── ApplicationDetail.tsx          # Detail drawer
│               └── ApplicationActions.tsx         # Approve/Reject actions
│
└── utils/
    └── active/
        ├── ApiClient.ts                # Updated with memberApplication service
        ├── services.gen.ts             # Added MemberApplicationService
        └── types.gen.ts                # Added member application types
```

## Frontend Components

### 1. Public Application Form (`/join`)

**Component**: `MemberApplicationForm.tsx`

**Features**:
- Form validation for required fields
- Auto-save to localStorage
- Auto-fill QQ from email and vice versa
- Phone number format validation
- Department selection dropdown
- Success message with application ID

**Sections**:
- Basic Information (name, student ID, major, class)
- Department Selection
- Contact Information (phone, QQ, email)
- Self Introduction (memo)

### 2. Admin Management Interface (`/admin/member-applications`)

**Component**: `MemberApplicationAdmin.tsx`

**Features**:
- Table view with pagination (desktop)
- Card view (mobile)
- Status filtering (pending/approved/rejected)
- Search by name or student ID
- Detail drawer for each application
- Approve/reject actions

**Access Control**:
- Requires authentication via Logto
- Requires "admin" or "member admin" role

### 3. Application Detail Drawer

**Component**: `ApplicationDetail.tsx`

**Displays**:
- Application status and ID
- Basic information
- Contact information
- Self introduction
- Review information (for approved/rejected applications)
- Timestamps
- Action buttons (approve/reject) for pending applications

### 4. Application Actions

**Component**: `ApplicationActions.tsx`

**Actions**:
- **Approve**: Creates member in Saturday API + updates application status
- **Reject**: Updates application status with optional reason

## API Endpoints (Backend Required)

The frontend is ready, but the following backend API endpoints need to be implemented:

### 1. Submit Application
```
POST /api/member-application
```

**Request Body**:
```json
{
  "memberId": "string",
  "name": "string",
  "phone": "string",
  "section": "string",
  "qq": "string (optional)",
  "email": "string (optional)",
  "major": "string (optional)",
  "class": "string (optional)",
  "memo": "string (optional)"
}
```

**Response**:
```json
{
  "success": true,
  "result": {
    "applicationId": "string",
    "memberId": "string",
    "name": "string",
    "phone": "string",
    "section": "string",
    "status": "pending",
    "gmtCreate": "ISO 8601 timestamp",
    "gmtModified": "ISO 8601 timestamp"
  }
}
```

### 2. Get Applications (Admin)
```
GET /api/member-application?offset=0&limit=10&status=pending&search=keyword
```

**Query Parameters**:
- `offset` (optional): Pagination offset
- `limit` (optional): Number of items per page
- `status` (optional): Filter by status (comma-separated: "pending,approved,rejected")
- `search` (optional): Search by name or memberId

**Response**:
```json
{
  "success": true,
  "result": [
    {
      "applicationId": "string",
      "memberId": "string",
      "name": "string",
      "phone": "string",
      "section": "string",
      "status": "pending",
      "gmtCreate": "ISO 8601 timestamp",
      "gmtModified": "ISO 8601 timestamp"
    }
  ],
  "totalCount": 100
}
```

### 3. Approve Application (Admin)
```
PATCH /api/member-application/{applicationId}/approve
```

**Request Body**:
```json
{
  "reviewedBy": "string (admin memberId)"
}
```

**Response**:
```json
{
  "success": true,
  "result": {
    "applicationId": "string",
    "status": "approved",
    "reviewedBy": "string",
    "reviewedAt": "ISO 8601 timestamp",
    "gmtModified": "ISO 8601 timestamp"
  }
}
```

**Backend Logic**:
1. Update application status to "approved"
2. Set reviewedBy and reviewedAt
3. Create Member record in Saturday API using the data from application

### 4. Reject Application (Admin)
```
PATCH /api/member-application/{applicationId}/reject
```

**Request Body**:
```json
{
  "reviewedBy": "string (admin memberId)",
  "reason": "string (optional)"
}
```

**Response**:
```json
{
  "success": true,
  "result": {
    "applicationId": "string",
    "status": "rejected",
    "reviewedBy": "string",
    "reviewedAt": "ISO 8601 timestamp",
    "rejectReason": "string",
    "gmtModified": "ISO 8601 timestamp"
  }
}
```

## Database Schema (Backend Required)

### Table: `member_applications`

```sql
CREATE TABLE member_applications (
  application_id VARCHAR(36) PRIMARY KEY,
  member_id VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  section VARCHAR(50) NOT NULL,
  qq VARCHAR(20),
  email VARCHAR(100),
  major VARCHAR(100),
  class VARCHAR(50),
  memo TEXT,

  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',

  reviewed_by VARCHAR(50),
  reviewed_at DATETIME,
  reject_reason TEXT,

  gmt_create DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  gmt_modified DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_status (status),
  INDEX idx_member_id (member_id),
  INDEX idx_gmt_create (gmt_create)
);
```

## Integration with Existing Systems

### 1. Saturday API Integration

When an application is approved, the admin component calls:
```typescript
POST /members/{MemberId}
```

With the body:
```typescript
{
  memberId: application.memberId,
  name: application.name,
  phone: application.phone,
  section: application.section,
  qq: application.qq || "",
  email: application.email || "",
  alias: "",  // Will be set later by member
  avatar: "", // Will be set later by member
  profile: application.memo || "",
  role: "member",
  logtoId: "", // Will be set when member activates
  createdBy: adminMemberId
}
```

### 2. Logto Authentication

Admin access requires:
- User must be authenticated
- User must have role: "admin" OR "member admin"

The validation is done in `MemberApplicationAdmin.tsx`:
```typescript
export const validateMemberAdminRole = (roles: string[]) => {
  const acceptableRoles = ["admin", "member admin"]
  return roles.some(role => acceptableRoles.includes(role.toLowerCase()))
}
```

## Usage

### For New Members

1. Visit `/join`
2. Fill out the application form
3. Submit and receive application ID
4. Wait for admin approval

### For Admins

1. Visit `/admin/member-applications`
2. Login with admin credentials (if not already logged in)
3. View list of applications
4. Filter by status (pending/approved/rejected)
5. Search by name or student ID
6. Click on application to view details
7. Approve or reject applications

## Next Steps

To complete this implementation:

1. **Backend API Development**:
   - Implement the 4 API endpoints listed above
   - Set up database table for member applications
   - Add authentication middleware for admin endpoints
   - Integrate with Saturday API for member creation

2. **Testing**:
   - Test application submission flow
   - Test admin approval flow
   - Test admin rejection flow
   - Test search and filtering
   - Test mobile responsiveness

3. **Optional Enhancements**:
   - Email/SMS notifications for applicants
   - Bulk approval feature
   - Application statistics dashboard
   - Export applications to Excel
   - Application editing before approval
   - Member activation integration

## Configuration

### Department Options

Currently defined in `src/types/member-application.ts`:

```typescript
export const SECTIONS = [
  { value: 'web', label: 'Web开发' },
  { value: 'design', label: '设计' },
  { value: 'algorithm', label: '算法' },
  { value: 'embedded', label: '嵌入式' },
  { value: 'operation', label: '运营' },
]
```

To add or modify departments, update this constant.

### Admin Roles

Currently accepts these roles:
- `admin`
- `member admin`

To modify, update `validateMemberAdminRole` in `MemberApplicationAdmin.tsx`.

## Troubleshooting

### Application submission fails

- Check if the backend API endpoint `/api/member-application` is implemented
- Check browser console for error messages
- Verify all required fields are filled

### Admin page shows login redirect

- Ensure user is authenticated with Logto
- Verify user has "admin" or "member admin" role
- Check Logto configuration

### Approve action fails

- Verify Saturday API `/members/{MemberId}` endpoint is accessible
- Check admin authentication token
- Ensure memberId doesn't already exist in system

## API Base URL

The API client uses the base URL from `activeClient`:
```typescript
export const activeClient = new ApiClient({
  BASE: "https://active.nbtca.space",
})
```

Make sure the backend APIs are deployed to this URL or update the base URL accordingly.
