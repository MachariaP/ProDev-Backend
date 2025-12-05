# Transaction Endpoint Guide

## Overview
This document describes the unified transaction endpoint that aggregates financial data from contributions, loans, and expenses.

## Endpoint
- **URL**: `/api/v1/finance/transactions/`
- **Method**: GET
- **Authentication**: Required (Bearer token)

## Features
- Aggregates data from multiple sources:
  - Contributions (inflow)
  - Loans (outflow)
  - Expenses (outflow)
- Supports filtering by type, status, and date range
- CSV export functionality
- Consistent response format for frontend consumption

## Request Parameters

### Filtering
- `type` (optional): Filter by transaction type
  - Values: `contribution`, `loan`, `expense`
  - Default: All types
  
- `status` (optional): Filter by transaction status
  - Values: `completed`, `pending`, `approved`, `disbursed`, etc.
  - Default: All statuses
  
- `date_from` (optional): Start date for filtering
  - Format: `YYYY-MM-DD`
  
- `date_to` (optional): End date for filtering
  - Format: `YYYY-MM-DD`

## Response Format

```json
{
  "count": 3,
  "results": [
    {
      "id": "contribution-123",
      "type": "contribution",
      "category": "M-Pesa",
      "amount": 5000.00,
      "balance_after": 0,
      "description": "Contribution via M-Pesa",
      "created_at": "2025-11-24T14:30:00Z",
      "group_name": "Test Chama",
      "user_name": "John Doe",
      "status": "completed"
    },
    {
      "id": "loan-456",
      "type": "loan",
      "category": "Loan Disbursement",
      "amount": 10000.00,
      "balance_after": 0,
      "description": "Loan: Business expansion",
      "created_at": "2025-11-23T10:15:00Z",
      "group_name": "Test Chama",
      "user_name": "Jane Smith",
      "status": "disbursed"
    },
    {
      "id": "expense-789",
      "type": "expense",
      "category": "Operational",
      "amount": 2000.00,
      "balance_after": 0,
      "description": "Office supplies",
      "created_at": "2025-11-22T16:45:00Z",
      "group_name": "Test Chama",
      "user_name": "Admin User",
      "status": "approved"
    }
  ]
}
```

## Field Descriptions

- `id`: Unique identifier (format: `{type}-{original_id}`)
- `type`: Transaction type (contribution, loan, expense)
- `category`: Sub-category or payment method
- `amount`: Transaction amount in KES
- `balance_after`: Balance after transaction (currently 0, can be enhanced)
- `description`: Human-readable description
- `created_at`: ISO 8601 timestamp
- `group_name`: Name of the associated Chama group
- `user_name`: Full name of the user involved
- `status`: Transaction status

## Export to CSV

### Endpoint
- **URL**: `/api/v1/finance/transactions/export/`
- **Method**: GET
- **Response**: CSV file download

### Usage Example
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     "http://localhost:8000/api/v1/finance/transactions/export/?type=contribution&status=completed" \
     -o transactions.csv
```

## Frontend Integration

### TransactionHistoryPage
Located at: `chamahub-frontend/src/pages/financial/TransactionHistoryPage.tsx`

The page is already configured to:
- Fetch transactions using the `/finance/transactions/` endpoint
- Display filters for type, status, and date range
- Show transaction statistics (inflow, outflow, net balance)
- Export transactions to CSV

### ExpensesPage
Located at: `chamahub-frontend/src/pages/financial/ExpensesPage.tsx`

The page is already configured to:
- Fetch expenses using the `/finance/expenses/` endpoint
- Display expense categories and statuses
- Show approval workflow

## Testing

Run the transaction endpoint tests:
```bash
python manage.py test finance.tests.TransactionAPITest
```

All finance tests:
```bash
python manage.py test finance.tests
```

## Security
- ✅ Requires authentication for all operations
- ✅ Read-only endpoint (no create/update/delete)
- ✅ CodeQL security scan passed with no vulnerabilities
- ✅ Proper error handling and validation

## Future Enhancements
- Add `balance_after` calculation based on cumulative transactions
- Implement pagination for large datasets
- Add support for investment transactions
- Add transaction detail view endpoint
- Implement real-time transaction updates via WebSocket
