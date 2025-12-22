// Mock Education Service for Education Hub
// This provides mocked data for the simplified education interface

export interface EducationalContent {
  id: number;
  title: string;
  slug: string;
  content_type: 'ARTICLE' | 'VIDEO';
  category: 'SAVINGS' | 'INVESTMENTS' | 'LOANS' | 'BUDGETING' | 'GROUP_MANAGEMENT';
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  description: string;
  content: string; // HTML content for articles
  video_url?: string; // For video content
  thumbnail_url: string;
  duration_minutes: number;
  is_published: boolean;
  is_featured: boolean;
  views_count: number;
  published_at: string; // ISO date
  created_at: string; // ISO date
  updated_at: string; // ISO date
}

export interface LearningPath {
  id: number;
  title: string;
  slug: string;
  description: string;
  contents: EducationalContent[];
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  is_published: boolean;
  is_featured: boolean;
  total_duration_minutes: number;
  created_at: string;
  updated_at: string;
}

export interface UserProgress {
  id: number;
  user_id: number;
  content_id: number;
  status: 'VIEWED' | 'COMPLETED';
  bookmarked: boolean;
  viewed_at: string;
}

export interface DashboardStats {
  total_content: number;
  total_learning_paths: number;
  total_views: number;
  featured_content: EducationalContent[];
  recent_content: EducationalContent[];
  user_stats?: {
    completed_content: number;
    in_progress_content: number;
    bookmarked_content: number;
    total_learning_time: number;
  };
}

export interface FilterOptions {
  category?: string;
  difficulty?: string;
  content_type?: string;
  is_featured?: boolean;
  search?: string;
}

