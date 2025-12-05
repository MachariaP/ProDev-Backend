# Finance API Documentation

## Overview

The Finance API provides endpoints for managing contributions, loans, expenses, and multi-signature approvals in the Chama application.

## Base URL

```
http://localhost:8000/api/v1/finance/
```

## Authentication

All endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <access_token>
```

---

## Contributions

### List Contributions

```
GET /finance/contributions/
```

**Query Parameters:**
- `group` (integer): Filter by group ID
- `member` (integer): Filter by member ID
- `status` (string): Filter by status (PENDING, COMPLETED, FAILED, RECONCILED)
- `payment_method` (string): Filter by payment method (MPESA, CASH, BANK, OTHER)

**Response:**
```json
{
  "count": 10,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "group": 1,
      "group_name": "Test Chama",
      "member": 2,
      "member_name": "John Doe",
      "amount": "5000.00",
      "payment_method": "MPESA",
      "reference_number": "ABC123XYZ",
      "status": "COMPLETED",
      "reconciled_by": null,
      "reconciled_by_name": null,
      "reconciled_at": null,
      "notes": "",
      "created_at": "2025-11-18T10:00:00Z",
      "updated_at": "2025-11-18T10:00:00Z"
    }
  ]
}
```

### Create Contribution

```
POST /finance/contributions/
```

**Request Body:**
```json
{
  "group": 1,
  "member": 2,
  "amount": "5000.00",
  "payment_method": "MPESA",
  "reference_number": "ABC123XYZ",
  "notes": "Monthly contribution"
}
```

### Reconcile Contribution

```
POST /finance/contributions/{id}/reconcile/
```

**Description:** Admin/Treasurer can reconcile a contribution that has been completed.

**Response:**
```json
{
  "id": 1,
  "status": "RECONCILED",
  "reconciled_by": 1,
  "reconciled_by_name": "Admin User",
  "reconciled_at": "2025-11-18T11:00:00Z"
}
```

---

## Loans

### List Loans

```
GET /finance/loans/
```

**Query Parameters:**
- `group` (integer): Filter by group ID
- `borrower` (integer): Filter by borrower ID
- `status` (string): Filter by status (PENDING, APPROVED, DISBURSED, ACTIVE, COMPLETED, DEFAULTED, REJECTED)

**Response:**
```json
{
  "count": 5,
  "results": [
    {
      "id": 1,
      "group": 1,
      "group_name": "Test Chama",
      "borrower": 2,
      "borrower_name": "John Doe",
      "principal_amount": "50000.00",
      "interest_rate": "10.00",
      "duration_months": 12,
      "total_amount": "55000.00",
      "monthly_payment": "4583.33",
      "outstanding_balance": "50000.00",
      "status": "PENDING",
      "purpose": "Business expansion",
      "applied_at": "2025-11-18T09:00:00Z",
      "approved_by": null,
      "approved_by_name": null,
      "approved_at": null,
      "disbursed_at": null,
      "due_date": null,
      "completed_at": null,
      "notes": "",
      "total_paid": 0
    }
  ]
}
```

### Apply for Loan

```
POST /finance/loans/
```

**Request Body:**
```json
{
  "group": 1,
  "principal_amount": "50000.00",
  "interest_rate": "10.00",
  "duration_months": 12,
  "purpose": "Business expansion"
}
```

**Note:** The `borrower` is automatically set to the current user. The `total_amount` and `monthly_payment` are calculated automatically.

### Get Loan Details

```
GET /finance/loans/{id}/
```

---

## Loan Repayments

### List Loan Repayments

```
GET /finance/loan-repayments/
```

**Query Parameters:**
- `loan` (integer): Filter by loan ID
- `status` (string): Filter by status (PENDING, COMPLETED, FAILED)

**Response:**
```json
{
  "count": 3,
  "results": [
    {
      "id": 1,
      "loan": 1,
      "loan_details": {
        "borrower": "John Doe",
        "principal": "50000.00",
        "outstanding": "45000.00"
      },
      "amount": "5000.00",
      "payment_method": "MPESA",
      "reference_number": "REP123",
      "status": "COMPLETED",
      "paid_at": "2025-11-18T10:00:00Z",
      "notes": ""
    }
  ]
}
```

### Create Loan Repayment

```
POST /finance/loan-repayments/
```

**Request Body:**
```json
{
  "loan": 1,
  "amount": "5000.00",
  "payment_method": "MPESA",
  "reference_number": "REP123",
  "notes": "First repayment"
}
```

**Note:** When a repayment with status COMPLETED is created, the loan's outstanding_balance is automatically updated via signals.

---

## Expenses

### List Expenses

```
GET /finance/expenses/
```

**Query Parameters:**
- `group` (integer): Filter by group ID
- `category` (string): Filter by category (OPERATIONAL, ADMINISTRATIVE, WELFARE, INVESTMENT, OTHER)
- `status` (string): Filter by status (PENDING, APPROVED, DISBURSED, REJECTED)

**Response:**
```json
{
  "count": 8,
  "results": [
    {
      "id": 1,
      "group": 1,
      "group_name": "Test Chama",
      "category": "OPERATIONAL",
      "description": "Office supplies",
      "amount": "3000.00",
      "status": "PENDING",
      "receipt": null,
      "requested_by": 2,
      "requested_by_name": "John Doe",
      "approved_by": null,
      "approved_by_name": null,
      "requested_at": "2025-11-18T09:00:00Z",
      "approved_at": null,
      "disbursed_at": null,
      "notes": ""
    }
  ]
}
```

### Create Expense

```
POST /finance/expenses/
```

**Request Body (multipart/form-data for file upload):**
```json
{
  "group": 1,
  "category": "OPERATIONAL",
  "description": "Office supplies",
  "amount": "3000.00",
  "receipt": <file>,
  "notes": "Receipt attached"
}
```

**Note:** The `requested_by` is automatically set to the current user.

---

## Disbursement Approvals

### List Disbursement Approvals

```
GET /finance/disbursement-approvals/
```

**Query Parameters:**
- `group` (integer): Filter by group ID
- `approval_type` (string): Filter by type (LOAN, EXPENSE, WITHDRAWAL)
- `status` (string): Filter by status (PENDING, APPROVED, REJECTED)

**Response:**
```json
{
  "count": 3,
  "results": [
    {
      "id": 1,
      "group": 1,
      "group_name": "Test Chama",
      "approval_type": "LOAN",
      "amount": "50000.00",
      "description": "Business expansion loan",
      "loan": 1,
      "expense": null,
      "required_approvals": 2,
      "approvals_count": 1,
      "status": "PENDING",
      "requested_by": 2,
      "requested_by_name": "John Doe",
      "signatures": [
        {
          "id": 1,
          "approver": 3,
          "approver_name": "Jane Smith",
          "approved": true,
          "comments": "Approved",
          "signed_at": "2025-11-18T10:00:00Z"
        }
      ],
      "is_approved": false,
      "created_at": "2025-11-18T09:00:00Z",
      "updated_at": "2025-11-18T10:00:00Z"
    }
  ]
}
```

### Get Approval Details

```
GET /finance/disbursement-approvals/{id}/
```

---

## Approval Signatures

### Create Approval Signature

```
POST /finance/approval-signatures/
```

**Request Body:**
```json
{
  "approval": 1,
  "approved": true,
  "comments": "Approved - funds available"
}
```

**Note:** 
- The `approver` is automatically set to the current user
- When a signature is created, signals automatically:
  - Update the approval's `approvals_count`
  - Change status to APPROVED if `approvals_count >= required_approvals`
  - Update the related loan or expense status accordingly

**Response:**
```json
{
  "id": 2,
  "approver": 4,
  "approver_name": "Bob Wilson",
  "approved": true,
  "comments": "Approved - funds available",
  "signed_at": "2025-11-18T11:00:00Z"
}
```

---

## Signal-Based Automation

The Finance API includes automatic status updates via Django signals:

### Approval Workflow
When an `ApprovalSignature` is created:
1. Count approved signatures
2. Update `approvals_count` on the `DisbursementApproval`
3. If `approvals_count >= required_approvals`:
   - Set approval status to APPROVED
   - Update related loan status to APPROVED
   - Or update related expense status to APPROVED

### Loan Repayments
When a `LoanRepayment` with status COMPLETED is created:
1. Calculate total repaid amount
2. Update loan's `outstanding_balance`
3. If fully paid, set loan status to COMPLETED

---

## Status Transitions

### Contribution Status Flow
```
PENDING → COMPLETED → RECONCILED
        ↓
      FAILED
