"""
Comprehensive database seeding script for ProDev-Backend.
This script seeds all necessary data across all apps in the system.

Usage:
    python manage.py shell < seed_all_data.py
    OR
    python seed_all_data.py
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
from education_hub.models import EducationalContent, UserProgress, SavingsChallenge, ChallengeParticipant, Webinar
from governance.models import GroupConstitution, Fine, Vote, VoteBallot, Document, ComplianceRecord
from audit_trail.models import AuditLog, ComplianceReport, SuspiciousActivityAlert

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
        print("\n[1/10] Seeding Users and Wallets...")
        self.seed_users()
        
        print("[2/10] Seeding Groups and Memberships...")
        self.seed_groups()
        
        # Financial data
        print("[3/10] Seeding Contributions, Loans, and Expenses...")
        self.seed_finance()
        
        print("[4/10] Seeding Investments and Portfolios...")
        self.seed_investments()
        
        # Engagement data
        print("[5/10] Seeding Gamification Data...")
        self.seed_gamification()
        
        print("[6/10] Seeding M-Pesa Transactions...")
        self.seed_mpesa()
        
        print("[7/10] Seeding Education Hub Content...")
        self.seed_education()
        
        print("[8/10] Seeding Governance Data...")
        self.seed_governance()
        
        print("[9/10] Seeding Audit Trail...")
        self.seed_audit_trail()
        
        print("[10/10] Creating Summary Statistics...")
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
                interest = (principal * interest_rate * duration) / (Decimal('100') * Decimal(str(MONTHS_PER_YEAR)))
                total_amount = principal + interest
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
                        LoanRepayment.objects.create(
                            loan=loan,
                            amount=monthly_payment,
                            payment_method=random.choice(['MPESA', 'BANK', 'CASH']),
                            reference_number=f'REP{random.randint(100000, 999999)}',
                            status='COMPLETED'
                        )
                        loan.outstanding_balance -= monthly_payment
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
            Portfolio.objects.create(
                group=group,
                total_invested=Decimal(str(random.uniform(50000, 500000))).quantize(Decimal('0.01')),
                current_value=Decimal(str(random.uniform(50000, 600000))).quantize(Decimal('0.01')),
                stocks_percentage=Decimal(str(random.uniform(20, 40))).quantize(Decimal('0.01')),
                bonds_percentage=Decimal(str(random.uniform(20, 30))).quantize(Decimal('0.01')),
                real_estate_percentage=Decimal(str(random.uniform(10, 25))).quantize(Decimal('0.01')),
                cash_percentage=Decimal(str(random.uniform(10, 20))).quantize(Decimal('0.01')),
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
        
        # Calculate current value
        days_elapsed = (timezone.now().date() - purchase_date).days
        years_elapsed = Decimal(str(days_elapsed / 365.25))
        growth_factor = (Decimal('1') + (expected_return_rate / Decimal('100'))) ** years_elapsed
        current_value = (principal_amount * growth_factor * Decimal(str(random.uniform(0.95, 1.05)))).quantize(Decimal('0.01'))
        
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
    # EDUCATION HUB
    # ========================================================================
    
    def seed_education(self):
        """Seed educational content."""
        content_count = 0
        progress_count = 0
        challenge_count = 0
        
        # Educational Content
        content_data = [
            ('Introduction to Savings', 'ARTICLE', 'SAVINGS', 'BEGINNER', 15),
            ('Investment Basics', 'VIDEO', 'INVESTMENTS', 'BEGINNER', 30),
            ('Understanding Loans', 'TUTORIAL', 'LOANS', 'INTERMEDIATE', 45),
            ('Budgeting for Success', 'ARTICLE', 'BUDGETING', 'BEGINNER', 20),
            ('Advanced Investment Strategies', 'WEBINAR', 'INVESTMENTS', 'ADVANCED', 60),
            ('Financial Planning 101', 'TUTORIAL', 'FINANCIAL_PLANNING', 'INTERMEDIATE', 40),
        ]
        
        contents = []
        for i, (title, ctype, category, difficulty, duration) in enumerate(content_data):
            content = EducationalContent.objects.create(
                title=title,
                slug=title.lower().replace(' ', '-'),
                content_type=ctype,
                category=category,
                difficulty=difficulty,
                description=f'Learn about {title.lower()} in this comprehensive guide.',
                content=f'This is the detailed content about {title.lower()}...',
                duration_minutes=duration,
                points_reward=random.randint(10, 50),
                is_published=True,
                author=random.choice(self.users),
                views_count=random.randint(10, 500)
            )
            contents.append(content)
            content_count += 1
        
        print(f"  ✓ Created {content_count} educational content items")
        
        # User Progress
        for user in random.sample(self.users, 20):
            for content in random.sample(contents, random.randint(1, 3)):
                status = random.choice(['IN_PROGRESS', 'IN_PROGRESS', 'COMPLETED'])
                UserProgress.objects.create(
                    user=user,
                    content=content,
                    status=status,
                    progress_percentage=random.randint(30, 100) if status == 'IN_PROGRESS' else 100,
                    started_at=timezone.now() - timedelta(days=random.randint(1, 30)),
                    completed_at=timezone.now() if status == 'COMPLETED' else None,
                    time_spent_minutes=random.randint(10, content.duration_minutes)
                )
                progress_count += 1
        
        print(f"  ✓ Created {progress_count} user progress records")
        
        # Savings Challenges
        for i in range(5):
            start_date = timezone.now().date() + timedelta(days=random.randint(-30, 30))
            SavingsChallenge.objects.create(
                title=f'Save {random.choice([10000, 25000, 50000])} in {random.choice([30, 60, 90])} Days',
                description='Challenge yourself to save consistently',
                target_amount=Decimal(str(random.choice([10000, 25000, 50000]))),
                duration_days=random.choice([30, 60, 90]),
                start_date=start_date,
                end_date=start_date + timedelta(days=random.choice([30, 60, 90])),
                status=random.choice(['ACTIVE', 'UPCOMING', 'COMPLETED']),
                reward_points=random.randint(50, 200),
                participants_count=random.randint(5, 20),
                created_by=random.choice(self.users)
            )
            challenge_count += 1
        
        print(f"  ✓ Created {challenge_count} savings challenges")
    
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
        for group in random.sample(self.groups, 8):
            start_date = timezone.now() - timedelta(days=random.randint(1, 30))
            vote = Vote.objects.create(
                group=group,
                title=random.choice(['Approve New Loan Policy', 'Elect New Officials', 'Increase Contributions']),
                description='Vote on this important matter',
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
        print(f"Users: {User.objects.count()}")
        print(f"Groups: {ChamaGroup.objects.count()}")
        print(f"Memberships: {GroupMembership.objects.count()}")
        print(f"Contributions: {Contribution.objects.count()}")
        print(f"Loans: {Loan.objects.count()}")
        print(f"Investments: {Investment.objects.count()}")
        print(f"M-Pesa Transactions: {MPesaTransaction.objects.count()}")
        print(f"Educational Content: {EducationalContent.objects.count()}")
        print(f"Achievements: {MemberAchievement.objects.count()}")
        print(f"Audit Logs: {AuditLog.objects.count()}")
        print("=" * 80)


if __name__ == '__main__':
    seeder = DataSeeder()
    seeder.seed_all()
