# Investment Portfolio Page Documentation

## Overview
The Investment Portfolio page (`/investments/portfolio`) provides a comprehensive view of all group investments with analytics, visualizations, and detailed tracking.

## URL
- **Frontend**: `http://localhost:5173/investments/portfolio`
- **Production**: `https://your-domain.com/investments/portfolio`

## Features

### 1. Portfolio Statistics Dashboard
Four key performance indicator (KPI) cards displaying:
- **Total Invested**: Sum of all principal amounts across investments
- **Current Value**: Current total value of the portfolio
- **Total Returns**: Total profit or loss (KES)
- **Average ROI**: Average return on investment percentage

### 2. Portfolio Distribution Visualization
- Interactive pie chart showing investment allocation by type
- Color-coded segments for different investment types:
  - Treasury Bills
  - Fixed Deposits
  - Money Market Funds
  - Stocks/Shares
  - Bonds
  - Real Estate
  - Other
- Displays both percentage and monetary values
- Legend with investment type breakdown

### 3. Investment List
Displays all active investments with:
- Investment name and type
- Principal amount invested
- Current value
- Returns (profit/loss) in KES
- ROI percentage
- Maturity date
- Status badge (Active, Matured, Sold, Cancelled)
- "View Details" button for each investment

### 4. Performance Overview Chart
- Area chart visualization showing:
  - Current value trend
  - Returns over time
- Interactive tooltips with detailed information
- Responsive design adapting to screen size

### 5. Navigation & Actions
- **Back Button**: Returns to main Investments page
- **New Investment Button**: Navigate to create a new investment
- **View Details**: Examine individual investment details

## Technical Implementation

### Frontend Component
**File**: `chamahub-frontend/src/pages/financial/InvestmentPortfolioPage.tsx`

**Key Technologies**:
- React with TypeScript
- Framer Motion for animations
- Recharts for data visualization
- Tailwind CSS for styling

**State Management**:
- `investments`: Array of investment objects
- `loading`: Loading state indicator
- `stats`: Calculated portfolio statistics

**Data Flow**:
1. Component mounts and calls `fetchInvestments()`
2. API request to `/api/v1/investments/investments/`
3. Data transformation and statistics calculation
4. Rendering with animations and visualizations

### Backend API

**Endpoint**: `/api/v1/investments/investments/`

**Method**: `GET`

**Response Structure**:
```json
{
  "results": [
    {
      "id": 1,
      "name": "Treasury Bill 91-Day",
      "investment_type": "TREASURY_BILL",
      "principal_amount": "100000.00",
      "current_value": "102500.00",
      "roi": 2.5,
      "profit_loss": "2500.00",
      "maturity_date": "2024-03-15",
      "status": "ACTIVE",
      "group": 1,
      "group_name": "Savings Group",
      "purchase_date": "2023-12-15",
      "expected_return_rate": "10.00"
    }
  ]
}
```

**Model**: `investments.models.Investment`

**Serializer**: `investments.serializers.InvestmentSerializer`

**Calculated Fields**:
- `roi`: Return on Investment percentage (property)
- `profit_loss`: Current value minus principal amount (property)

### Database Schema

**Table**: `investments_investment`

**Key Fields**:
- `id`: Primary key
- `group_id`: Foreign key to ChamaGroup
- `investment_type`: Choice field (Treasury Bill, Stocks, Bonds, etc.)
- `name`: Investment name
- `description`: Investment description
- `principal_amount`: Initial investment amount (Decimal)
- `current_value`: Current market value (Decimal)
- `expected_return_rate`: Expected annual return (%)
- `purchase_date`: Date of investment
- `maturity_date`: Maturity date (nullable)
- `status`: Choice field (Active, Matured, Sold, Cancelled)
- `certificate`: File upload for investment certificate
- `created_by_id`: Foreign key to User
- `created_at`: Timestamp
- `updated_at`: Timestamp
- `notes`: Additional notes

## User Guide

