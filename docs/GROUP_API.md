# Group API Endpoints Documentation

This document describes the API endpoints for the Chama Group Management system.

## Base URL
All endpoints are prefixed with: `/api/v1/groups/`

## Authentication
All endpoints require authentication using JWT tokens. Include the token in the Authorization header:
```
Authorization: Bearer <your_token>
```

## Endpoints

### 1. Chama Groups

#### List Groups
- **URL**: `GET /api/v1/groups/chama-groups/`
- **Description**: Get a list of all chama groups
- **Query Parameters**:
  - `group_type`: Filter by group type (SAVINGS, INVESTMENT, WELFARE, MIXED)
  - `is_active`: Filter by active status (true/false)
  - `kyb_verified`: Filter by KYB verification status (true/false)
- **Response**: Paginated list of groups with member count and KYB status

#### Create Group
- **URL**: `POST /api/v1/groups/chama-groups/`
- **Description**: Create a new chama group (creator automatically becomes ADMIN)
- **Request Body**:
  ```json
  {
    "name": "My Savings Group",
    "description": "A savings group for friends",
    "group_type": "SAVINGS",
    "objectives": "Save money together for investments",
    "contribution_frequency": "MONTHLY",
    "minimum_contribution": "1000.00"
  }
  ```

#### Get Group Details
- **URL**: `GET /api/v1/groups/chama-groups/{id}/`
- **Description**: Get detailed information about a specific group

#### Update Group
- **URL**: `PUT/PATCH /api/v1/groups/chama-groups/{id}/`
- **Description**: Update group information

#### My Groups
- **URL**: `GET /api/v1/groups/chama-groups/my_groups/`
- **Description**: Get all groups where the current user has ACTIVE membership

#### Group Dashboard
- **URL**: `GET /api/v1/groups/chama-groups/{id}/dashboard/`
- **Description**: Get aggregated dashboard data for a group
- **Response**:
  ```json
  {
    "id": 1,
    "name": "My Savings Group",
    "group_type": "SAVINGS",
    "total_balance": "50000.00",
    "member_count": 5,
    "total_contributions": 45000.00,
    "total_loans_outstanding": 10000.00,
    "total_investments": 5000.00,
    "active_goals": [...]
  }
  ```

### 2. Group Memberships

#### List Memberships
- **URL**: `GET /api/v1/groups/memberships/`
- **Description**: Get list of group memberships
- **Query Parameters**:
  - `group`: Filter by group ID
  - `user`: Filter by user ID
  - `role`: Filter by role (ADMIN, CHAIRPERSON, TREASURER, SECRETARY, MEMBER)
  - `status`: Filter by status (PENDING, ACTIVE, SUSPENDED, EXITED)

#### Create Membership
- **URL**: `POST /api/v1/groups/memberships/`
- **Description**: Add a new member to a group (status starts as PENDING)
- **Request Body**:
  ```json
  {
    "group": 1,
    "user": 2,
    "role": "MEMBER"
  }
  ```

#### Approve Membership
- **URL**: `POST /api/v1/groups/memberships/{id}/approve/`
- **Description**: Approve a pending membership (changes status to ACTIVE)
- **Note**: Only works on PENDING memberships

#### Suspend Membership
- **URL**: `POST /api/v1/groups/memberships/{id}/suspend/`
- **Description**: Suspend an active membership (changes status to SUSPENDED)

### 3. Group Officials

#### List Officials
- **URL**: `GET /api/v1/groups/officials/`
- **Description**: Get list of group officials
- **Query Parameters**:
  - `group`: Filter by group ID
  - `position`: Filter by position (CHAIRPERSON, VICE_CHAIRPERSON, TREASURER, SECRETARY, ORGANIZING_SECRETARY)
  - `is_current`: Filter by current term status (true/false)

#### Create Official
- **URL**: `POST /api/v1/groups/officials/`
- **Description**: Elect a member to an official position
- **Request Body**:
  ```json
  {
    "group": 1,
    "membership": 5,
    "position": "CHAIRPERSON",
    "term_start": "2025-01-01",
    "term_end": "2025-12-31",
    "is_current": true
  }
  ```

### 4. Group Goals

#### List Goals
- **URL**: `GET /api/v1/groups/goals/`
- **Description**: Get list of group goals
- **Query Parameters**:
  - `group`: Filter by group ID
  - `status`: Filter by status (ACTIVE, ACHIEVED, CANCELLED)

#### Create Goal
- **URL**: `POST /api/v1/groups/goals/`
- **Description**: Create a new financial goal for the group
- **Request Body**:
  ```json
  {
    "group": 1,
    "title": "Buy Equipment",
    "description": "Purchase new equipment for the business",
    "target_amount": "500000.00",
    "target_date": "2025-12-31"
  }
  ```

#### Mark Goal as Achieved
- **URL**: `POST /api/v1/groups/goals/{id}/mark_achieved/`
- **Description**: Mark a goal as achieved (sets status to ACHIEVED and records achieved_at timestamp)

## Frontend Integration Guide

### A. Group Dashboard/Overview Tab
```javascript
// Fetch dashboard data
const response = await fetch(`/api/v1/groups/chama-groups/${groupId}/dashboard/`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const dashboardData = await response.json();

// Display: name, group_type, total_balance, member_count, etc.
```

### B. Member Management Tab
```javascript
// Fetch members
const response = await fetch(`/api/v1/groups/memberships/?group=${groupId}`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const members = await response.json();

// Approve a pending member
await fetch(`/api/v1/groups/memberships/${membershipId}/approve/`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// Suspend a member
await fetch(`/api/v1/groups/memberships/${membershipId}/suspend/`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### C. Goals and Objectives Tab
```javascript
// Fetch goals
const response = await fetch(`/api/v1/groups/goals/?group=${groupId}`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const goals = await response.json();

// Each goal includes:
// - title, target_amount, current_amount, progress_percentage
// Progress bar: <div style="width: {goal.progress_percentage}%"></div>

// Mark goal as achieved
await fetch(`/api/v1/groups/goals/${goalId}/mark_achieved/`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### D. Leadership/Officials Tab
```javascript
// Fetch current officials
const response = await fetch(`/api/v1/groups/officials/?group=${groupId}&is_current=true`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const officials = await response.json();

// Display current CHAIRPERSON, TREASURER, SECRETARY, etc.
```

## Progress Percentage Calculation

The goal progress is automatically calculated:
```
Progress % = (current_amount / target_amount) × 100
```

Example:
- Target: KES 500,000
- Current: KES 125,000
- Progress: 25%

## Error Responses

All endpoints return standard HTTP status codes:
- `200 OK`: Successful GET/PUT/PATCH
- `201 Created`: Successful POST
- `400 Bad Request`: Invalid data
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

Error response format:
```json
{
  "error": "Description of the error",
  "detail": "More specific details if available"
}
```
