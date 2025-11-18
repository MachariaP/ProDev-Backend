# 🏦 ChamaHub Fintech Platform - Backend API Documentation

## Overview

This document provides comprehensive documentation for all 13 new backend applications added to the ChamaHub fintech platform. All APIs follow RESTful principles and require JWT authentication.

## Base URL

```
Production: https://api.chamahub.com/api/v1/
Development: http://localhost:8000/api/v1/
```

## Authentication

All endpoints require JWT authentication. Include the token in the Authorization header:

```http
Authorization: Bearer <your_jwt_token>
```

To obtain a token:
```http
POST /api/token/
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "your_password"
}
```

## API Endpoints by Category

### 🏦 1. M-Pesa Integration (`/api/v1/mpesa/`)

Mobile money payment integration for the Kenyan market.

#### Endpoints:
- `GET /api/v1/mpesa/transactions/` - List all M-Pesa transactions
- `POST /api/v1/mpesa/transactions/` - Create a new transaction record
- `GET /api/v1/mpesa/transactions/{id}/` - Get transaction details
- `POST /api/v1/mpesa/transactions/initiate_stk_push/` - Initiate STK Push payment
- `POST /api/v1/mpesa/transactions/mpesa_callback/` - M-Pesa webhook callback
- `GET /api/v1/mpesa/transactions/{id}/check_status/` - Check transaction status
- `GET /api/v1/mpesa/bulk-payments/` - List bulk payments
- `POST /api/v1/mpesa/bulk-payments/` - Create bulk payment
- `GET /api/v1/mpesa/reconciliations/` - List payment reconciliations
- `POST /api/v1/mpesa/reconciliations/{id}/mark_matched/` - Mark as matched

#### Example: Initiate STK Push
```http
POST /api/v1/mpesa/transactions/initiate_stk_push/
Content-Type: application/json

{
  "phone_number": "254712345678",
  "amount": "1000.00",
  "account_reference": "CONT-001",
  "transaction_desc": "Monthly contribution",
  "group_id": 1
}
```

### 💰 2. Wealth Engine (`/api/v1/wealth-engine/`)

AI-powered investment recommendations and portfolio management.

#### Endpoints:
- `GET /api/v1/wealth-engine/recommendations/` - List investment recommendations
- `POST /api/v1/wealth-engine/recommendations/` - Create recommendation
- `POST /api/v1/wealth-engine/recommendations/{id}/accept/` - Accept recommendation
- `POST /api/v1/wealth-engine/recommendations/{id}/reject/` - Reject recommendation
- `GET /api/v1/wealth-engine/rebalances/` - List portfolio rebalances
- `GET /api/v1/wealth-engine/auto-rules/` - List auto-investment rules
- `POST /api/v1/wealth-engine/auto-rules/{id}/toggle_active/` - Toggle rule status
- `GET /api/v1/wealth-engine/performance/` - List investment performance metrics

#### Example: Get Investment Recommendations
```http
GET /api/v1/wealth-engine/recommendations/?group=1&status=PENDING
```

### 📊 3. Credit Scoring (`/api/v1/credit-scoring/`)

Member credit assessment and loan eligibility determination.

#### Endpoints:
- `GET /api/v1/credit-scoring/scores/` - List member credit scores
- `POST /api/v1/credit-scoring/scores/` - Calculate new credit score
- `GET /api/v1/credit-scoring/eligibility/` - Check loan eligibility
- `GET /api/v1/credit-scoring/payment-history/` - Get payment history analysis
- `GET /api/v1/credit-scoring/default-predictions/` - Get default risk predictions

#### Example: Check Credit Score
```http
GET /api/v1/credit-scoring/scores/?user=1&group=1
```

### 📈 4. Analytics Dashboard (`/api/v1/analytics/`)

Business intelligence and financial analytics.

#### Endpoints:
- `GET /api/v1/analytics/analytics-reports/` - List analytics reports
- `POST /api/v1/analytics/analytics-reports/` - Generate new report
- `GET /api/v1/analytics/financial-health-scores/` - Get financial health scores
- `GET /api/v1/analytics/predictive-cash-flows/` - Get cash flow predictions