```

### Loan Status Flow
```
PENDING → APPROVED → DISBURSED → ACTIVE → COMPLETED
        ↓                                 ↓
     REJECTED                        DEFAULTED
```

### Expense Status Flow
```
PENDING → APPROVED → DISBURSED
        ↓
     REJECTED
```

### Approval Status Flow
```
PENDING → APPROVED
        ↓
     REJECTED
```

---

## Error Responses

All endpoints return standard HTTP status codes:

- `200 OK` - Successful GET/PUT/PATCH
- `201 Created` - Successful POST
- `204 No Content` - Successful DELETE
- `400 Bad Request` - Validation errors
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

**Error Response Format:**
```json
{
  "detail": "Error message",
  "field_name": ["Error for specific field"]
}
```

---

## Permissions

- All endpoints require authentication
- Reconciliation endpoint requires Admin or Treasurer role
- Approval endpoints check group membership
- Users can only view data for groups they belong to

---

## Rate Limiting

Rate limiting is not currently implemented but should be added in production:
- Consider 100 requests per minute per user
- Higher limits for admin users

---

## Best Practices

1. **Always check approval status** before disbursing funds
2. **Verify payment references** to prevent duplicate contributions
3. **Use signals** for automatic status updates (already implemented)
4. **Include notes** for audit trail purposes
5. **Upload receipts** for all expenses
6. **Set appropriate required_approvals** based on amount

---

## Examples

### Complete Loan Workflow

1. **Member applies for loan:**
```bash
POST /finance/loans/
{
  "group": 1,
  "principal_amount": "50000.00",
  "interest_rate": "10.00",
  "duration_months": 12,
  "purpose": "Business expansion"
}
```

2. **System creates approval request** (can be done manually or via frontend)

3. **Chairperson approves:**
```bash
POST /finance/approval-signatures/
{
  "approval": 1,
  "approved": true,
  "comments": "Approved"
}
```

4. **Treasurer approves:**
```bash
POST /finance/approval-signatures/
{
  "approval": 1,
  "approved": true,
  "comments": "Approved"
}
```

5. **System automatically updates loan status to APPROVED**

6. **Member makes repayment:**
```bash
POST /finance/loan-repayments/
{
  "loan": 1,
  "amount": "5000.00",
  "payment_method": "MPESA",
  "reference_number": "REP123",
  "status": "COMPLETED"
}
```

7. **System automatically updates outstanding_balance**

---

## Changelog

### Version 1.0 (November 2025)
- Initial release with all core finance features
- Signal-based automation for approvals and repayments
- Multi-signature approval workflow
- Comprehensive API endpoints for all finance operations
