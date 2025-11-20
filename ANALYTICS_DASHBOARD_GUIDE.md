# Analytics Dashboard Guide

## Overview
The analytics dashboard provides real-time insights into your Chama group's financial activities, including:
- Contribution trends over time
- Member activity rankings
- Expense category breakdowns
- Monthly growth patterns

## Backend Setup

### API Endpoint
The analytics data is available at:
```
GET /analytics/dashboard/?group_id={group_id}
```

**Authentication Required**: Yes (JWT Bearer token)

### Response Format
```json
{
  "contributions_over_time": [
    {"date": "2025-01-01", "amount": 1000.0},
    ...
  ],
  "member_activity": [
    {"member_name": "John Doe", "transactions": 45},
    ...
  ],
  "category_breakdown": [
    {"name": "OPERATIONAL", "value": 5000.0},
    ...
  ],
  "growth_trends": [
    {"month": "January 2025", "growth": 150000.0},
    ...
  ],
  "generated_at": "2025-11-20T10:00:00Z"
}
```

## Data Generation

### Automatic Generation (Celery)
Analytics data is automatically computed daily at 2:30 AM by the Celery Beat scheduler.

To start the Celery worker:
```bash
celery -A chamahub worker -l info
```

To start the Celery Beat scheduler:
```bash
celery -A chamahub beat -l info
```

### Manual Generation
To manually generate analytics for a specific group:

```python
from analytics_dashboard.tasks import compute_dashboard_for_group
from groups.models import ChamaGroup

group = ChamaGroup.objects.get(id=1)
# Run the task synchronously (for testing)
# Note: In production, use Celery to run this asynchronously
```

Or use Django shell to generate analytics data:
```bash
python manage.py shell
```

```python
from django.utils import timezone
from django.db.models import Sum, Count
from django.db.models.functions import TruncDate
from datetime import timedelta
from groups.models import ChamaGroup
from finance.models import Contribution, Expense
from analytics_dashboard.models import AnalyticsReport

# ... (see implementation in tasks.py)
```

## Frontend Integration

The frontend React component at `chamahub-frontend/src/pages/dashboard/AnalyticsPage.tsx` automatically:

1. Fetches the user's groups
2. Allows selection of a group
3. Requests analytics data for the selected group
4. Displays charts and visualizations

### Required Frontend Setup

1. Ensure the frontend is configured with the correct API URL in `.env`:
```
VITE_API_URL=http://localhost:8000/api/v1
```

2. The user must be authenticated with a valid JWT token stored in localStorage:
- `access_token`: JWT access token
- `refresh_token`: JWT refresh token

## Data Models

### AnalyticsReport
Stores pre-computed analytics data for quick retrieval.

Fields:
- `group`: ForeignKey to ChamaGroup
- `report_type`: Type of report (DASHBOARD_SUMMARY, etc.)
- `report_data`: JSON field containing chart-ready data
- `generated_at`: Timestamp of generation
- `insights`: Optional textual insights
- `recommendations`: Optional recommendations

### Data Sources
- **Contributions Over Time**: Aggregated from `finance.Contribution` model
- **Member Activity**: Count of contributions per member
- **Category Breakdown**: Aggregated from `finance.Expense` model (approved expenses only)
- **Growth Trends**: Monthly sum of contributions

## Testing

Run the analytics dashboard tests:
```bash
python manage.py test analytics_dashboard.tests
```

Test coverage includes:
- Analytics data generation
- Authenticated access
- Unauthorized access prevention
- Parameter validation
- Error handling

## Troubleshooting

### "Analytics are being generated" message
If you see this message, it means:
1. No analytics report exists for the group yet
2. The Celery task hasn't run yet

**Solution**: Run the manual generation command or wait for the nightly Celery Beat task.

### Empty data or zeros
This indicates:
- No contributions or expenses exist for the group
- The date range filter excludes all existing data

**Solution**: Add test data or adjust the date range in `tasks.py`.

### 403 Forbidden error
The user is not a member of the requested group.

**Solution**: Ensure the user has an active membership in the group.

## Security

- All endpoints require authentication
- Users can only access analytics for groups they are members of
- Group membership is verified through the `GroupMembership` model with `status='ACTIVE'`
- No sensitive data is exposed beyond what the user already has access to

## Performance Considerations

- Analytics data is pre-computed and cached in the database
- Heavy computation is done asynchronously via Celery
- API responses are fast (fetching from database, not computing on-the-fly)
- Consider setting up caching (Redis) for frequently accessed analytics

## Future Enhancements

Potential improvements:
1. Add more chart types (scatter plots, heat maps)
2. Implement real-time updates via WebSockets
3. Add export functionality (PDF, Excel)
4. Include AI-powered insights and predictions
5. Add customizable date ranges
6. Implement comparison between multiple groups
7. Add drill-down capabilities for detailed analysis