#### Example: Get Financial Health Score
```http
GET /api/v1/analytics/financial-health-scores/?group=1
```

### 📄 5. Reporting Engine (`/api/v1/reports/`)

Automated report generation in multiple formats.

#### Endpoints:
- `GET /api/v1/reports/generated-reports/` - List generated reports
- `POST /api/v1/reports/generated-reports/` - Request new report
- `GET /api/v1/reports/scheduled-reports/` - List scheduled reports
- `POST /api/v1/reports/scheduled-reports/` - Create scheduled report

#### Example: Generate PDF Statement
```http
POST /api/v1/reports/generated-reports/
Content-Type: application/json

{
  "group": 1,
  "report_type": "STATEMENT",
  "report_format": "PDF",
  "period_start": "2024-01-01",
  "period_end": "2024-01-31"
}
```

### 🔒 6. Audit Trail (`/api/v1/audit/`)

Immutable audit logs and compliance reporting.

#### Endpoints:
- `GET /api/v1/audit/audit-logs/` - List audit logs (read-only)
- `GET /api/v1/audit/compliance-reports/` - List compliance reports
- `GET /api/v1/audit/suspicious-activity-alerts/` - List suspicious activity alerts

#### Example: Get Audit Logs
```http
GET /api/v1/audit/audit-logs/?entity_type=CONTRIBUTION&user=1
```

### 🆔 7. KYC Verification (`/api/v1/kyc/`)

Identity verification and KYC document management.

#### Endpoints:
- `GET /api/v1/kyc/kycdocuments/` - List KYC documents
- `POST /api/v1/kyc/kycdocuments/` - Upload KYC document
- `GET /api/v1/kyc/biometric-datas/` - List biometric data
- `GET /api/v1/kyc/verification-workflows/` - Get verification status

#### Example: Upload ID Document
```http
POST /api/v1/kyc/kycdocuments/
Content-Type: multipart/form-data

{
  "document_type": "NATIONAL_ID",
  "document_number": "12345678",
  "document_file": <file>,
  "issue_date": "2020-01-01",
  "expiry_date": "2030-01-01"
}
```

### 🤖 8. AI Assistant (`/api/v1/ai-assistant/`)

Financial chatbot and AI-powered assistance.

#### Endpoints:
- `GET /api/v1/ai-assistant/chat-conversations/` - List conversations
- `POST /api/v1/ai-assistant/chat-conversations/` - Start new conversation
- `GET /api/v1/ai-assistant/chat-messages/` - List messages
- `POST /api/v1/ai-assistant/chat-messages/` - Send message
- `GET /api/v1/ai-assistant/financial-advices/` - Get AI advice

#### Example: Send Chat Message
```http
POST /api/v1/ai-assistant/chat-messages/
Content-Type: application/json

{
  "conversation": 1,
  "role": "USER",
  "content": "How much can I borrow?"
}
```

### ⚙️ 9. Automation Engine (`/api/v1/automation/`)

Smart workflow automation and scheduled tasks.

#### Endpoints:
- `GET /api/v1/automation/automation-rules/` - List automation rules
- `POST /api/v1/automation/automation-rules/` - Create automation rule
- `GET /api/v1/automation/execution-logs/` - View execution logs
- `GET /api/v1/automation/notification-templates/` - List notification templates

#### Example: Create Automation Rule
```http
POST /api/v1/automation/automation-rules/
Content-Type: application/json

{
  "group": 1,
  "rule_type": "RECURRING_CONTRIBUTION",
  "rule_name": "Monthly Contribution Reminder",
  "frequency": "MONTHLY",
  "conditions": {"day": 1},
  "actions": {"send_reminder": true},
  "next_execution_at": "2024-02-01T00:00:00Z"
}
```

### 📱 10. Mobile Sync (`/api/v1/mobile-sync/`)

Offline-first mobile app synchronization.

