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

### Automatic Generation on First Access (NEW!)
**Analytics are now automatically generated when you first access the dashboard!**

When you visit the analytics page and no data exists for your group, the backend will:
1. Automatically compute analytics data in real-time
2. Store it in the database for future fast access
3. Return the data immediately to display charts

This means you no longer need to wait for Celery to run or manually generate analytics!

### Automatic Generation (Celery)
Analytics data is also automatically computed daily at 2:30 AM by the Celery Beat scheduler for all groups.

To start the Celery worker:
```bash
celery -A chamahub worker -l info
```

To start the Celery Beat scheduler:
```bash
celery -A chamahub beat -l info
```

### Manual Generation
To manually generate analytics for a specific group, use the management command:

**Generate analytics for all groups:**
```bash
python manage.py generate_analytics --all
```

**Generate analytics for a specific group:**
```bash
python manage.py generate_analytics --group-id 1
```

The command will show progress as it generates analytics:
```
Generating analytics for 15 groups...
✓ Generated analytics for: Umoja Savings Group (ID: 1)
✓ Generated analytics for: Harambee Investment Club (ID: 2)
...
Done! Analytics data has been generated.
```

**Note**: You can also use Django shell to generate analytics programmatically (advanced):
```bash
python manage.py shell
```

```python
from analytics_dashboard.tasks import compute_dashboard_for_group

# Generate for a specific group
compute_dashboard_for_group(group_id=1)
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
**This issue has been fixed!** Analytics are now automatically generated on first access.

If analytics haven't been generated yet:
1. **Automatic Generation**: Simply access the analytics page - analytics will be generated automatically on your first visit
2. **Manual Generation**: Use the management command for immediate generation:
   ```bash
   # Generate analytics for all groups
   python manage.py generate_analytics --all
   
   # Generate analytics for a specific group
   python manage.py generate_analytics --group-id 1
   ```

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