// Mock Content Data - At least 20 items covering all categories
const mockContent: EducationalContent[] = [
  // SAVINGS (4 items)
  {
    id: 1,
    title: "5 Basic Rules for Chama Savings",
    slug: "5-basic-rules-chama-savings",
    content_type: "ARTICLE",
    category: "SAVINGS",
    difficulty: "BEGINNER",
    description: "Learn the fundamental rules every chama member should know about saving money effectively.",
    content: `
      <h2>Introduction to Chama Savings</h2>
      <p>Chamas are powerful tools for financial growth and community support. Understanding the basic rules of saving within a chama can help you maximize your benefits and achieve your financial goals faster.</p>
      
      <h3>Rule 1: Consistency is Key</h3>
      <p>Regular contributions, no matter how small, build significant wealth over time. Set up automatic transfers to ensure you never miss a contribution.</p>
      
      <h3>Rule 2: Emergency Fund First</h3>
      <p>Before investing in high-risk ventures, ensure your chama has an emergency fund covering at least 3-6 months of expenses.</p>
      
      <h3>Rule 3: Diversify Your Savings</h3>
      <p>Don't put all your money in one place. Spread your savings across different types of accounts and investments.</p>
      
      <h3>Rule 4: Set Clear Goals</h3>
      <p>Define specific, measurable savings goals for your chama. This helps maintain motivation and accountability.</p>
      
      <h3>Rule 5: Review and Adjust</h3>
      <p>Regularly review your savings progress and adjust your strategy as needed. Life circumstances change, and your savings plan should adapt accordingly.</p>
      
      <h3>Conclusion</h3>
      <p>By following these five basic rules, your chama can build a strong financial foundation and achieve collective prosperity.</p>
    `,
    thumbnail_url: "https://images.unsplash.com/photo-1579621970795-87facc2f976d?w=400",
    duration_minutes: 5,
    is_published: true,
    is_featured: true,
    views_count: 1245,
    published_at: "2024-01-15T10:00:00Z",
    created_at: "2024-01-10T08:00:00Z",
    updated_at: "2024-01-14T09:00:00Z"
  },
  {
    id: 2,
    title: "How to Set Realistic Savings Goals",
    slug: "how-to-set-realistic-savings-goals",
    content_type: "VIDEO",
    category: "SAVINGS",
    difficulty: "BEGINNER",
    description: "A step-by-step guide to setting achievable savings targets for your chama.",
    content: "",
    video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnail_url: "https://images.unsplash.com/photo-1554224311-beee415c201f?w=400",
    duration_minutes: 8,
    is_published: true,
    is_featured: false,
    views_count: 892,
    published_at: "2024-01-20T10:00:00Z",
    created_at: "2024-01-15T08:00:00Z",
    updated_at: "2024-01-19T09:00:00Z"
  },
  {
    id: 3,
    title: "Emergency Funds: Why Your Chama Needs One",
    slug: "emergency-funds-why-your-chama-needs-one",
    content_type: "ARTICLE",
    category: "SAVINGS",
    difficulty: "INTERMEDIATE",
    description: "Understanding the importance of maintaining an emergency fund for unexpected expenses.",
    content: `
      <h2>The Importance of Emergency Funds</h2>
      <p>Every successful chama needs a safety net. An emergency fund protects your group from unexpected financial shocks and ensures continuity of operations.</p>
      
      <h3>What is an Emergency Fund?</h3>
      <p>An emergency fund is a dedicated pool of money set aside specifically for unexpected expenses or financial emergencies.</p>
      
      <h3>How Much Should You Save?</h3>
      <p>Financial experts recommend 3-6 months' worth of operating expenses. For a chama, this should cover member emergencies, loan defaults, and operational costs.</p>
      
      <h3>Building Your Emergency Fund</h3>
      <ul>
        <li>Start with small, regular contributions</li>
        <li>Allocate a percentage of all income to the fund</li>
        <li>Keep it in a liquid, accessible account</li>
        <li>Don't invest emergency funds in high-risk ventures</li>
      </ul>
      
      <h3>When to Use Your Emergency Fund</h3>
      <p>Only use emergency funds for genuine emergencies: medical bills, sudden job loss, urgent repairs, or member hardship.</p>
    `,
    thumbnail_url: "https://images.unsplash.com/photo-1556155092-8707de31f9c4?w=400",
    duration_minutes: 7,
    is_published: true,
    is_featured: true,
    views_count: 1543,
    published_at: "2024-01-25T10:00:00Z",
    created_at: "2024-01-20T08:00:00Z",
    updated_at: "2024-01-24T09:00:00Z"
  },
  {
    id: 4,
    title: "High-Yield Savings Options for Chamas",
    slug: "high-yield-savings-options-for-chamas",
    content_type: "ARTICLE",
    category: "SAVINGS",
    difficulty: "ADVANCED",
    description: "Explore advanced savings strategies and high-yield options available to chamas.",
    content: `
      <h2>Maximizing Returns on Chama Savings</h2>
      <p>Once your chama has established a solid foundation, it's time to explore high-yield savings options that can accelerate wealth building.</p>
      
      <h3>Money Market Funds</h3>
      <p>These offer higher interest rates than regular savings accounts while maintaining liquidity. Ideal for short-term savings goals.</p>
      
      <h3>Fixed Deposits</h3>
      <p>Lock in funds for a specific period to earn guaranteed higher returns. Best for funds you won't need immediately.</p>
      
      <h3>Treasury Bills</h3>
      <p>Government securities offering competitive returns with minimal risk. Maturities range from 91 to 364 days.</p>
      
      <h3>Considerations</h3>
      <ul>
        <li>Balance risk and return</li>
        <li>Maintain adequate liquidity</li>
        <li>Diversify across multiple instruments</li>
        <li>Consider tax implications</li>
      </ul>
    `,
    thumbnail_url: "https://images.unsplash.com/photo-1559526324-593bc073d938?w=400",
    duration_minutes: 10,
    is_published: true,
    is_featured: false,
    views_count: 687,
    published_at: "2024-02-01T10:00:00Z",
    created_at: "2024-01-25T08:00:00Z",
    updated_at: "2024-01-31T09:00:00Z"
  },

  // INVESTMENTS (4 items)
  {
    id: 5,
    title: "Understanding Investment Risks",
    slug: "understanding-investment-risks",
    content_type: "VIDEO",
    category: "INVESTMENTS",
    difficulty: "BEGINNER",
    description: "Learn about different types of investment risks and how to manage them.",
    content: "",
    video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnail_url: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400",
    duration_minutes: 12,
    is_published: true,
    is_featured: true,
    views_count: 1876,
    published_at: "2024-02-05T10:00:00Z",
    created_at: "2024-02-01T08:00:00Z",
    updated_at: "2024-02-04T09:00:00Z"
  },
  {
    id: 6,
    title: "Real Estate Investment Basics",
    slug: "real-estate-investment-basics",
    content_type: "ARTICLE",
    category: "INVESTMENTS",
    difficulty: "INTERMEDIATE",
    description: "A comprehensive guide to getting started with real estate investments as a chama.",
    content: `
      <h2>Real Estate Investment for Chamas</h2>
      <p>Real estate can be an excellent long-term investment for chamas, providing both regular income and capital appreciation.</p>
      
      <h3>Why Real Estate?</h3>
      <ul>
        <li>Tangible asset with intrinsic value</li>
        <li>Potential for rental income</li>
        <li>Long-term capital appreciation</li>
        <li>Hedge against inflation</li>
      </ul>
      
      <h3>Types of Real Estate Investments</h3>
      <p><strong>Residential Property:</strong> Houses, apartments for rental income</p>
      <p><strong>Commercial Property:</strong> Office spaces, retail shops</p>
      <p><strong>Land:</strong> Raw land for future development</p>
      
      <h3>Getting Started</h3>
      <ol>
        <li>Conduct thorough market research</li>
        <li>Secure proper legal documentation</li>
        <li>Consider location and growth potential</li>
        <li>Factor in all costs (taxes, maintenance, etc.)</li>
      </ol>
    `,
    thumbnail_url: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400",
    duration_minutes: 15,
    is_published: true,
    is_featured: true,
    views_count: 2134,
    published_at: "2024-02-10T10:00:00Z",
    created_at: "2024-02-05T08:00:00Z",
    updated_at: "2024-02-09T09:00:00Z"
  },
  {
    id: 7,
    title: "Stock Market for Beginners",
    slug: "stock-market-for-beginners",
    content_type: "VIDEO",
    category: "INVESTMENTS",
    difficulty: "INTERMEDIATE",
    description: "An introduction to stock market investing for chama groups.",
    content: "",
    video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnail_url: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400",
    duration_minutes: 18,
    is_published: true,
    is_featured: false,
    views_count: 1432,
    published_at: "2024-02-15T10:00:00Z",
    created_at: "2024-02-10T08:00:00Z",
    updated_at: "2024-02-14T09:00:00Z"
  },
  {
    id: 8,
    title: "Diversifying Your Chama Portfolio",
    slug: "diversifying-your-chama-portfolio",
    content_type: "ARTICLE",
    category: "INVESTMENTS",
    difficulty: "ADVANCED",
    description: "Advanced strategies for creating a well-diversified investment portfolio.",
    content: `
      <h2>Portfolio Diversification Strategies</h2>
      <p>Don't put all your eggs in one basket. Learn how to spread investment risk across different asset classes.</p>
      
      <h3>Asset Allocation</h3>
      <p>The process of dividing investments among different asset categories:</p>
      <ul>
        <li>Equities (stocks)</li>
        <li>Fixed income (bonds)</li>
        <li>Real estate</li>
        <li>Cash and equivalents</li>
        <li>Alternative investments</li>
      </ul>
      
      <h3>Geographic Diversification</h3>
      <p>Consider both local and international investments to reduce country-specific risks.</p>
      
      <h3>Sector Diversification</h3>
      <p>Invest across different industries: technology, healthcare, finance, agriculture, etc.</p>
      
      <h3>Rebalancing</h3>
      <p>Regularly review and adjust your portfolio to maintain desired asset allocation.</p>
    `,
    thumbnail_url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400",
    duration_minutes: 12,
    is_published: true,
    is_featured: false,
    views_count: 892,
    published_at: "2024-02-20T10:00:00Z",
    created_at: "2024-02-15T08:00:00Z",
    updated_at: "2024-02-19T09:00:00Z"
  },

  // LOANS (4 items)
  {
    id: 9,
    title: "Responsible Lending in Chamas",
    slug: "responsible-lending-in-chamas",
    content_type: "ARTICLE",
    category: "LOANS",
    difficulty: "BEGINNER",
    description: "Best practices for managing loans within your chama group.",
    content: `
      <h2>Responsible Lending Practices</h2>
      <p>Lending within a chama can strengthen the group while helping members achieve their goals. However, it requires careful management.</p>
      
      <h3>Establishing Loan Policies</h3>
      <ul>
        <li>Clear eligibility criteria</li>
        <li>Maximum loan amounts based on savings</li>
        <li>Interest rates and repayment terms</li>
        <li>Consequences for default</li>
      </ul>
      
      <h3>Assessment Process</h3>
      <p>Evaluate each loan application based on:</p>
      <ul>
        <li>Member's contribution history</li>
        <li>Purpose of the loan</li>
        <li>Ability to repay</li>
        <li>Available collateral or guarantors</li>
      </ul>
      
      <h3>Protecting the Group</h3>
      <p>Implement safeguards to protect the chama's interests while supporting members in need.</p>
    `,
    thumbnail_url: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400",
    duration_minutes: 8,
    is_published: true,
    is_featured: true,
    views_count: 1654,
    published_at: "2024-02-25T10:00:00Z",
    created_at: "2024-02-20T08:00:00Z",
    updated_at: "2024-02-24T09:00:00Z"
  },
  {
    id: 10,
    title: "Loan Application Process",
    slug: "loan-application-process",
    content_type: "VIDEO",
    category: "LOANS",
    difficulty: "BEGINNER",
    description: "Step-by-step guide through the chama loan application process.",
    content: "",
    video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnail_url: "https://images.unsplash.com/photo-1554224311-beee415c201f?w=400",
    duration_minutes: 10,
    is_published: true,
    is_featured: false,
    views_count: 987,
    published_at: "2024-03-01T10:00:00Z",
    created_at: "2024-02-25T08:00:00Z",
    updated_at: "2024-02-28T09:00:00Z"
  },
  {
    id: 11,
    title: "Interest Rate Calculations",
    slug: "interest-rate-calculations",
    content_type: "ARTICLE",
    category: "LOANS",
    difficulty: "INTERMEDIATE",
    description: "Understanding how to calculate and apply interest rates on chama loans.",
    content: `
      <h2>Understanding Interest Rates</h2>
      <p>Learn how to calculate fair interest rates that benefit both borrowers and the chama.</p>
      
      <h3>Simple vs Compound Interest</h3>
      <p><strong>Simple Interest:</strong> Calculated only on the principal amount</p>
      <p>Formula: I = P × r × t</p>
      
      <p><strong>Compound Interest:</strong> Calculated on principal plus accumulated interest</p>
      <p>Formula: A = P(1 + r/n)^(nt)</p>
      
      <h3>Reducing Balance Method</h3>
      <p>Interest calculated on the outstanding balance, common for chama loans.</p>
      
      <h3>Setting Fair Rates</h3>
      <ul>
        <li>Consider market rates</li>
        <li>Factor in default risk</li>
        <li>Balance member needs with chama sustainability</li>
        <li>Review and adjust periodically</li>
      </ul>
    `,
    thumbnail_url: "https://images.unsplash.com/photo-1554224311-beee415c201f?w=400",
    duration_minutes: 12,
    is_published: true,
    is_featured: false,
    views_count: 743,
    published_at: "2024-03-05T10:00:00Z",
    created_at: "2024-03-01T08:00:00Z",
    updated_at: "2024-03-04T09:00:00Z"
  },
  {
    id: 12,
    title: "Managing Default Risks",
    slug: "managing-default-risks",
    content_type: "ARTICLE",
    category: "LOANS",
    difficulty: "ADVANCED",
    description: "Advanced strategies for minimizing and managing loan defaults in your chama.",
    content: `
      <h2>Default Risk Management</h2>
      <p>Protect your chama's funds while maintaining member relationships through effective default risk management.</p>
      
      <h3>Prevention Strategies</h3>
      <ul>
        <li>Thorough vetting process</li>
        <li>Reasonable loan limits</li>
        <li>Guarantor requirements</li>
        <li>Financial literacy training</li>
      </ul>
      
      <h3>Early Warning Signs</h3>
      <p>Monitor for indicators of potential default:</p>
      <ul>
        <li>Missed payments</li>
        <li>Requests for extensions</li>
        <li>Changes in financial circumstances</li>
      </ul>
      
      <h3>Response Procedures</h3>
      <p>Develop clear procedures for handling defaults that balance firmness with compassion.</p>
      
      <h3>Recovery Options</h3>
      <ul>
        <li>Restructuring repayment terms</li>
        <li>Activating guarantees</li>
        <li>Asset recovery</li>
        <li>Legal action (last resort)</li>
      </ul>
    `,
    thumbnail_url: "https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?w=400",
    duration_minutes: 15,
    is_published: true,
    is_featured: true,
    views_count: 1234,
    published_at: "2024-03-10T10:00:00Z",
    created_at: "2024-03-05T08:00:00Z",
    updated_at: "2024-03-09T09:00:00Z"
  },

  // BUDGETING (4 items)
  {
    id: 13,
    title: "Creating Your First Chama Budget",
    slug: "creating-your-first-chama-budget",
    content_type: "ARTICLE",
    category: "BUDGETING",
    difficulty: "BEGINNER",
    description: "A beginner's guide to creating an effective budget for your chama.",
    content: `
      <h2>Budgeting Basics for Chamas</h2>
      <p>A well-planned budget is the foundation of successful chama management. Learn how to create one that works.</p>
      
      <h3>Why Budget?</h3>
      <ul>
        <li>Track income and expenses</li>
        <li>Plan for future goals</li>
        <li>Prevent overspending</li>
        <li>Ensure sustainability</li>
      </ul>
      
      <h3>Budget Components</h3>
      <p><strong>Income:</strong></p>
      <ul>
        <li>Member contributions</li>
        <li>Loan interest</li>
        <li>Investment returns</li>
        <li>Penalties and fees</li>
      </ul>
      
      <p><strong>Expenses:</strong></p>
      <ul>
        <li>Operational costs</li>
        <li>Meeting expenses</li>
        <li>Emergency fund allocation</li>
        <li>Administrative costs</li>
      </ul>
      
      <h3>Creating Your Budget</h3>
      <ol>
        <li>Review past financial data</li>
        <li>Project income for the period</li>
        <li>List all expected expenses</li>
        <li>Allocate funds by priority</li>
        <li>Include contingency reserves</li>
      </ol>
    `,
    thumbnail_url: "https://images.unsplash.com/photo-1554224311-beee415c201f?w=400",
    duration_minutes: 9,
    is_published: true,
    is_featured: true,
    views_count: 1876,
    published_at: "2024-03-15T10:00:00Z",
    created_at: "2024-03-10T08:00:00Z",
    updated_at: "2024-03-14T09:00:00Z"
  },
  {
    id: 14,
    title: "Monthly vs Quarterly Budgeting",
    slug: "monthly-vs-quarterly-budgeting",
    content_type: "VIDEO",
    category: "BUDGETING",
    difficulty: "INTERMEDIATE",
    description: "Compare different budgeting timeframes and choose what works best for your chama.",
    content: "",
    video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnail_url: "https://images.unsplash.com/photo-1554224311-beee415c201f?w=400",
    duration_minutes: 11,
    is_published: true,
    is_featured: false,
    views_count: 654,
    published_at: "2024-03-20T10:00:00Z",
    created_at: "2024-03-15T08:00:00Z",
    updated_at: "2024-03-19T09:00:00Z"
  },
  {
    id: 15,
    title: "Tracking Expenses with Simple Tools",
    slug: "tracking-expenses-with-simple-tools",
    content_type: "ARTICLE",
    category: "BUDGETING",
    difficulty: "BEGINNER",
    description: "Learn to use simple, effective tools for tracking your chama's expenses.",
    content: `
      <h2>Simple Expense Tracking</h2>
      <p>You don't need expensive software to track expenses effectively. Simple tools can work wonders.</p>
      
      <h3>Manual Methods</h3>
      <p><strong>Notebook Method:</strong> Traditional but effective for small chamas</p>
      <p><strong>Excel Spreadsheets:</strong> Versatile and customizable</p>
      
      <h3>Digital Tools</h3>
      <ul>
        <li>Google Sheets (free, collaborative)</li>
        <li>Mobile banking apps</li>
        <li>Specialized chama management software</li>
      </ul>
      
      <h3>Best Practices</h3>
      <ul>
        <li>Record expenses immediately</li>
        <li>Categorize all transactions</li>
        <li>Keep receipts and documentation</li>
        <li>Review regularly (weekly/monthly)</li>
        <li>Compare actual vs budgeted amounts</li>
      </ul>
      
      <h3>Key Metrics to Track</h3>
      <ul>
        <li>Total expenses by category</li>
        <li>Expense trends over time</li>
        <li>Variance from budget</li>
        <li>Cost per member</li>
      </ul>
    `,
    thumbnail_url: "https://images.unsplash.com/photo-1554224311-beee415c201f?w=400",
    duration_minutes: 7,
    is_published: true,
    is_featured: false,
    views_count: 1123,
    published_at: "2024-03-25T10:00:00Z",
    created_at: "2024-03-20T08:00:00Z",
    updated_at: "2024-03-24T09:00:00Z"
  },
  {
    id: 16,
    title: "Budget Adjustments During Tough Times",
    slug: "budget-adjustments-during-tough-times",
    content_type: "ARTICLE",
    category: "BUDGETING",
    difficulty: "INTERMEDIATE",
    description: "How to adapt your chama budget when facing financial challenges.",
    content: `
      <h2>Adapting to Financial Challenges</h2>
      <p>Economic downturns and unexpected events require flexible budgeting strategies.</p>
      
      <h3>Identifying the Problem</h3>
      <ul>
        <li>Reduced member contributions</li>
        <li>Increased loan defaults</li>
        <li>Lower investment returns</li>
        <li>Unexpected expenses</li>
      </ul>
      
      <h3>Adjustment Strategies</h3>
      <p><strong>Reduce Non-Essential Expenses:</strong></p>
      <ul>
        <li>Postpone non-urgent projects</li>
        <li>Cut discretionary spending</li>
        <li>Find cost-effective alternatives</li>
      </ul>
      
      <p><strong>Increase Revenue:</strong></p>
      <ul>
        <li>Temporary contribution increases</li>
        <li>Special levies for emergencies</li>
        <li>Additional fundraising activities</li>
      </ul>
      
      <h3>Communication is Key</h3>
      <p>Keep members informed about challenges and involve them in solution-finding.</p>
      
      <h3>Building Resilience</h3>
      <p>Use tough times as learning opportunities to build a more robust financial system.</p>
    `,
    thumbnail_url: "https://images.unsplash.com/photo-1579621970795-87facc2f976d?w=400",
    duration_minutes: 10,
    is_published: true,
    is_featured: true,
    views_count: 1456,
    published_at: "2024-03-30T10:00:00Z",
    created_at: "2024-03-25T08:00:00Z",
    updated_at: "2024-03-29T09:00:00Z"
  },

  // GROUP_MANAGEMENT (4 items)
  {
    id: 17,
    title: "Effective Meeting Agendas",
    slug: "effective-meeting-agendas",
    content_type: "ARTICLE",
    category: "GROUP_MANAGEMENT",
    difficulty: "BEGINNER",
    description: "Learn how to create productive meeting agendas that keep your chama on track.",
    content: `
      <h2>Running Effective Chama Meetings</h2>
      <p>Well-structured meetings are essential for productive chama operations. A good agenda is the foundation.</p>
      
      <h3>Why Agendas Matter</h3>
      <ul>
        <li>Keep meetings focused and on-time</li>
        <li>Ensure all important topics are covered</li>
        <li>Allow members to prepare adequately</li>
        <li>Create a record of planned business</li>
      </ul>
      
      <h3>Standard Agenda Items</h3>
      <ol>
        <li>Call to order and attendance</li>
        <li>Approval of previous minutes</li>
        <li>Financial report</li>
        <li>Old business follow-up</li>
        <li>New business</li>
        <li>Announcements</li>
        <li>Adjournment</li>
      </ol>
      
      <h3>Best Practices</h3>
      <ul>
        <li>Distribute agenda in advance</li>
        <li>Allocate time for each item</li>
        <li>Stick to the schedule</li>
        <li>Allow member input on agenda</li>
      </ul>
    `,
    thumbnail_url: "https://images.unsplash.com/photo-1556155092-8707de31f9c4?w=400",
    duration_minutes: 6,
    is_published: true,
    is_featured: true,
    views_count: 1987,
    published_at: "2024-04-05T10:00:00Z",
    created_at: "2024-04-01T08:00:00Z",
    updated_at: "2024-04-04T09:00:00Z"
  },
  {
    id: 18,
    title: "Conflict Resolution Strategies",
    slug: "conflict-resolution-strategies",
    content_type: "VIDEO",
    category: "GROUP_MANAGEMENT",
    difficulty: "INTERMEDIATE",
    description: "Practical approaches to resolving disputes within your chama group.",
    content: "",
    video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnail_url: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=400",
    duration_minutes: 14,
    is_published: true,
    is_featured: true,
    views_count: 1543,
    published_at: "2024-04-10T10:00:00Z",
    created_at: "2024-04-05T08:00:00Z",
    updated_at: "2024-04-09T09:00:00Z"
  },
  {
    id: 19,
    title: "Digital Tools for Chama Management",
    slug: "digital-tools-for-chama-management",
    content_type: "ARTICLE",
    category: "GROUP_MANAGEMENT",
    difficulty: "INTERMEDIATE",
    description: "Explore modern digital solutions that can streamline your chama operations.",
    content: `
      <h2>Embracing Digital Transformation</h2>
      <p>Modern technology offers powerful tools to simplify chama management and improve efficiency.</p>
      
      <h3>Communication Tools</h3>
      <p><strong>WhatsApp Groups:</strong> Instant communication and announcements</p>
      <p><strong>Email Lists:</strong> Formal communications and documentation</p>
      <p><strong>Video Conferencing:</strong> Zoom, Google Meet for remote meetings</p>
      
      <h3>Financial Management</h3>
      <ul>
        <li>Mobile banking apps</li>
        <li>Specialized chama management software</li>
        <li>Cloud-based accounting systems</li>
        <li>Digital payment platforms (M-Pesa, etc.)</li>
      </ul>
      
      <h3>Document Management</h3>
      <ul>
        <li>Google Drive for shared files</li>
        <li>Digital signature tools</li>
        <li>Cloud backup solutions</li>
      </ul>
      
      <h3>Choosing the Right Tools</h3>
      <ul>
        <li>Assess your chama's needs</li>
        <li>Consider ease of use</li>
        <li>Check costs and affordability</li>
        <li>Ensure member accessibility</li>
        <li>Prioritize security features</li>
      </ul>
    `,
    thumbnail_url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400",
    duration_minutes: 13,
    is_published: true,
    is_featured: false,
    views_count: 1234,
    published_at: "2024-04-15T10:00:00Z",
    created_at: "2024-04-10T08:00:00Z",
    updated_at: "2024-04-14T09:00:00Z"
  },
  {
    id: 20,
    title: "Scaling Your Chama Successfully",
    slug: "scaling-your-chama-successfully",
    content_type: "ARTICLE",
    category: "GROUP_MANAGEMENT",
    difficulty: "ADVANCED",
    description: "Strategic approaches to growing your chama while maintaining strong governance.",
    content: `
      <h2>Growing Your Chama</h2>
      <p>As your chama grows, new challenges and opportunities emerge. Learn how to scale effectively.</p>
      
      <h3>Signs You're Ready to Scale</h3>
      <ul>
        <li>Consistently meeting financial goals</li>
        <li>Strong member engagement</li>
        <li>Robust governance structures</li>
        <li>Sustainable financial base</li>
      </ul>
      
      <h3>Growth Strategies</h3>
      <p><strong>Increase Membership:</strong></p>
      <ul>
        <li>Recruitment campaigns</li>
        <li>Referral programs</li>
        <li>Clear membership criteria</li>
      </ul>
      
      <p><strong>Expand Operations:</strong></p>
      <ul>
        <li>New investment opportunities</li>
        <li>Additional services for members</li>
        <li>Strategic partnerships</li>
      </ul>
      
      <h3>Maintaining Quality</h3>
      <p>Growth should never compromise:</p>
      <ul>
        <li>Member relationships</li>
        <li>Financial discipline</li>
        <li>Decision-making quality</li>
        <li>Group cohesion</li>
      </ul>
      
      <h3>Structural Adjustments</h3>
      <p>Larger chamas may need:</p>
      <ul>
        <li>Committees for specific functions</li>
        <li>More formal governance</li>
        <li>Professional management</li>
        <li>Enhanced reporting systems</li>
      </ul>
    `,
    thumbnail_url: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400",
    duration_minutes: 16,
    is_published: true,
    is_featured: true,
    views_count: 987,
    published_at: "2024-04-20T10:00:00Z",
    created_at: "2024-04-15T08:00:00Z",
    updated_at: "2024-04-19T09:00:00Z"
  },
];