#### Endpoints:
- `GET /api/v1/mobile-sync/offline-transactions/` - List offline transactions
- `POST /api/v1/mobile-sync/offline-transactions/` - Sync offline transaction
- `GET /api/v1/mobile-sync/sync-conflicts/` - List sync conflicts
- `GET /api/v1/mobile-sync/device-syncs/` - List device sync status

#### Example: Sync Offline Transaction
```http
POST /api/v1/mobile-sync/offline-transactions/
Content-Type: application/json

{
  "transaction_type": "CONTRIBUTION",
  "transaction_data": {...},
  "local_id": "LOCAL-123",
  "device_id": "DEVICE-456",
  "created_at_device": "2024-01-15T10:00:00Z"
}
```

### 🔌 11. API Gateway (`/api/v1/api-gateway/`)

Third-party API integrations and webhook management.

#### Endpoints:
- `GET /api/v1/api-gateway/external-apiconnections/` - List API connections
- `POST /api/v1/api-gateway/external-apiconnections/` - Create API connection
- `GET /api/v1/api-gateway/apirequests/` - List API request logs
- `GET /api/v1/api-gateway/webhook-endpoints/` - List webhooks
- `POST /api/v1/api-gateway/webhook-endpoints/` - Register webhook

#### Example: Register Webhook
```http
POST /api/v1/api-gateway/webhook-endpoints/
Content-Type: application/json

{
  "name": "Payment Notifications",
  "url": "https://example.com/webhook",
  "secret": "webhook_secret_key",
  "events": ["payment.success", "payment.failed"],
  "retry_count": 3
}
```

### 🎮 12. Gamification (`/api/v1/gamification/`)

Member engagement through gamification.

#### Endpoints:
- `GET /api/v1/gamification/member-achievements/` - List member achievements
- `GET /api/v1/gamification/contribution-streaks/` - Get contribution streaks
- `GET /api/v1/gamification/leaderboards/` - View leaderboards
- `GET /api/v1/gamification/reward-points/` - List reward points transactions

#### Example: Get Leaderboard
```http
GET /api/v1/gamification/leaderboards/?group=1&leaderboard_type=CONTRIBUTIONS&period=MONTHLY
```

### 📚 13. Education Hub (`/api/v1/education/`)

Financial literacy and educational content.

#### Endpoints:
- `GET /api/v1/education/educational-contents/` - List educational content
- `GET /api/v1/education/user-progresss/` - Get user progress
- `POST /api/v1/education/user-progresss/` - Update progress
- `GET /api/v1/education/savings-challenges/` - List savings challenges
- `GET /api/v1/education/challenge-participants/` - Get participants
- `GET /api/v1/education/webinars/` - List webinars

#### Example: Start Learning Content
```http
POST /api/v1/education/user-progresss/
Content-Type: application/json

{
  "content": 1,
  "status": "IN_PROGRESS",
  "progress_percentage": 0
}
```

## Common Query Parameters

All list endpoints support the following query parameters:

- `page` - Page number for pagination
- `page_size` - Number of results per page (max 100)
- `ordering` - Field to order by (prefix with `-` for descending)
- `search` - Search query (where applicable)

Example:
```http
GET /api/v1/mpesa/transactions/?page=1&page_size=20&ordering=-created_at&search=254712
```

## Response Format

### Success Response
```json
{
  "count": 100,
  "next": "http://api.example.com/api/v1/resource/?page=2",
  "previous": null,
  "results": [...]
}
```

### Error Response
```json
{
  "detail": "Error message",
  "errors": {
    "field_name": ["Error description"]
  }
}
```

## Status Codes

- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `204 No Content` - Successful deletion
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

## Rate Limiting

API endpoints are rate-limited to:
- 1000 requests per hour for authenticated users
- 100 requests per hour for unauthenticated endpoints

## Interactive API Documentation

Access interactive API documentation at:
- Swagger UI: `http://localhost:8000/api/docs/`
- ReDoc: `http://localhost:8000/api/redoc/`
- OpenAPI Schema: `http://localhost:8000/api/schema/`

## Support

For API support, contact:
- Email: api-support@chamahub.com
- Documentation: https://docs.chamahub.com
- GitHub Issues: https://github.com/MachariaP/ProDev-Backend/issues