"""
Comprehensive database seeding script for ProDev-Backend.
This script seeds all necessary data across all apps in the system.

Usage:
    python seed_all_data.py
    
Note: This script requires interactive input and cannot be used with shell redirection.
For non-interactive seeding, use the Django management commands:
    python manage.py seed_data
    python manage.py seed_investments
"""

import os
import sys
import django
import random
from decimal import Decimal
from datetime import timedelta, date
from django.utils import timezone

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'chamahub.settings')
django.setup()

from django.contrib.auth import get_user_model
from accounts.models import MemberWallet, PasswordResetToken
from groups.models import ChamaGroup, GroupMembership, GroupOfficial, GroupGoal, GroupMessage
from finance.models import Contribution, Loan, LoanRepayment, Expense, DisbursementApproval, ApprovalSignature
from investments.models import Investment, InvestmentTransaction, StockHolding, Portfolio
from gamification.models import MemberAchievement, ContributionStreak, Leaderboard, RewardPoints
from mpesa_integration.models import MPesaTransaction, MPesaBulkPayment, PaymentReconciliation
from education_hub.models import (
    EducationalContent, UserProgress, SavingsChallenge, ChallengeParticipant, 
    Webinar, LearningPath, LearningPathContent, LearningPathEnrollment, 
    ContentCompletion, Certificate, Achievement, UserAchievement, 
    WebinarRegistration, WebinarQnA
)
from governance.models import GroupConstitution, Fine, Vote, VoteBallot, Document, ComplianceRecord
from audit_trail.models import AuditLog, ComplianceReport, SuspiciousActivityAlert
from ai_assistant.models import ChatConversation, ChatMessage, FinancialAdvice
from notifications.models import Notification
from wealth_engine.models import InvestmentRecommendation, PortfolioRebalance

User = get_user_model()

# Constants for calculations
MONTHS_PER_YEAR = 12
DUMMY_CHECKSUM = 'a' * 64  # Placeholder checksum for audit logs