// Mock Learning Paths Data
const mockLearningPaths: LearningPath[] = [
  {
    id: 1,
    title: "Beginner's Guide to Chama Management",
    slug: "beginners-guide-chama-management",
    description: "Start your chama journey with these essential lessons covering savings, budgeting, and basic group management principles.",
    contents: [mockContent[0], mockContent[2], mockContent[12], mockContent[16]], // IDs: 1, 3, 13, 17
    difficulty: "BEGINNER",
    is_published: true,
    is_featured: true,
    total_duration_minutes: 28,
    created_at: "2024-01-10T08:00:00Z",
    updated_at: "2024-01-10T08:00:00Z"
  },
  {
    id: 2,
    title: "Smart Investment Strategies",
    slug: "smart-investment-strategies",
    description: "Learn how to grow your chama's wealth through diversified investment approaches and risk management.",
    contents: [mockContent[4], mockContent[5], mockContent[6], mockContent[7]], // IDs: 5, 6, 7, 8
    difficulty: "INTERMEDIATE",
    is_published: true,
    is_featured: true,
    total_duration_minutes: 57,
    created_at: "2024-02-01T08:00:00Z",
    updated_at: "2024-02-01T08:00:00Z"
  },
  {
    id: 3,
    title: "Mastering Chama Loans",
    slug: "mastering-chama-loans",
    description: "Everything you need to know about managing loans within your chama, from applications to default management.",
    contents: [mockContent[8], mockContent[9], mockContent[10], mockContent[11]], // IDs: 9, 10, 11, 12
    difficulty: "INTERMEDIATE",
    is_published: true,
    is_featured: false,
    total_duration_minutes: 45,
    created_at: "2024-02-20T08:00:00Z",
    updated_at: "2024-02-20T08:00:00Z"
  },
  {
    id: 4,
    title: "Financial Planning Essentials",
    slug: "financial-planning-essentials",
    description: "Comprehensive budgeting and financial planning skills for sustainable chama operations.",
    contents: [mockContent[12], mockContent[13], mockContent[14], mockContent[15]], // IDs: 13, 14, 15, 16
    difficulty: "BEGINNER",
    is_published: true,
    is_featured: true,
    total_duration_minutes: 37,
    created_at: "2024-03-10T08:00:00Z",
    updated_at: "2024-03-10T08:00:00Z"
  },
  {
    id: 5,
    title: "Advanced Group Leadership",
    slug: "advanced-group-leadership",
    description: "Develop advanced leadership and management skills to take your chama to the next level.",
    contents: [mockContent[16], mockContent[17], mockContent[18], mockContent[19]], // IDs: 17, 18, 19, 20
    difficulty: "ADVANCED",
    is_published: true,
    is_featured: true,
    total_duration_minutes: 49,
    created_at: "2024-04-01T08:00:00Z",
    updated_at: "2024-04-01T08:00:00Z"
  },
];