### Viewing Your Portfolio
1. Navigate to the Investments section from the dashboard
2. Click on "Portfolio" or visit `/investments/portfolio` directly
3. View your portfolio statistics at the top
4. Scroll down to see investment distribution and individual investments
5. Check the performance chart for trend analysis

### Creating a New Investment
1. Click the "New Investment" button on the portfolio page
2. Fill in the investment details:
   - Investment type
   - Name and description
   - Principal amount
   - Expected return rate
   - Purchase and maturity dates
3. Upload investment certificate (optional)
4. Submit to create the investment

### Viewing Investment Details
1. Locate the investment in the list
2. Click the "View" button
3. See detailed information including:
   - Full investment details
   - Transaction history
   - Performance metrics
   - Related documents

## Empty States

### No Investments
When no investments exist, the page displays:
- Empty state message
- Call-to-action button to create first investment
- Helpful text encouraging users to start investing

### Loading State
While data is being fetched:
- Centered spinner animation
- "Loading portfolio..." message
- Gradient background for visual appeal

## Responsive Design

### Desktop (≥1024px)
- Four-column statistics grid
- Three-column chart layout
- Full-width performance chart

### Tablet (768px - 1023px)
- Two-column statistics grid
- Two-column chart layout
- Adjusted chart heights

### Mobile (<768px)
- Single-column layout
- Stacked statistics cards
- Full-width charts
- Touch-optimized interactions

## Animations

### Page Load
- Fade in with slight upward motion
- Staggered animation for different sections
- Smooth transitions

### Interactions
- Hover effects on cards and buttons
- Scale animations on button press
- Chart tooltips with smooth transitions

## Error Handling

### API Errors
- Caught in try-catch block
- Logged to console
- User-friendly error state (to be enhanced)

### Data Validation
- Type checking with TypeScript
- Fallback to empty arrays/default values
- Safe navigation operators

## Performance Considerations

### Optimization Techniques
- Lazy loading of charts
- Memoization of calculated values
- Efficient re-renders with React hooks
- Responsive image loading

### Bundle Size
- Tree-shaking enabled
- Code splitting for better loading times
- Optimized dependencies

## Security

### Authentication
- Requires valid JWT token
- Redirects to login if not authenticated
- Token refresh on expiration

### Authorization
- Users can only see investments for their groups
- Backend filtering by group membership
- Role-based access control

## Testing

### Manual Testing Checklist
- [ ] Page loads without errors
- [ ] Statistics calculate correctly
- [ ] Charts render properly
- [ ] Navigation buttons work
- [ ] Responsive design on all devices
- [ ] Loading states display correctly
- [ ] Empty states show appropriate messages
- [ ] API integration works as expected

### Test Data Setup
1. Create a test group
2. Add sample investments with varying:
   - Investment types
   - Amounts
   - Dates
   - Status values
3. Verify calculations are accurate
4. Test edge cases (0 investments, large numbers, etc.)

## Troubleshooting

### Common Issues

**Problem**: Page shows empty state despite having investments
- **Solution**: Check group membership, verify API endpoint is accessible

**Problem**: Charts not rendering
- **Solution**: Ensure Recharts is installed, check console for errors

**Problem**: Statistics showing incorrect values
- **Solution**: Verify backend is returning correct calculated fields

**Problem**: Loading state never completes
- **Solution**: Check network tab for API errors, verify backend is running

## Future Enhancements

### Potential Features
- Export portfolio to PDF/Excel
- Investment comparison tools
- Historical performance tracking
- Investment recommendations
- Alerts for maturity dates
- Integration with financial markets for real-time values
- Multi-currency support
- Tax reporting features

## Related Pages

- **Investments List** (`/investments`): Main investments page
- **New Investment** (`/investments/new`): Create new investment
- **Investment Detail** (`/investments/:id`): Individual investment view
- **Wealth Engine** (`/wealth-engine`): AI-powered investment recommendations

## API Documentation

For complete API documentation, visit:
- Swagger UI: `http://localhost:8000/api/docs/`
- ReDoc: `http://localhost:8000/api/redoc/`

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the code comments in the component file
3. Consult the API documentation
4. Contact the development team