class DataSeeder:
    """Main seeding class for all database models."""
    
    def __init__(self):
        self.users = []
        self.groups = []
        self.memberships = []
        
    def seed_all(self):
        """Seed all data in the correct order."""
        print("=" * 80)
        print("STARTING COMPREHENSIVE DATABASE SEEDING")
        print("=" * 80)
        
        # Clear existing data (optional)
        self.clear_data()
        
        # Core data
        print("\n[1/13] Seeding Users and Wallets...")
        self.seed_users()
        
        print("[2/13] Seeding Groups and Memberships...")
        self.seed_groups()
        
        # Financial data
        print("[3/13] Seeding Contributions, Loans, and Expenses...")
        self.seed_finance()
        
        print("[4/13] Seeding Investments and Portfolios...")
        self.seed_investments()
        
        # Engagement data
        print("[5/13] Seeding Gamification Data...")
        self.seed_gamification()
        
        print("[6/13] Seeding M-Pesa Transactions...")
        self.seed_mpesa()
        
        print("[7/13] Seeding Education Hub Content (Enhanced)...")
        self.seed_education()
        
        print("[8/13] Seeding Governance Data...")
        self.seed_governance()
        
        print("[9/13] Seeding Audit Trail...")
        self.seed_audit_trail()
        
        print("[10/13] Seeding AI Assistant Data...")
        self.seed_ai_assistant()
        
        print("[11/13] Seeding Notifications...")
        self.seed_notifications()
        
        print("[12/13] Seeding Wealth Engine Data...")
        self.seed_wealth_engine()
        
        print("[13/13] Creating Summary Statistics...")
        self.print_summary()
        
        print("\n" + "=" * 80)
        print("DATABASE SEEDING COMPLETED SUCCESSFULLY!")
        print("=" * 80)
    
    def clear_data(self):
        """Clear existing data (be careful with this!)."""
        response = input("\n⚠️  Clear existing data? (yes/no): ")
        if response.lower() == 'yes':
            print("Clearing existing data...")
            User.objects.filter(is_superuser=False).delete()
            print("✓ Existing data cleared")
        else:
            print("✓ Keeping existing data")
    
    # ========================================================================
    # USERS AND ACCOUNTS
    # ========================================================================
    
    def seed_users(self):
        """Create users with wallets."""
        # African first names
        first_names = [
            'Amara', 'Kwame', 'Zuri', 'Kofi', 'Nia', 'Jabari', 'Aisha', 'Chinua',
            'Fatima', 'Themba', 'Zola', 'Kamau', 'Makena', 'Sekou', 'Thandiwe', 'Bandele',
            'Chiamaka', 'Otieno', 'Wanjiru', 'Muthoni', 'Akosua', 'Adwoa', 'Yaa', 'Kojo',
            'Nana', 'Kweku', 'Abena', 'Imani', 'Naledi', 'Sipho', 'Thabo', 'Lerato',
            'Nomsa', 'Zanele', 'Mandla', 'Precious', 'Chidi', 'Ngozi', 'Emeka', 'Chioma',
            'Ade', 'Bayo', 'Dayo', 'Folake', 'Ife', 'Kemi', 'Lola', 'Ola', 'Sade', 'Tunde'
        ]
        
        # African last names
        last_names = [
            'Okonkwo', 'Mwangi', 'Ndlovu', 'Mensah', 'Diop', 'Hassan', 'Kamara', 'Okeke',
            'Nkosi', 'Traore', 'Kenyatta', 'Abiola', 'Mutua', 'Moyo', 'Banda', 'Phiri',
            'Okoth', 'Wafula', 'Nyambura', 'Kipchoge', 'Adeyemi', 'Oluwaseun', 'Chebet', 'Rotich',
            'Kiplagat', 'Kiprono', 'Juma', 'Otieno', 'Achieng', 'Onyango', 'Owino', 'Awuor',
            'Odhiambo', 'Ouma', 'Adhiambo', 'Akinyi', 'Ababio', 'Acquah', 'Adjei', 'Afful',
            'Boateng', 'Darko', 'Essien', 'Frimpong', 'Gyasi', 'Kuffour', 'Mensah', 'Owusu',
            'Sarfo', 'Yeboah'
        ]
        
        # Kenyan cities
        locations = [
            'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika', 'Malindi', 'Kitale',
            'Garissa', 'Kakamega', 'Nyeri', 'Meru', 'Machakos', 'Kiambu', 'Kericho', 'Embu',
            'Naivasha', 'Kitui', 'Bungoma', 'Homa Bay'
        ]
        
        for i in range(50):
            first_name = random.choice(first_names)
            last_name = random.choice(last_names)
            email = f'{first_name.lower()}.{last_name.lower()}{i+1}@example.com'
            
            user = User.objects.create_user(
                email=email,
                password='password123',
                first_name=first_name,
                last_name=last_name,
                phone_number=f'+2547{random.randint(10000000, 99999999)}',
                id_number=f'{random.randint(10000000, 99999999)}',
                address=f'{random.randint(1, 999)} {random.choice(["Main", "Market", "Station", "Church"])} Street, {random.choice(locations)}',
                date_of_birth=date(random.randint(1970, 2000), random.randint(1, 12), random.randint(1, 28)),
                kyc_verified=random.choice([True, True, True, False]),
                credit_score=Decimal(str(random.uniform(300, 850))).quantize(Decimal('0.01'))
            )
            
            # Create wallet
            MemberWallet.objects.create(
                user=user,
                balance=Decimal(str(random.uniform(1000, 50000))).quantize(Decimal('0.01'))
            )
            
            self.users.append(user)
        
        print(f"  ✓ Created {len(self.users)} users with wallets")
    
    # ========================================================================
    # GROUPS AND MEMBERSHIPS
    # ========================================================================
    
    def seed_groups(self):
        """Create groups, memberships, officials, goals, and messages."""
        group_names = [
            'Umoja Savings Group', 'Harambee Investment Club', 'Mwanzo Welfare Society',
            'Tumaini Women Group', 'Jamii Development Fund', 'Ushirika Farmers Cooperative',
            'Bidii Youth Group', 'Tujenge Together', 'Amani Community Fund', 'Fahari Business Circle',
            'Neema Ladies Chama', 'Upendo Social Club', 'Baraka Investment Group', 'Furaha Sacco',
            'Maendeleo Progressive Group'
        ]
        
        group_types = ['SAVINGS', 'INVESTMENT', 'WELFARE', 'MIXED']
        frequencies = ['WEEKLY', 'BIWEEKLY', 'MONTHLY']
        
        for name in group_names:
            group = ChamaGroup.objects.create(
                name=name,
                description=f'A community-based {random.choice(group_types).lower()} group focused on financial empowerment.',
                group_type=random.choice(group_types),
                objectives='To provide financial support and foster economic growth among members.',
                contribution_frequency=random.choice(frequencies),
                minimum_contribution=Decimal(str(random.choice([500, 1000, 2000, 5000]))),
                total_balance=Decimal('0.00'),
                is_active=True,
                kyb_verified=random.choice([True, True, False]),
                created_by=random.choice(self.users)
            )
            self.groups.append(group)
        
        print(f"  ✓ Created {len(self.groups)} groups")
        
        # Create memberships
        for group in self.groups:
            num_members = random.randint(8, 15)
            group_users = random.sample(self.users, num_members)
            
            # First member is admin
            admin_membership = GroupMembership.objects.create(
                group=group,
                user=group_users[0],
                role='ADMIN',
                status='ACTIVE',
                total_contributions=Decimal(str(random.uniform(5000, 50000))).quantize(Decimal('0.01'))
            )
            self.memberships.append(admin_membership)
            
            # Other members
            roles = ['MEMBER'] * 10 + ['TREASURER', 'SECRETARY', 'CHAIRPERSON']
            for user in group_users[1:]:
                membership = GroupMembership.objects.create(
                    group=group,
                    user=user,
                    role=random.choice(roles),
                    status=random.choice(['ACTIVE', 'ACTIVE', 'ACTIVE', 'PENDING']),
                    total_contributions=Decimal(str(random.uniform(1000, 30000))).quantize(Decimal('0.01'))
                )
                self.memberships.append(membership)
        
        print(f"  ✓ Created {len(self.memberships)} group memberships")
        
        # Create officials
        self._create_officials()
        
        # Create goals
        self._create_goals()
        
        # Create messages
        self._create_messages()
    
    def _create_officials(self):
        """Create group officials."""
        positions = ['CHAIRPERSON', 'TREASURER', 'SECRETARY']
        count = 0
        
        for group in self.groups:
            active_memberships = GroupMembership.objects.filter(
                group=group, status='ACTIVE'
            ).exclude(role='MEMBER')[:3]
            
            for i, membership in enumerate(active_memberships):
                if i < len(positions):
                    term_start = timezone.now().date() - timedelta(days=random.randint(30, 365))
                    GroupOfficial.objects.create(
                        group=group,
                        membership=membership,
                        position=positions[i],
                        term_start=term_start,
                        term_end=term_start + timedelta(days=365),
                        is_current=True
                    )
                    count += 1
        
        print(f"  ✓ Created {count} group officials")
    
    def _create_goals(self):
        """Create group goals."""
        goal_titles = [
            'Emergency Fund Target', 'Investment Capital Pool', 'Member Loan Fund',
            'Community Project', 'Annual Retreat Fund', 'Education Support Fund',
            'Business Expansion Capital', 'Property Purchase Fund'
        ]
        count = 0
        
        for group in self.groups:
            num_goals = random.randint(1, 3)
            # Get members from this group
            group_members = GroupMembership.objects.filter(group=group, status='ACTIVE')
            if not group_members.exists():
                continue
            
            for _ in range(num_goals):
                target_amount = Decimal(str(random.choice([100000, 250000, 500000, 1000000])))
                current_amount = target_amount * Decimal(str(random.uniform(0.1, 0.8))).quantize(Decimal('0.01'))
                
                GroupGoal.objects.create(
                    group=group,
                    title=random.choice(goal_titles),
                    description='Group goal to achieve financial milestone for collective benefit.',
                    target_amount=target_amount,
                    current_amount=current_amount,
                    target_date=timezone.now().date() + timedelta(days=random.randint(90, 365)),
                    status=random.choice(['ACTIVE', 'ACTIVE', 'ACTIVE', 'ACHIEVED']),
                    created_by=random.choice(group_members).user
                )
                count += 1
        
        print(f"  ✓ Created {count} group goals")
    
    def _create_messages(self):
        """Create group messages."""
        messages_content = [
            'Welcome everyone to our group!',
            'Please remember to make your contributions on time.',
            'Our next meeting is scheduled for next week.',
            'Congratulations on achieving our savings goal!',
            'Let\'s discuss the upcoming investment opportunity.',
            'Thank you all for your active participation.',
            'Please review the financial report shared earlier.',
            'We need volunteers for the upcoming community project.',
            'Great job everyone on maintaining our group activities!',
            'Looking forward to seeing everyone at the AGM.',
        ]
        count = 0
        
        for group in self.groups:
            memberships = GroupMembership.objects.filter(group=group, status='ACTIVE')
            num_messages = random.randint(10, 30)
            for _ in range(num_messages):
                GroupMessage.objects.create(
                    group=group,
                    user=random.choice(memberships).user,
                    content=random.choice(messages_content)
                )
                count += 1
        
        print(f"  ✓ Created {count} group messages")
    
    # ========================================================================
    # FINANCE
    # ========================================================================
    
    def seed_finance(self):
        """Seed contributions, loans, and expenses."""
        self._create_contributions()
        self._create_loans()
        self._create_expenses()
    
    def _create_contributions(self):
        """Create contributions."""
        payment_methods = ['MPESA', 'MPESA', 'MPESA', 'BANK', 'CASH']
        count = 0
        
        for group in self.groups:
            memberships = GroupMembership.objects.filter(group=group, status='ACTIVE')
            
            for membership in memberships:
                num_contributions = random.randint(5, 15)
                for _ in range(num_contributions):
                    amount = group.minimum_contribution * Decimal(str(random.uniform(1.0, 3.0))).quantize(Decimal('0.01'))
                    
                    contribution = Contribution.objects.create(
                        group=group,
                        member=membership.user,
                        amount=amount,
                        payment_method=random.choice(payment_methods),
                        reference_number=f'REF{random.randint(100000, 999999)}',
                        status=random.choice(['COMPLETED', 'COMPLETED', 'COMPLETED', 'PENDING', 'RECONCILED']),
                        notes=f'Regular {group.contribution_frequency.lower()} contribution'
                    )
                    
                    if contribution.status in ['COMPLETED', 'RECONCILED']:
                        group.total_balance += amount
                        membership.total_contributions += amount
                        membership.save()
                    count += 1
            
            group.save()
        
        print(f"  ✓ Created {count} contributions")
    
    def _create_loans(self):
        """Create loans and repayments."""
        statuses = ['APPROVED', 'DISBURSED', 'ACTIVE', 'COMPLETED', 'PENDING']
        count = 0
        repayment_count = 0
        
        for group in self.groups:
            memberships = GroupMembership.objects.filter(group=group, status='ACTIVE')
            num_loans = int(memberships.count() * random.uniform(0.3, 0.5))
            loan_members = random.sample(list(memberships), num_loans)
            
            for membership in loan_members:
                principal = Decimal(str(random.choice([10000, 25000, 50000, 100000, 200000])))
                interest_rate = Decimal(str(random.uniform(5, 15))).quantize(Decimal('0.01'))
                duration = random.choice([3, 6, 12, 24])
                
                # Calculate loan amounts before creating
                # Calculate total interest for the entire loan duration (simple interest)
                total_interest = (principal * interest_rate * duration) / (Decimal('100') * Decimal(str(MONTHS_PER_YEAR)))
                total_amount = principal + total_interest
                monthly_payment = total_amount / duration if duration > 0 else Decimal('0')
                
                loan = Loan.objects.create(
                    group=group,
                    borrower=membership.user,
                    principal_amount=principal,
                    interest_rate=interest_rate,
                    duration_months=duration,
                    total_amount=total_amount,
                    monthly_payment=monthly_payment,
                    outstanding_balance=total_amount,
                    status=random.choice(statuses),
                    purpose=random.choice([
                        'Business expansion', 'Emergency medical expenses',
                        'Education fees', 'Home improvement', 'Agricultural investment'
                    ])
                )
                count += 1
                
                # Create repayments for active/completed loans
                if loan.status in ['ACTIVE', 'COMPLETED']:
                    num_repayments = random.randint(1, duration)
                    for _ in range(num_repayments):
                        # Ensure we don't create more repayments than needed
                        if loan.outstanding_balance > Decimal('0'):
                            repayment_amount = min(monthly_payment, loan.outstanding_balance)
                            LoanRepayment.objects.create(
                                loan=loan,
                                amount=repayment_amount,
                                payment_method=random.choice(['MPESA', 'BANK', 'CASH']),
                                reference_number=f'REP{random.randint(100000, 999999)}',
                                status='COMPLETED'
                            )
                            loan.outstanding_balance -= repayment_amount
                            repayment_count += 1
                    loan.save()
        
        print(f"  ✓ Created {count} loans and {repayment_count} repayments")
    
    def _create_expenses(self):
        """Create group expenses."""
        categories = ['OPERATIONAL', 'ADMINISTRATIVE', 'WELFARE', 'INVESTMENT', 'OTHER']
        count = 0
        
        for group in self.groups:
            active_memberships = list(GroupMembership.objects.filter(
                group=group, status='ACTIVE', role__in=['ADMIN', 'TREASURER', 'SECRETARY']
            ))
            
            if not active_memberships:
                continue
            
            num_expenses = random.randint(3, 8)
            for _ in range(num_expenses):
                Expense.objects.create(
                    group=group,
                    category=random.choice(categories),
                    description=random.choice([
                        'Meeting venue rental', 'Stationery and office supplies',
                        'Member welfare support', 'Investment opportunity',
                        'Legal and registration fees', 'Audit services'
                    ]),
                    amount=Decimal(str(random.uniform(1000, 20000))).quantize(Decimal('0.01')),
                    status=random.choice(['APPROVED', 'DISBURSED', 'PENDING', 'REJECTED']),
                    requested_by=random.choice(active_memberships).user
                )
                count += 1
        
        print(f"  ✓ Created {count} expenses")
    
    # ========================================================================
    # INVESTMENTS
    # ========================================================================
    
    def seed_investments(self):
        """Seed investments and portfolios."""
        investment_count = 0
        transaction_count = 0
        
        for group in self.groups:
            num_investments = random.randint(2, 5)
            active_members = GroupMembership.objects.filter(group=group, status='ACTIVE')
            
            if not active_members.exists():
                continue
            
            created_by = random.choice(active_members).user
            
            for _ in range(num_investments):
                investment = self._create_investment(group, created_by)
                if investment:
                    investment_count += 1
                    transaction_count += self._create_investment_transactions(investment, created_by)
        
        print(f"  ✓ Created {investment_count} investments with {transaction_count} transactions")
        
        # Create portfolios for groups that don't have one
        portfolio_count = 0
        groups_without_portfolio = ChamaGroup.objects.filter(portfolio__isnull=True)
        for group in groups_without_portfolio:
            # Generate random percentages that sum to exactly 100
            remaining = 100.0
            
            # Stocks: 20-40%
            stocks_pct = random.uniform(20, min(40, remaining))
            remaining -= stocks_pct
            
            # Bonds: 20-30% (adjusted for remaining)
            bonds_pct = random.uniform(20, min(30, remaining))
            remaining -= bonds_pct
            
            # Real Estate: 10-25% (adjusted for remaining)
            real_estate_pct = random.uniform(10, min(25, remaining))
            remaining -= real_estate_pct
            
            # Cash: 10-20% (adjusted for remaining)
            min_cash = max(0, min(10, remaining))
            max_cash = min(20, remaining)
            cash_pct = random.uniform(min_cash, max_cash)
            remaining -= cash_pct
            
            # Other: whatever remains to make it exactly 100%
            other_pct = max(0, remaining)
            
            Portfolio.objects.create(
                group=group,
                total_invested=Decimal(str(random.uniform(50000, 500000))).quantize(Decimal('0.01')),
                current_value=Decimal(str(random.uniform(50000, 600000))).quantize(Decimal('0.01')),
                stocks_percentage=Decimal(str(stocks_pct)).quantize(Decimal('0.01')),
                bonds_percentage=Decimal(str(bonds_pct)).quantize(Decimal('0.01')),
                real_estate_percentage=Decimal(str(real_estate_pct)).quantize(Decimal('0.01')),
                cash_percentage=Decimal(str(cash_pct)).quantize(Decimal('0.01')),
                other_percentage=Decimal(str(other_pct)).quantize(Decimal('0.01')),
                ytd_return=Decimal(str(random.uniform(-5, 15))).quantize(Decimal('0.01'))
            )
            portfolio_count += 1
        
        print(f"  ✓ Created {portfolio_count} portfolios")
    
    def _create_investment(self, group, created_by):
        """Create a single investment."""
        investment_types = [
            'TREASURY_BILL', 'FIXED_DEPOSIT', 'MONEY_MARKET',
            'STOCKS', 'BONDS', 'REAL_ESTATE'
        ]
        
        investment_type = random.choice(investment_types)
        principal_amount = Decimal(str(random.choice([50000, 100000, 200000, 500000])))
        expected_return_rate = Decimal(str(random.uniform(5, 15))).quantize(Decimal('0.01'))
        duration_days = random.choice([91, 182, 365, 730])
        
        purchase_date = timezone.now().date() - timedelta(days=random.randint(0, 180))
        maturity_date = purchase_date + timedelta(days=duration_days)
        
        # Calculate current value using Decimal arithmetic for precision
        days_elapsed = (timezone.now().date() - purchase_date).days
        years_elapsed = Decimal(str(days_elapsed)) / Decimal('365.25')
        
        # Calculate growth factor: (1 + rate/100)^years
        base_rate = Decimal('1') + (expected_return_rate / Decimal('100'))
        # Use power calculation with Decimal for precision
        growth_factor = base_rate ** years_elapsed
        
        # Apply variance (0.95 to 1.05)
        variance = Decimal(str(random.uniform(0.95, 1.05)))
        current_value = (principal_amount * growth_factor * variance).quantize(Decimal('0.01'))
        
        status = random.choice(['ACTIVE', 'ACTIVE', 'ACTIVE', 'MATURED', 'SOLD'])
        
        investment = Investment.objects.create(
            group=group,
            investment_type=investment_type,
            name=f'{investment_type.replace("_", " ").title()} Investment',
            description=f'Investment in {investment_type.replace("_", " ").lower()}',
            principal_amount=principal_amount,
            current_value=current_value,
            expected_return_rate=expected_return_rate,
            purchase_date=purchase_date,
            maturity_date=maturity_date,
            status=status,
            created_by=created_by
        )
        
        return investment
    
    def _create_investment_transactions(self, investment, created_by):
        """Create investment transactions."""
        count = 0
        
        # Initial BUY transaction
        InvestmentTransaction.objects.create(
            investment=investment,
            transaction_type='BUY',
            amount=investment.principal_amount,
            transaction_date=investment.purchase_date,
            reference_number=f'BUY-{random.randint(100000, 999999)}',
            notes='Initial investment purchase',
            created_by=created_by
        )
        count += 1
        
        # Add maturity/sell transactions
        if investment.status == 'MATURED':
            InvestmentTransaction.objects.create(
                investment=investment,
                transaction_type='MATURITY',
                amount=investment.current_value,
                transaction_date=investment.maturity_date,
                reference_number=f'MAT-{random.randint(100000, 999999)}',
                notes='Investment maturity proceeds',
                created_by=created_by
            )
            count += 1
        
        return count
    
    # ========================================================================
    # GAMIFICATION
    # ========================================================================
    
    def seed_gamification(self):
        """Seed gamification data."""
        achievement_count = 0
        streak_count = 0
        points_count = 0
        
        # Achievements
        categories = ['CONTRIBUTION', 'SAVINGS', 'ENGAGEMENT', 'LEADERSHIP', 'LEARNING']
        tiers = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM']
        
        for user in random.sample(self.users, 30):
            num_achievements = random.randint(1, 5)
            for _ in range(num_achievements):
                MemberAchievement.objects.create(
                    user=user,
                    achievement_type=random.choice(['First Contribution', 'Consistent Saver', 'Group Leader']),
                    category=random.choice(categories),
                    tier=random.choice(tiers),
                    title=f'{random.choice(tiers)} {random.choice(categories)} Badge',
                    description='Achievement earned for outstanding performance',
                    points_earned=random.randint(10, 100)
                )
                achievement_count += 1
        
        print(f"  ✓ Created {achievement_count} achievements")
        
        # Streaks
        for group in self.groups:
            memberships = GroupMembership.objects.filter(group=group, status='ACTIVE')[:5]
            for membership in memberships:
                ContributionStreak.objects.create(
                    user=membership.user,
                    group=group,
                    current_streak=random.randint(1, 30),
                    longest_streak=random.randint(10, 50),
                    last_contribution_date=timezone.now().date() - timedelta(days=random.randint(0, 7)),
                    streak_active=True,
                    total_points=random.randint(50, 500)
                )
                streak_count += 1
        
        print(f"  ✓ Created {streak_count} contribution streaks")
        
        # Reward Points
        for group in self.groups:
            memberships = GroupMembership.objects.filter(group=group, status='ACTIVE')
            for membership in memberships:
                num_points = random.randint(2, 5)
                balance = 0
                for _ in range(num_points):
                    points = random.randint(10, 50)
                    balance += points
                    RewardPoints.objects.create(
                        user=membership.user,
                        group=group,
                        transaction_type='EARNED',
                        points=points,
                        balance_after=balance,
                        reason='Contribution made on time',
                        reference_id=f'REF{random.randint(100000, 999999)}'
                    )
                    points_count += 1
        
        print(f"  ✓ Created {points_count} reward point transactions")
    
    # ========================================================================
    # M-PESA INTEGRATION
    # ========================================================================
    
    def seed_mpesa(self):
        """Seed M-Pesa transactions."""
        transaction_count = 0
        
        # Get all completed contributions
        contributions = Contribution.objects.filter(
            payment_method='MPESA',
            status__in=['COMPLETED', 'RECONCILED']
        )[:100]
        
        for contribution in contributions:
            MPesaTransaction.objects.create(
                transaction_id=f'MPE{random.randint(1000000000, 9999999999)}',
                merchant_request_id=f'MER{random.randint(10000, 99999)}',
                checkout_request_id=f'CHK{random.randint(10000, 99999)}',
                transaction_type='STK_PUSH',
                amount=contribution.amount,
                phone_number=contribution.member.phone_number,
                account_reference=contribution.group.name[:20],
                transaction_desc='Contribution payment',
                mpesa_receipt_number=f'MPE{random.randint(10000000, 99999999)}',
                transaction_date=contribution.created_at,
                status='SUCCESS',
                result_code='0',
                result_desc='The service request is processed successfully.',
                group=contribution.group,
                user=contribution.member,
                contribution=contribution
            )
            transaction_count += 1
        
        print(f"  ✓ Created {transaction_count} M-Pesa transactions")
    
    # ========================================================================
    # EDUCATION HUB (ENHANCED)
    # ========================================================================
    
    def seed_education(self):
        """Seed comprehensive educational content with all related models."""
        print("  ✓ Seeding Educational Content...")
        contents = self._create_educational_content()
        
        print("  ✓ Seeding Learning Paths...")
        learning_paths = self._create_learning_paths(contents)
        
        print("  ✓ Seeding User Progress...")
        self._create_user_progress(contents)
        
        print("  ✓ Seeding Learning Path Enrollments...")
        self._create_learning_path_enrollments(learning_paths)
        
        print("  ✓ Seeding Webinars...")
        webinars = self._create_webinars()
        
        print("  ✓ Seeding Webinar Registrations...")
        self._create_webinar_registrations(webinars)
        
        print("  ✓ Seeding Savings Challenges...")
        challenges = self._create_savings_challenges(contents, learning_paths)
        
        print("  ✓ Seeding Challenge Participants...")
        self._create_challenge_participants(challenges)
        
        print("  ✓ Seeding Achievements...")
        achievements = self._create_achievements()
        
        print("  ✓ Seeding User Achievements...")
        self._create_user_achievements(achievements)
        
        print("  ✓ Seeding Certificates...")
        self._create_certificates(learning_paths)
    
    def _create_educational_content(self):
        """Create diverse educational content."""
        content_data = [
            # Savings Category
            ('Introduction to Savings', 'ARTICLE', 'SAVINGS', 'BEGINNER', 15, 
             'Master the basics of savings and build a strong financial foundation.', 
             ['emergency fund', 'savings account', 'financial goals'], True),
            ('Smart Savings Strategies', 'VIDEO', 'SAVINGS', 'INTERMEDIATE', 25, 
             'Advanced savings techniques to maximize your wealth.', 
             ['compound interest', 'high-yield savings', 'savings automation'], True),
            ('Building Your Emergency Fund', 'TUTORIAL', 'SAVINGS', 'BEGINNER', 30, 
             'Step-by-step guide to creating a solid emergency fund.', 
             ['emergency fund', 'financial security', '3-6 months expenses'], True),
            
            # Investment Category
            ('Investment Basics', 'VIDEO', 'INVESTMENTS', 'BEGINNER', 30, 
             'Learn fundamental investment concepts and get started.', 
             ['stocks', 'bonds', 'diversification'], True),
            ('Understanding Stock Markets', 'ARTICLE', 'INVESTMENTS', 'INTERMEDIATE', 20, 
             'Deep dive into how stock markets work.', 
             ['stock trading', 'market analysis', 'equities'], True),
            ('Advanced Investment Strategies', 'WEBINAR', 'INVESTMENTS', 'ADVANCED', 60, 
             'Master complex investment strategies for wealth growth.', 
             ['portfolio management', 'asset allocation', 'risk management'], True),
            ('Real Estate Investment Guide', 'COURSE', 'INVESTMENTS', 'INTERMEDIATE', 45, 
             'Comprehensive guide to real estate investing.', 
             ['real estate', 'property investment', 'rental income'], True),
            
            # Loans Category
            ('Understanding Loans', 'TUTORIAL', 'LOANS', 'BEGINNER', 20, 
             'Learn about different loan types and how they work.', 
             ['personal loans', 'interest rates', 'loan terms'], True),
            ('Loan Management Best Practices', 'ARTICLE', 'LOANS', 'INTERMEDIATE', 25, 
             'Effective strategies for managing your loans.', 
             ['debt management', 'repayment strategies', 'credit score'], True),
            ('How to Qualify for a Loan', 'VIDEO', 'LOANS', 'BEGINNER', 18, 
             'Steps to improve your loan eligibility.', 
             ['loan requirements', 'creditworthiness', 'documentation'], True),
            
            # Budgeting Category
            ('Budgeting for Success', 'ARTICLE', 'BUDGETING', 'BEGINNER', 20, 
             'Create and stick to a budget that works.', 
             ['budgeting', '50/30/20 rule', 'expense tracking'], True),
            ('Advanced Budgeting Techniques', 'TUTORIAL', 'BUDGETING', 'ADVANCED', 35, 
             'Master advanced budgeting strategies.', 
             ['zero-based budgeting', 'envelope system', 'financial planning'], True),
            ('Expense Tracking Made Easy', 'VIDEO', 'BUDGETING', 'BEGINNER', 15, 
             'Learn to track your expenses effectively.', 
             ['expense tracking', 'money management', 'financial awareness'], True),
            
            # Financial Planning Category
            ('Financial Planning 101', 'TUTORIAL', 'FINANCIAL_PLANNING', 'INTERMEDIATE', 40, 
             'Comprehensive guide to financial planning.', 
             ['financial goals', 'retirement planning', 'wealth building'], True),
            ('Long-term Financial Planning', 'COURSE', 'FINANCIAL_PLANNING', 'ADVANCED', 50, 
             'Plan for your financial future effectively.', 
             ['long-term goals', 'investment planning', 'estate planning'], True),
            ('Setting Financial Goals', 'ARTICLE', 'FINANCIAL_PLANNING', 'BEGINNER', 12, 
             'How to set and achieve your financial goals.', 
             ['SMART goals', 'financial targets', 'goal tracking'], True),
            
            # Credit Score Category
            ('Understanding Credit Scores', 'VIDEO', 'CREDIT_SCORE', 'BEGINNER', 22, 
             'Learn what impacts your credit score.', 
             ['credit score', 'credit report', 'credit history'], True),
            ('Improving Your Credit Score', 'TUTORIAL', 'CREDIT_SCORE', 'INTERMEDIATE', 30, 
             'Actionable steps to boost your credit score.', 
             ['credit building', 'debt management', 'credit utilization'], True),
            
            # Retirement Category
            ('Retirement Planning Basics', 'ARTICLE', 'RETIREMENT', 'INTERMEDIATE', 28, 
             'Start planning for a comfortable retirement.', 
             ['retirement savings', 'pension plans', 'retirement age'], True),
            ('Investment for Retirement', 'VIDEO', 'RETIREMENT', 'ADVANCED', 35, 
             'Strategic retirement investment approaches.', 
             ['retirement portfolio', '401k', 'IRA'], True),
            
            # Entrepreneurship Category
            ('Starting Your Business', 'COURSE', 'ENTREPRENEURSHIP', 'INTERMEDIATE', 55, 
             'Complete guide to launching a successful business.', 
             ['business planning', 'startup funding', 'business registration'], True),
            ('Business Finance Management', 'TUTORIAL', 'ENTREPRENEURSHIP', 'ADVANCED', 40, 
             'Manage your business finances effectively.', 
             ['cash flow', 'business accounting', 'financial statements'], True),
            
            # Quiz Content
            ('Savings Knowledge Test', 'QUIZ', 'SAVINGS', 'BEGINNER', 10, 
             'Test your understanding of savings concepts.', 
             ['quiz', 'assessment', 'savings'], True),
            ('Investment Quiz', 'QUIZ', 'INVESTMENTS', 'INTERMEDIATE', 15, 
             'Evaluate your investment knowledge.', 
             ['quiz', 'assessment', 'investments'], True),
        ]
        
        contents = []
        for i, (title, ctype, category, difficulty, duration, description, tags, is_published) in enumerate(content_data):
            slug = title.lower().replace(' ', '-')
            
            # Create quiz questions for quiz content
            quiz_questions = None
            passing_score = 70
            if ctype == 'QUIZ':
                quiz_questions = [
                    {
                        'question': f'What is the best approach to {category.lower()}?',
                        'options': ['Option A', 'Option B', 'Option C', 'Option D'],
                        'correct_answer': 0
                    },
                    {
                        'question': f'How often should you review your {category.lower()} strategy?',
                        'options': ['Monthly', 'Quarterly', 'Annually', 'Never'],
                        'correct_answer': 1
                    }
                ]
            
            # Create detailed content
            content_text = f"""
# {title}

## Introduction
{description}

## Key Concepts
This comprehensive guide covers essential topics in {category.lower()} that will help you make informed financial decisions.

## Learning Objectives
By the end of this content, you will be able to:
- Understand the fundamentals of {category.lower()}
- Apply best practices in your financial life
- Make confident decisions about your finances

## Main Content
This section contains detailed information about {category.lower()}. Content includes practical examples, 
case studies, and actionable steps you can take to improve your financial situation. The material is 
designed to be accessible while providing valuable insights for learners at the {difficulty.lower()} level.

### Key Topics Covered
- Fundamental concepts and definitions
- Best practices and strategies
- Common pitfalls to avoid
- Real-world applications and examples
- Step-by-step guidance for implementation

## Summary
You've learned important concepts about {category.lower()}. Apply these principles to improve your financial well-being.
            """.strip()
            
            learning_objectives = [
                f"Understand key {category.lower()} concepts",
                f"Apply {category.lower()} strategies in real life",
                f"Make informed {category.lower()} decisions"
            ]
            
            content = EducationalContent.objects.create(
                title=title,
                slug=f'{slug}-{i}' if EducationalContent.objects.filter(slug=slug).exists() else slug,
                content_type=ctype,
                category=category,
                difficulty=difficulty,
                description=description,
                content=content_text,
                video_url=f'https://example.com/videos/{slug}' if ctype == 'VIDEO' else '',
                thumbnail_url=f'https://example.com/thumbnails/{slug}.jpg',
                learning_objectives=learning_objectives,
                tags=tags,
                duration_minutes=duration,
                points_reward=random.randint(10, 50),
                certificate_available=ctype in ['COURSE', 'WEBINAR'],
                quiz_questions=quiz_questions,
                passing_score=passing_score,
                is_published=is_published,
                is_featured=random.choice([True, False, False, False]),
                author=random.choice(self.users),
                views_count=random.randint(10, 1000),
                likes_count=random.randint(5, 200),
                share_count=random.randint(0, 50)
            )
            contents.append(content)
        
        print(f"    - Created {len(contents)} educational content items")
        return contents
    
    def _create_learning_paths(self, contents):
        """Create learning paths with ordered content."""
        path_data = [
            ('Financial Literacy for Beginners', 'BEGINNER_FINANCIAL_LITERACY', 'BEGINNER',
             'Start your financial journey with fundamental concepts.', 'wallet', '#3B82F6'),
            ('Investment Mastery Program', 'INVESTMENT_MASTERY', 'ADVANCED',
             'Become an investment expert with comprehensive training.', 'trending-up', '#10B981'),
            ('Debt Management Excellence', 'DEBT_MANAGEMENT', 'INTERMEDIATE',
             'Learn to manage and eliminate debt effectively.', 'credit-card', '#F59E0B'),
            ('Business Finance Course', 'BUSINESS_FINANCE', 'INTERMEDIATE',
             'Master business financial management.', 'briefcase', '#8B5CF6'),
            ('Retirement Planning Journey', 'RETIREMENT_PLANNING', 'ADVANCED',
             'Plan for a secure and comfortable retirement.', 'sun', '#EC4899'),
            ('Wealth Building Strategy', 'WEALTH_BUILDING', 'INTERMEDIATE',
             'Build sustainable wealth through strategic planning.', 'dollar-sign', '#14B8A6'),
        ]
        
        learning_paths = []
        for title, path_type, difficulty, description, icon, color in path_data:
            slug = title.lower().replace(' ', '-')
            
            # Filter appropriate contents for this path
            if path_type == 'BEGINNER_FINANCIAL_LITERACY':
                path_contents = [c for c in contents if c.difficulty == 'BEGINNER' 
                               and c.category in ['SAVINGS', 'BUDGETING', 'FINANCIAL_PLANNING']][:5]
            elif path_type == 'INVESTMENT_MASTERY':
                path_contents = [c for c in contents if c.category == 'INVESTMENTS'][:6]
            elif path_type == 'DEBT_MANAGEMENT':
                # Safely check for 'debt' in tags
                path_contents = [c for c in contents if c.category == 'LOANS' 
                               or (c.tags and any('debt' in str(tag).lower() for tag in c.tags))][:4]
            elif path_type == 'BUSINESS_FINANCE':
                path_contents = [c for c in contents if c.category == 'ENTREPRENEURSHIP'][:5]
            elif path_type == 'RETIREMENT_PLANNING':
                path_contents = [c for c in contents if c.category in ['RETIREMENT', 'INVESTMENTS']][:5]
            else:  # WEALTH_BUILDING
                path_contents = [c for c in contents if c.category in ['INVESTMENTS', 'FINANCIAL_PLANNING']][:6]
            
            if not path_contents:
                continue
                
            learning_path = LearningPath.objects.create(
                title=title,
                slug=slug,
                description=description,
                short_description=description[:100],
                path_type=path_type,
                icon_name=icon,
                color_code=color,
                difficulty=difficulty,
                is_published=True,
                is_featured=random.choice([True, False, False]),
                completion_badge=f'{title} Champion',
                completion_certificate=True,
                enrolled_count=random.randint(10, 100),
                completed_count=random.randint(5, 50)
            )
            
            # Add contents to learning path
            for order, content in enumerate(path_contents, 1):
                LearningPathContent.objects.create(
                    learning_path=learning_path,
                    content=content,
                    order=order,
                    is_required=True
                )
            
            # Update path counts
            learning_path.update_counts()
            learning_paths.append(learning_path)
        
        print(f"    - Created {len(learning_paths)} learning paths")
        return learning_paths
    
    def _create_user_progress(self, contents):
        """Create user progress records."""
        progress_count = 0
        
        for user in random.sample(self.users, min(30, len(self.users))):
            num_contents = random.randint(3, 10)
            user_contents = random.sample(contents, min(num_contents, len(contents)))
            
            for content in user_contents:
                status = random.choice(['IN_PROGRESS', 'IN_PROGRESS', 'COMPLETED', 'COMPLETED'])
                progress_pct = 100 if status == 'COMPLETED' else random.randint(20, 90)
                
                started_at = timezone.now() - timedelta(days=random.randint(1, 60))
                completed_at = timezone.now() - timedelta(days=random.randint(0, 30)) if status == 'COMPLETED' else None
                
                # Quiz answers if it's a quiz
                quiz_answers = None
                quiz_score = None
                if content.content_type == 'QUIZ' and status == 'COMPLETED':
                    quiz_answers = {'0': 0, '1': 1}  # Simplified answers
                    quiz_score = Decimal(str(random.randint(60, 100)))
                
                UserProgress.objects.create(
                    user=user,
                    content=content,
                    status=status,
                    progress_percentage=progress_pct,
                    started_at=started_at,
                    completed_at=completed_at,
                    time_spent_minutes=random.randint(5, content.duration_minutes + 10),
                    quiz_score=quiz_score,
                    quiz_answers=quiz_answers,
                    bookmarked=random.choice([True, False, False, False]),
                    last_position=random.randint(0, 100)
                )
                progress_count += 1
        
        print(f"    - Created {progress_count} user progress records")
    
    def _create_learning_path_enrollments(self, learning_paths):
        """Create learning path enrollments with completions."""
        enrollment_count = 0
        completion_count = 0
        
        for user in random.sample(self.users, min(25, len(self.users))):
            num_enrollments = random.randint(1, 3)
            user_paths = random.sample(learning_paths, min(num_enrollments, len(learning_paths)))
            
            for path in user_paths:
                status = random.choice(['ENROLLED', 'IN_PROGRESS', 'IN_PROGRESS', 'COMPLETED'])
                
                enrolled_at = timezone.now() - timedelta(days=random.randint(1, 90))
                started_at = enrolled_at + timedelta(days=random.randint(0, 5)) if status != 'ENROLLED' else None
                completed_at = timezone.now() - timedelta(days=random.randint(0, 30)) if status == 'COMPLETED' else None
                
                # Get path contents
                path_contents = list(path.path_contents.order_by('order'))
                if not path_contents:
                    continue
                
                # Set current content
                if status == 'COMPLETED':
                    current_content = None
                    progress_pct = 100
                    num_completed = len(path_contents)
                elif status == 'IN_PROGRESS':
                    num_completed = random.randint(1, max(1, len(path_contents) - 1))
                    current_content = path_contents[num_completed].content if num_completed < len(path_contents) else None
                    progress_pct = int((num_completed / len(path_contents)) * 100)
                else:  # ENROLLED
                    current_content = path_contents[0].content
                    num_completed = 0
                    progress_pct = 0
                
                enrollment = LearningPathEnrollment.objects.create(
                    user=user,
                    learning_path=path,
                    status=status,
                    current_content=current_content,
                    progress_percentage=progress_pct,
                    enrolled_at=enrolled_at,
                    started_at=started_at,
                    completed_at=completed_at,
                    total_time_spent_minutes=random.randint(30, max(60, path.total_duration_hours * 60)),
                    earned_points=random.randint(0, max(10, path.total_points))
                )
                enrollment_count += 1
                
                # Create completion records for completed contents
                for path_content in path_contents[:num_completed]:
                    ContentCompletion.objects.create(
                        enrollment=enrollment,
                        content=path_content.content,
                        time_spent_minutes=random.randint(10, path_content.content.duration_minutes + 10),
                        quiz_score=Decimal(str(random.randint(70, 100))) if path_content.content.content_type == 'QUIZ' else None,
                        passed=True
                    )
                    enrollment.completed_contents.add(path_content.content)
                    completion_count += 1
        
        print(f"    - Created {enrollment_count} learning path enrollments")
        print(f"    - Created {completion_count} content completions")
    
    def _create_webinars(self):
        """Create webinars."""
        webinar_data = [
            ('Mastering Personal Finance', 'SAVINGS', 'BEGINNER', 60,
             'Learn essential personal finance skills in this live webinar.'),
            ('Investment Opportunities in 2024', 'INVESTMENTS', 'INTERMEDIATE', 90,
             'Explore the best investment opportunities for the year.'),
            ('Debt-Free Living Strategies', 'LOANS', 'INTERMEDIATE', 75,
             'Practical strategies to achieve debt-free living.'),
            ('Building Passive Income Streams', 'INVESTMENTS', 'ADVANCED', 120,
             'Create multiple streams of passive income.'),
            ('Retirement Planning Workshop', 'RETIREMENT', 'ADVANCED', 90,
             'Comprehensive retirement planning strategies.'),
            ('Small Business Financial Management', 'ENTREPRENEURSHIP', 'INTERMEDIATE', 75,
             'Manage your small business finances effectively.'),
        ]
        
        webinars = []
        for i, (title, category, difficulty, duration, description) in enumerate(webinar_data):
            # Mix of scheduled, completed, and upcoming webinars
            if i < 2:
                # Upcoming webinars
                scheduled_at = timezone.now() + timedelta(days=random.randint(5, 30))
                status = 'SCHEDULED'
            elif i < 4:
                # Recent completed webinars
                scheduled_at = timezone.now() - timedelta(days=random.randint(1, 30))
                status = 'COMPLETED'
            else:
                # Mix
                scheduled_at = timezone.now() + timedelta(days=random.randint(-10, 20))
                status = random.choice(['SCHEDULED', 'COMPLETED'])
            
            slug = f"{title.lower().replace(' ', '-')}-{i}"
            
            webinar = Webinar.objects.create(
                title=title,
                slug=slug,
                description=description,
                short_description=description[:100],
                presenter=random.choice(self.users),
                scheduled_at=scheduled_at,
                duration_minutes=duration,
                timezone='Africa/Nairobi',
                platform='ZOOM',
                meeting_id=f'webinar{random.randint(100000, 999999)}',
                meeting_url=f'https://zoom.us/j/webinar{random.randint(100000, 999999)}',
                join_url=f'https://zoom.us/j/webinar{random.randint(100000, 999999)}',
                status=status,
                category=category,
                difficulty=difficulty,
                max_participants=random.choice([50, 100, 200]),
                registered_count=random.randint(10, 80),
                attended_count=random.randint(5, 60) if status == 'COMPLETED' else 0,
                points_reward=random.randint(20, 50),
                certificate_available=True,
                qna_enabled=True,
                poll_enabled=random.choice([True, False]),
                views_count=random.randint(50, 500) if status == 'COMPLETED' else 0,
                average_rating=Decimal(str(random.uniform(4.0, 5.0))) if status == 'COMPLETED' else Decimal('0')
            )
            webinars.append(webinar)
        
        print(f"    - Created {len(webinars)} webinars")
        return webinars
    
    def _create_webinar_registrations(self, webinars):
        """Create webinar registrations."""
        registration_count = 0
        qna_count = 0
        
        for webinar in webinars:
            num_registrations = min(webinar.registered_count, 20)
            registered_users = random.sample(self.users, min(num_registrations, len(self.users)))
            
            for user in registered_users:
                # Determine if attended
                attended = webinar.status == 'COMPLETED' and random.choice([True, True, False])
                status = 'ATTENDED' if attended else 'REGISTERED'
                
                registration = WebinarRegistration.objects.create(
                    webinar=webinar,
                    user=user,
                    status=status,
                    registered_at=webinar.scheduled_at - timedelta(days=random.randint(1, 14)),
                    joined_at=webinar.scheduled_at + timedelta(minutes=random.randint(-5, 10)) if attended else None,
                    attendance_duration=random.randint(30, webinar.duration_minutes) if attended else 0,
                    checkin_code=f'{random.randint(100000, 999999)}',
                    checked_in=attended,
                    checkin_at=webinar.scheduled_at if attended else None,
                    rating=random.randint(4, 5) if attended else None,
                    feedback='Great webinar! Very informative.' if attended and random.choice([True, False]) else '',
                    timezone='Africa/Nairobi',
                    source='WEB'
                )
                registration_count += 1
                
                # Add some Q&A for completed webinars
                if webinar.status == 'COMPLETED' and attended and random.choice([True, False, False]):
                    question_text = random.choice([
                        'How can I start implementing these strategies?',
                        'What resources do you recommend for beginners?',
                        'Can you provide more examples?',
                        'How long does it typically take to see results?',
                        'What are the common mistakes to avoid?'
                    ])
                    
                    WebinarQnA.objects.create(
                        webinar=webinar,
                        user=user,
                        question=question_text,
                        answer='Thank you for your question. ' + random.choice([
                            'Start small and build gradually.',
                            'Check out the resources in the description.',
                            'I recommend starting with the basics.',
                            'Results vary, but consistency is key.',
                            'Avoid rushing and focus on fundamentals.'
                        ]),
                        answered_by=webinar.presenter,
                        is_anonymous=False,
                        upvotes=random.randint(0, 15),
                        answered_at=webinar.scheduled_at + timedelta(minutes=random.randint(10, webinar.duration_minutes))
                    )
                    qna_count += 1
        
        print(f"    - Created {registration_count} webinar registrations")
        print(f"    - Created {qna_count} Q&A entries")
    
    def _create_savings_challenges(self, contents, learning_paths):
        """Create savings challenges with educational content."""
        challenge_data = [
            ('Save 10K in 30 Days', 'MONTHLY_SAVINGS', 10000, 30, 'ACTIVE'),
            ('Build Your Emergency Fund', 'EMERGENCY_FUND', 50000, 90, 'ACTIVE'),
            ('Investment Challenge', 'INVESTMENT_CHALLENGE', 25000, 60, 'UPCOMING'),
            ('New Year Savings Boost', 'SPECIAL_EVENT', 15000, 45, 'COMPLETED'),
            ('Weekly Savings Habit', 'WEEKLY_SAVINGS', 5000, 30, 'ACTIVE'),
        ]
        
        challenges = []
        for title, challenge_type, target, duration, status in challenge_data:
            start_date = timezone.now().date()
            if status == 'UPCOMING':
                start_date += timedelta(days=10)
            elif status == 'COMPLETED':
                start_date -= timedelta(days=duration + 10)
            elif status == 'ACTIVE':
                start_date -= timedelta(days=random.randint(1, duration // 2))
            
            end_date = start_date + timedelta(days=duration)
            
            # Link relevant educational content
            if challenge_type in ['MONTHLY_SAVINGS', 'WEEKLY_SAVINGS', 'EMERGENCY_FUND']:
                category_filter = 'SAVINGS'
            elif challenge_type == 'INVESTMENT_CHALLENGE':
                category_filter = 'INVESTMENTS'
            else:
                category_filter = 'BUDGETING'
            
            relevant_contents = [c for c in contents if c.category == category_filter][:3]
            relevant_path = next((lp for lp in learning_paths if category_filter.lower() in lp.title.lower()), None)
            
            challenge = SavingsChallenge.objects.create(
                title=title,
                description=f'Join the {title} challenge and {challenge_type.replace("_", " ").lower()}.',
                short_description=f'Save KES {target:,} in {duration} days',
                challenge_type=challenge_type,
                target_amount=Decimal(str(target)),
                duration_days=duration,
                start_date=start_date,
                end_date=end_date,
                status=status,
                min_participants=1,
                max_participants=100,
                participants_count=random.randint(10, 50),
                reward_points=random.randint(100, 300),
                reward_badge=f'{title} Champion',
                learning_path=relevant_path,
                created_by=random.choice(self.users),
                total_amount_saved=Decimal(str(random.randint(50000, 500000))),
                success_rate=Decimal(str(random.uniform(60, 90)))
            )
            
            # Link educational content
            for content in relevant_contents:
                challenge.educational_content.add(content)
            
            challenges.append(challenge)
        
        print(f"    - Created {len(challenges)} savings challenges")
        return challenges
    
    def _create_challenge_participants(self, challenges):
        """Create challenge participants."""
        participant_count = 0
        
        for challenge in challenges:
            num_participants = min(challenge.participants_count, 15)
            participants = random.sample(self.users, min(num_participants, len(self.users)))
            
            for user in participants:
                current_amount = Decimal(str(random.uniform(0, float(challenge.target_amount))))
                progress_pct = int((current_amount / challenge.target_amount) * 100)
                completed = progress_pct >= 100
                
                participant = ChallengeParticipant.objects.create(
                    challenge=challenge,
                    user=user,
                    current_amount=current_amount,
                    target_amount=challenge.target_amount,
                    progress_percentage=min(progress_pct, 100),
                    completed=completed,
                    streak_days=random.randint(0, challenge.duration_days),
                    joined_at=challenge.start_date,
                    started_at=challenge.start_date,
                    completed_at=timezone.now() if completed else None,
                    learning_progress=random.randint(0, 100),
                    daily_target=challenge.target_amount / Decimal(str(challenge.duration_days)),
                    weekly_target=challenge.target_amount / Decimal(str(max(1, challenge.duration_days / 7)))
                )
                
                # Link some completed lessons
                for content in random.sample(list(challenge.educational_content.all()), 
                                            min(2, challenge.educational_content.count())):
                    participant.completed_lessons.add(content)
                
                participant_count += 1
        
        print(f"    - Created {participant_count} challenge participants")
    
    def _create_achievements(self):
        """Create achievements."""
        achievement_data = [
            ('First Steps', 'LEARNING', 'Complete your first educational content', 'book', '#3B82F6', 'COMMON', 10, 'content_completed', {'count': 1}),
            ('Knowledge Seeker', 'LEARNING', 'Complete 10 educational contents', 'book-open', '#10B981', 'RARE', 50, 'content_completed', {'count': 10}),
            ('Learning Master', 'LEARNING', 'Complete 50 educational contents', 'graduation-cap', '#F59E0B', 'EPIC', 200, 'content_completed', {'count': 50}),
            ('Path Explorer', 'LEARNING', 'Enroll in your first learning path', 'map', '#8B5CF6', 'COMMON', 20, 'path_enrolled', {'count': 1}),
            ('Path Completer', 'LEARNING', 'Complete your first learning path', 'award', '#EC4899', 'RARE', 100, 'path_completed', {'count': 1}),
            ('Savings Champion', 'SAVINGS', 'Complete your first savings challenge', 'piggy-bank', '#14B8A6', 'RARE', 75, 'challenge_completed', {'count': 1}),
            ('Consistent Saver', 'SAVINGS', 'Maintain a 30-day savings streak', 'trending-up', '#F59E0B', 'EPIC', 150, 'streak_days', {'count': 30}),
            ('Webinar Attendee', 'COMMUNITY', 'Attend your first webinar', 'video', '#3B82F6', 'COMMON', 25, 'webinar_attended', {'count': 1}),
            ('Active Learner', 'EXPERIENCE', 'Earn 500 learning points', 'star', '#FFD700', 'LEGENDARY', 500, 'points_earned', {'count': 500}),
            ('Community Helper', 'COMMUNITY', 'Ask 5 questions in webinars', 'message-circle', '#10B981', 'RARE', 50, 'questions_asked', {'count': 5}),
        ]
        
        achievements = []
        for title, ach_type, description, icon, color, rarity, points, criteria_type, criteria_value in achievement_data:
            achievement = Achievement.objects.create(
                title=title,
                description=description,
                icon_name=icon,
                icon_color=color,
                achievement_type=ach_type,
                rarity=rarity,
                points_value=points,
                criteria_type=criteria_type,
                criteria_value=criteria_value,
                is_active=True
            )
            achievements.append(achievement)
        
        print(f"    - Created {len(achievements)} achievements")
        return achievements
    
    def _create_user_achievements(self, achievements):
        """Create user achievements."""
        user_achievement_count = 0
        
        for user in random.sample(self.users, min(20, len(self.users))):
            num_achievements = random.randint(1, 5)
            user_achievements = random.sample(achievements, min(num_achievements, len(achievements)))
            
            for achievement in user_achievements:
                is_unlocked = random.choice([True, True, False])
                progress = 100 if is_unlocked else random.randint(20, 80)
                
                UserAchievement.objects.create(
                    user=user,
                    achievement=achievement,
                    progress=progress,
                    is_unlocked=is_unlocked
                )
                user_achievement_count += 1
        
        print(f"    - Created {user_achievement_count} user achievements")
    
    def _create_certificates(self, learning_paths):
        """Create certificates for completed paths."""
        certificate_count = 0
        
        # Get completed enrollments
        completed_enrollments = LearningPathEnrollment.objects.filter(status='COMPLETED')
        
        for enrollment in completed_enrollments[:20]:  # Limit to 20 certificates
            grade = random.choice(['PASS', 'MERIT', 'DISTINCTION'])
            score = Decimal(str(random.randint(70, 100)))
            
            Certificate.objects.create(
                user=enrollment.user,
                learning_path=enrollment.learning_path,
                title=f'Certificate of Completion: {enrollment.learning_path.title}',
                description=f'Awarded for successfully completing the {enrollment.learning_path.title} learning path.',
                grade=grade,
                score=score,
                is_public=random.choice([True, False])
            )
            certificate_count += 1
        
        print(f"    - Created {certificate_count} certificates")
    
    # ========================================================================
    # AI ASSISTANT
    # ========================================================================
    
    def seed_ai_assistant(self):
        """Seed AI assistant data."""
        conversation_count = 0
        message_count = 0
        advice_count = 0
        
        # Create chat conversations
        for user in random.sample(self.users, 20):
            num_conversations = random.randint(1, 3)
            
            for i in range(num_conversations):
                # Some conversations are group-related
                group = random.choice(self.groups) if random.choice([True, False]) else None
                
                conversation = ChatConversation.objects.create(
                    user=user,
                    group=group,
                    title=random.choice([
                        'Savings Advice',
                        'Investment Questions',
                        'Loan Inquiry',
                        'Financial Planning Help',
                        'Budget Planning',
                        ''
                    ]),
                    is_active=random.choice([True, True, False])
                )
                conversation_count += 1
                
                # Create messages for the conversation
                num_messages = random.randint(3, 10)
                conversation_topics = [
                    ('How can I start saving money?', 'Start by setting aside 10% of your income each month...'),
                    ('What investment options are available?', 'Consider treasury bills, stocks, or mutual funds...'),
                    ('How do I qualify for a loan?', 'You need a good credit score and stable income...'),
                    ('Help me create a budget', 'Let\'s start by listing your monthly income and expenses...'),
                    ('What are the best savings strategies?', 'Try the 50/30/20 rule for budgeting...'),
                ]
                
                for j in range(num_messages):
                    if j % 2 == 0:  # User message
                        question, _ = random.choice(conversation_topics)
                        ChatMessage.objects.create(
                            conversation=conversation,
                            role='USER',
                            content=question,
                            intent=random.choice(['SAVINGS_INQUIRY', 'INVESTMENT_INQUIRY', 'LOAN_INQUIRY', 'GENERAL']),
                            confidence=Decimal(str(random.uniform(0.7, 0.99)))
                        )
                    else:  # Assistant response
                        _, answer = random.choice(conversation_topics)
                        ChatMessage.objects.create(
                            conversation=conversation,
                            role='ASSISTANT',
                            content=answer,
                            metadata={'response_time_ms': random.randint(500, 2000)}
                        )
                    message_count += 1
        
        print(f"  ✓ Created {conversation_count} chat conversations with {message_count} messages")
        
        # Create financial advice
        for user in random.sample(self.users, 15):
            num_advice = random.randint(1, 3)
            
            for _ in range(num_advice):
                advice_type = random.choice(['SAVINGS', 'INVESTMENT', 'LOAN', 'BUDGETING'])
                
                advice_templates = {
                    'SAVINGS': 'Based on your spending patterns, I recommend saving at least 20% of your income...',
                    'INVESTMENT': 'Consider diversifying your portfolio with a mix of stocks and bonds...',
                    'LOAN': 'Your debt-to-income ratio suggests you can afford a loan of up to...',
                    'BUDGETING': 'Your spending analysis shows opportunities to reduce expenses in...'
                }
                
                action_items_templates = {
                    'SAVINGS': ['Open a high-yield savings account', 'Automate monthly savings', 'Track spending'],
                    'INVESTMENT': ['Research investment options', 'Consult with financial advisor', 'Start with small amounts'],
                    'LOAN': ['Check credit score', 'Gather required documents', 'Compare loan offers'],
                    'BUDGETING': ['Create expense categories', 'Use budgeting app', 'Review monthly spending']
                }
                
                FinancialAdvice.objects.create(
                    user=user,
                    group=random.choice(self.groups) if random.choice([True, False, False]) else None,
                    advice_type=advice_type,
                    advice_content=advice_templates[advice_type],
                    action_items=action_items_templates[advice_type],
                    relevance_score=Decimal(str(random.uniform(0.7, 0.95))),
                    user_feedback=random.choice(['HELPFUL', 'NOT_HELPFUL', ''])
                )
                advice_count += 1
        
        print(f"  ✓ Created {advice_count} financial advice records")
    
    # ========================================================================
    # NOTIFICATIONS
    # ========================================================================
    
    def seed_notifications(self):
        """Seed notifications."""
        notification_count = 0
        
        notification_templates = [
            ('CONTRIBUTION', 'HIGH', 'Contribution Due', 'Your monthly contribution of {amount} is due tomorrow.', True, True),
            ('LOAN', 'URGENT', 'Loan Repayment Due', 'Your loan repayment of {amount} is overdue.', True, False),
            ('MEETING', 'MEDIUM', 'Upcoming Meeting', 'Group meeting scheduled for {date}.', False, True),
            ('INVESTMENT', 'LOW', 'Investment Matured', 'Your investment has matured. Amount: {amount}', True, False),
            ('FINANCE', 'HIGH', 'Low Balance Alert', 'Your group balance is below the minimum threshold.', False, False),
            ('SYSTEM', 'MEDIUM', 'Profile Update', 'Please complete your KYC verification.', False, False),
            ('GENERAL', 'LOW', 'New Feature', 'Check out our new education hub!', False, False),
        ]
        
        for user in random.sample(self.users, 30):
            num_notifications = random.randint(5, 15)
            
            for _ in range(num_notifications):
                notif_type, priority, title_template, message_template, has_amount, has_date = random.choice(notification_templates)
                
                # Format message with random data
                title = title_template
                format_args = {}
                if has_amount:
                    format_args['amount'] = f'KES {random.randint(1000, 10000):,}'
                if has_date:
                    format_args['date'] = (timezone.now() + timedelta(days=random.randint(1, 7))).strftime('%Y-%m-%d')
                
                message = message_template.format(**format_args) if format_args else message_template
                
                # Some notifications are group-related
                group = random.choice(self.groups) if notif_type in ['CONTRIBUTION', 'LOAN', 'MEETING', 'FINANCE'] else None
                
                # Random read status
                is_read = random.choice([True, True, False])
                read_at = timezone.now() - timedelta(hours=random.randint(1, 48)) if is_read else None
                
                # Create notification
                Notification.objects.create(
                    user=user,
                    title=title,
                    message=message,
                    notification_type=notif_type,
                    priority=priority,
                    is_read=is_read,
                    is_archived=random.choice([True, False, False, False]),
                    group=group,
                    read_at=read_at,
                    expires_at=timezone.now() + timedelta(days=random.randint(7, 30))
                )
                notification_count += 1
        
        print(f"  ✓ Created {notification_count} notifications")
    
    # ========================================================================
    # WEALTH ENGINE
    # ========================================================================
    
    def seed_wealth_engine(self):
        """Seed wealth engine data."""
        recommendation_count = 0
        rebalance_count = 0
        
        # Create investment recommendations
        for group in random.sample(self.groups, 10):
            num_recommendations = random.randint(1, 3)
            
            for _ in range(num_recommendations):
                investment_type = random.choice(['TREASURY_BILL', 'BOND', 'STOCK', 'MUTUAL_FUND', 'FIXED_DEPOSIT'])
                risk_level = random.choice(['LOW', 'MEDIUM', 'HIGH'])
                
                recommended_amount = Decimal(str(random.choice([50000, 100000, 200000, 500000])))
                expected_return = recommended_amount * Decimal(str(random.uniform(0.05, 0.15)))
                
                analysis_summaries = {
                    'TREASURY_BILL': 'Treasury bills offer low risk with moderate returns. Suitable for conservative investors.',
                    'BOND': 'Government bonds provide stable returns with low to medium risk.',
                    'STOCK': 'Stock investments offer high growth potential but come with higher risk.',
                    'MUTUAL_FUND': 'Mutual funds provide diversification and professional management.',
                    'FIXED_DEPOSIT': 'Fixed deposits offer guaranteed returns with minimal risk.'
                }
                
                status = random.choice(['PENDING', 'ACCEPTED', 'REJECTED', 'EXECUTED'])
                
                # Get a reviewer if status is not PENDING
                reviewer = None
                if status != 'PENDING':
                    admin_memberships = GroupMembership.objects.filter(
                        group=group, role__in=['ADMIN', 'TREASURER']
                    )
                    if admin_memberships.exists():
                        reviewer = random.choice(admin_memberships).user
                
                InvestmentRecommendation.objects.create(
                    group=group,
                    investment_type=investment_type,
                    recommended_amount=recommended_amount,
                    expected_return=expected_return,
                    risk_level=risk_level,
                    duration_days=random.choice([91, 182, 365, 730]),
                    confidence_score=Decimal(str(random.uniform(0.75, 0.95))),
                    analysis_summary=analysis_summaries[investment_type],
                    status=status,
                    reviewed_by=reviewer,
                    reviewed_at=timezone.now() - timedelta(days=random.randint(1, 30)) if status != 'PENDING' else None
                )
                recommendation_count += 1
        
        print(f"  ✓ Created {recommendation_count} investment recommendations")
        
        # Create portfolio rebalance recommendations
        for group in random.sample(self.groups, 5):
            current_allocation = {
                'stocks': random.randint(20, 40),
                'bonds': random.randint(20, 30),
                'real_estate': random.randint(10, 25),
                'cash': random.randint(10, 20),
                'other': 10
            }
            
            recommended_allocation = {
                'stocks': random.randint(25, 45),
                'bonds': random.randint(20, 35),
                'real_estate': random.randint(10, 20),
                'cash': random.randint(5, 15),
                'other': 10
            }
            
            status = random.choice(['PENDING', 'IN_PROGRESS', 'COMPLETED'])
            
            # Get executor if completed
            executor = None
            if status == 'COMPLETED':
                admin_memberships = GroupMembership.objects.filter(
                    group=group, role__in=['ADMIN', 'TREASURER']
                )
                if admin_memberships.exists():
                    executor = random.choice(admin_memberships).user
            
            PortfolioRebalance.objects.create(
                group=group,
                current_allocation=current_allocation,
                recommended_allocation=recommended_allocation,
                rebalance_summary='Rebalancing recommended to optimize risk-return profile and align with group goals.',
                expected_improvement=Decimal(str(random.uniform(2, 8))),
                status=status,
                executed_at=timezone.now() - timedelta(days=random.randint(1, 15)) if status == 'COMPLETED' else None,
                executed_by=executor
            )
            rebalance_count += 1
        
        print(f"  ✓ Created {rebalance_count} portfolio rebalance recommendations")
    
    # ========================================================================
    # GOVERNANCE
    # ========================================================================
    
    def seed_governance(self):
        """Seed governance data."""
        constitution_count = 0
        fine_count = 0
        vote_count = 0
        
        # Constitutions
        for group in random.sample(self.groups, 10):
            GroupConstitution.objects.create(
                group=group,
                title=f'{group.name} Constitution',
                content='This constitution outlines the rules and regulations...',
                membership_rules='All members must be KYC verified...',
                contribution_rules='Contributions are due on the first of each month...',
                loan_policy='Loans are available to members in good standing...',
                exit_procedure='Members wishing to exit must give 30 days notice...',
                late_contribution_fine=Decimal('100.00'),
                missed_meeting_fine=Decimal('50.00'),
                version=1,
                created_by=group.created_by
            )
            constitution_count += 1
        
        print(f"  ✓ Created {constitution_count} group constitutions")
        
        # Fines
        for group in self.groups:
            memberships = GroupMembership.objects.filter(group=group, status='ACTIVE')[:3]
            for membership in memberships:
                if random.random() > 0.5:
                    Fine.objects.create(
                        group=group,
                        member=membership.user,
                        fine_type=random.choice(['LATE_CONTRIBUTION', 'MISSED_MEETING']),
                        amount=Decimal(str(random.choice([50, 100, 200]))),
                        reason='Late contribution payment',
                        status=random.choice(['PENDING', 'PAID', 'PAID']),
                        issued_by=group.created_by
                    )
                    fine_count += 1
        
        print(f"  ✓ Created {fine_count} fines")
        
        # Votes
        vote_titles_and_descriptions = [
            ('Approve New Loan Policy', 'Vote to approve proposed changes to the group loan policy including new interest rates and repayment terms.'),
            ('Elect New Officials', 'Vote to elect new group officials for the upcoming term including Chairperson, Treasurer, and Secretary.'),
            ('Increase Contributions', 'Vote to increase the minimum monthly contribution amount to support group growth and goals.'),
            ('Approve Investment Proposal', 'Vote to approve a new investment opportunity for the group funds.'),
            ('Change Meeting Schedule', 'Vote to change the regular meeting schedule to better accommodate member availability.'),
        ]
        
        for group in random.sample(self.groups, 8):
            start_date = timezone.now() - timedelta(days=random.randint(1, 30))
            title, description = random.choice(vote_titles_and_descriptions)
            vote = Vote.objects.create(
                group=group,
                title=title,
                description=description,
                vote_type=random.choice(['SIMPLE', 'TWO_THIRDS']),
                status=random.choice(['ACTIVE', 'CLOSED', 'CLOSED']),
                start_date=start_date,
                end_date=start_date + timedelta(days=7),
                total_eligible_voters=random.randint(10, 20),
                total_votes_cast=random.randint(5, 15),
                yes_votes=random.randint(3, 10),
                no_votes=random.randint(1, 5),
                abstain_votes=random.randint(0, 2),
                created_by=group.created_by
            )
            vote_count += 1
        
        print(f"  ✓ Created {vote_count} votes")
    
    # ========================================================================
    # AUDIT TRAIL
    # ========================================================================
    
    def seed_audit_trail(self):
        """Seed audit trail data."""
        audit_count = 0
        
        # Create audit logs for some contributions
        contributions = Contribution.objects.all()[:50]
        for contribution in contributions:
            AuditLog.objects.create(
                user=contribution.member,
                action_type='CREATE',
                entity_type='CONTRIBUTION',
                entity_id=contribution.id,
                changes={'amount': str(contribution.amount), 'status': contribution.status},
                ip_address='192.168.1.1',
                user_agent='Mozilla/5.0',
                checksum=DUMMY_CHECKSUM
            )
            audit_count += 1
        
        print(f"  ✓ Created {audit_count} audit log entries")
    
    # ========================================================================
    # SUMMARY
    # ========================================================================
    
    def print_summary(self):
        """Print summary statistics."""
        print("\n" + "=" * 80)
        print("DATABASE SEEDING SUMMARY")
        print("=" * 80)
        print("\n--- Core Data ---")
        print(f"Users: {User.objects.count()}")
        print(f"Groups: {ChamaGroup.objects.count()}")
        print(f"Memberships: {GroupMembership.objects.count()}")
        
        print("\n--- Financial Data ---")
        print(f"Contributions: {Contribution.objects.count()}")
        print(f"Loans: {Loan.objects.count()}")
        print(f"Expenses: {Expense.objects.count()}")
        print(f"Investments: {Investment.objects.count()}")
        print(f"Portfolios: {Portfolio.objects.count()}")
        print(f"M-Pesa Transactions: {MPesaTransaction.objects.count()}")
        
        print("\n--- Education Hub ---")
        print(f"Educational Content: {EducationalContent.objects.count()}")
        print(f"Learning Paths: {LearningPath.objects.count()}")
        print(f"Learning Path Enrollments: {LearningPathEnrollment.objects.count()}")
        print(f"User Progress: {UserProgress.objects.count()}")
        print(f"Savings Challenges: {SavingsChallenge.objects.count()}")
        print(f"Challenge Participants: {ChallengeParticipant.objects.count()}")
        print(f"Webinars: {Webinar.objects.count()}")
        print(f"Webinar Registrations: {WebinarRegistration.objects.count()}")
        print(f"Certificates: {Certificate.objects.count()}")
        print(f"Achievements: {Achievement.objects.count()}")
        print(f"User Achievements: {UserAchievement.objects.count()}")
        
        print("\n--- Gamification ---")
        print(f"Member Achievements: {MemberAchievement.objects.count()}")
        print(f"Contribution Streaks: {ContributionStreak.objects.count()}")
        print(f"Reward Points: {RewardPoints.objects.count()}")
        
        print("\n--- Governance ---")
        print(f"Group Constitutions: {GroupConstitution.objects.count()}")
        print(f"Fines: {Fine.objects.count()}")
        print(f"Votes: {Vote.objects.count()}")
        
        print("\n--- AI & Notifications ---")
        print(f"Chat Conversations: {ChatConversation.objects.count()}")
        print(f"Chat Messages: {ChatMessage.objects.count()}")
        print(f"Financial Advice: {FinancialAdvice.objects.count()}")
        print(f"Notifications: {Notification.objects.count()}")
        
        print("\n--- Wealth Engine ---")
        print(f"Investment Recommendations: {InvestmentRecommendation.objects.count()}")
        print(f"Portfolio Rebalances: {PortfolioRebalance.objects.count()}")
        
        print("\n--- Audit ---")
        print(f"Audit Logs: {AuditLog.objects.count()}")
        print("=" * 80)


if __name__ == '__main__':
    seeder = DataSeeder()
    seeder.seed_all()