// Mock User Progress Data
let mockUserProgress: UserProgress[] = [
  {
    id: 1,
    user_id: 1,
    content_id: 1,
    status: "COMPLETED",
    bookmarked: true,
    viewed_at: "2024-01-16T14:30:00Z"
  },
  {
    id: 2,
    user_id: 1,
    content_id: 5,
    status: "VIEWED",
    bookmarked: false,
    viewed_at: "2024-02-06T10:15:00Z"
  },
  {
    id: 3,
    user_id: 1,
    content_id: 9,
    status: "VIEWED",
    bookmarked: true,
    viewed_at: "2024-02-26T16:45:00Z"
  },
];

// Mock Education Service
export const mockEducationService = {
  // Dashboard
  getDashboardStats: async (): Promise<DashboardStats> => {
    await simulateDelay();
    const featuredContent = mockContent.filter(c => c.is_featured).slice(0, 5);
    const recentContent = [...mockContent].sort((a, b) => 
      new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
    ).slice(0, 6);

    return {
      total_content: mockContent.length,
      total_learning_paths: mockLearningPaths.length,
      total_views: mockContent.reduce((sum, c) => sum + c.views_count, 0),
      featured_content: featuredContent,
      recent_content: recentContent,
      user_stats: {
        completed_content: mockUserProgress.filter(p => p.status === 'COMPLETED').length,
        in_progress_content: mockUserProgress.filter(p => p.status === 'VIEWED').length,
        bookmarked_content: mockUserProgress.filter(p => p.bookmarked).length,
        total_learning_time: 125, // minutes
      }
    };
  },

  // Content
  getContentList: async (filters?: FilterOptions, page: number = 1, pageSize: number = 12): Promise<{
    results: EducationalContent[];
    total: number;
    page: number;
    page_size: number;
  }> => {
    await simulateDelay();
    let filtered = [...mockContent];

    // Apply filters
    if (filters?.category && filters.category !== 'all') {
      filtered = filtered.filter(c => c.category === filters.category);
    }
    if (filters?.difficulty && filters.difficulty !== 'all') {
      filtered = filtered.filter(c => c.difficulty === filters.difficulty);
    }
    if (filters?.content_type && filters.content_type !== 'all') {
      filtered = filtered.filter(c => c.content_type === filters.content_type);
    }
    if (filters?.is_featured !== undefined) {
      filtered = filtered.filter(c => c.is_featured === filters.is_featured);
    }
    if (filters?.search) {
      const query = filters.search.toLowerCase();
      filtered = filtered.filter(c => 
        c.title.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query)
      );
    }

    // Pagination
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const results = filtered.slice(start, end);

    return {
      results,
      total: filtered.length,
      page,
      page_size: pageSize,
    };
  },

  getContentById: async (id: number): Promise<EducationalContent | null> => {
    await simulateDelay();
    const content = mockContent.find(c => c.id === id);
    if (content) {
      // Increment view count
      content.views_count++;
    }
    return content || null;
  },

  getFeaturedContent: async (): Promise<EducationalContent[]> => {
    await simulateDelay();
    return mockContent.filter(c => c.is_featured);
  },

  getRecentContent: async (limit: number = 6): Promise<EducationalContent[]> => {
    await simulateDelay();
    return [...mockContent]
      .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
      .slice(0, limit);
  },

  getRelatedContent: async (contentId: number, limit: number = 5): Promise<EducationalContent[]> => {
    await simulateDelay();
    const content = mockContent.find(c => c.id === contentId);
    if (!content) return [];
    
    return mockContent
      .filter(c => c.id !== contentId && c.category === content.category)
      .slice(0, limit);
  },

  // Learning Paths
  getLearningPaths: async (filters?: { difficulty?: string }): Promise<LearningPath[]> => {
    await simulateDelay();
    let paths = [...mockLearningPaths];
    
    if (filters?.difficulty && filters.difficulty !== 'all') {
      paths = paths.filter(p => p.difficulty === filters.difficulty);
    }
    
    return paths;
  },

  getLearningPathById: async (id: number): Promise<LearningPath | null> => {
    await simulateDelay();
    return mockLearningPaths.find(p => p.id === id) || null;
  },

  // User Actions
  trackView: async (contentId: number): Promise<void> => {
    await simulateDelay();
    const existingProgress = mockUserProgress.find(p => p.content_id === contentId);
    if (!existingProgress) {
      mockUserProgress.push({
        id: mockUserProgress.length + 1,
        user_id: 1,
        content_id: contentId,
        status: "VIEWED",
        bookmarked: false,
        viewed_at: new Date().toISOString(),
      });
    }
  },

  toggleBookmark: async (contentId: number): Promise<{ bookmarked: boolean }> => {
    await simulateDelay();
    let progress = mockUserProgress.find(p => p.content_id === contentId);
    
    if (!progress) {
      // Create new progress entry
      progress = {
        id: mockUserProgress.length + 1,
        user_id: 1,
        content_id: contentId,
        status: "VIEWED",
        bookmarked: true,
        viewed_at: new Date().toISOString(),
      };
      mockUserProgress.push(progress);
      return { bookmarked: true };
    } else {
      progress.bookmarked = !progress.bookmarked;
      return { bookmarked: progress.bookmarked };
    }
  },

  // Progress
  getUserProgress: async (): Promise<UserProgress[]> => {
    await simulateDelay();
    return [...mockUserProgress];
  },

  getProgressForContent: async (contentId: number): Promise<UserProgress | null> => {
    await simulateDelay();
    return mockUserProgress.find(p => p.content_id === contentId) || null;
  },

  markAsCompleted: async (contentId: number): Promise<void> => {
    await simulateDelay();
    const progress = mockUserProgress.find(p => p.content_id === contentId);
    if (progress) {
      progress.status = "COMPLETED";
    } else {
      mockUserProgress.push({
        id: mockUserProgress.length + 1,
        user_id: 1,
        content_id: contentId,
        status: "COMPLETED",
        bookmarked: false,
        viewed_at: new Date().toISOString(),
      });
    }
  },
};

// Helper function to simulate API delay
function simulateDelay(ms: number = 300): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
