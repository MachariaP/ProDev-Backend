"""
Management command to seed the database with sample data.
This includes 50 African members and diverse group data.
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from decimal import Decimal
import random
from datetime import timedelta, date

from accounts.models import MemberWallet
from groups.models import ChamaGroup, GroupMembership, GroupOfficial, GroupGoal, GroupMessage
from finance.models import Contribution, Loan, LoanRepayment, Expense

User = get_user_model()


class Command(BaseCommand):
    help = 'Seed database with 50 African members and diverse group data'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.WARNING('Starting data seeding...'))
        
        # Clear existing data (optional - comment out if you want to keep existing data)
        self.stdout.write('Clearing existing data...')
        User.objects.filter(is_superuser=False).delete()
        
        # Create users
        users = self.create_users()
        self.stdout.write(self.style.SUCCESS(f'Created {len(users)} users'))
        
        # Create groups
        groups = self.create_groups(users)
        self.stdout.write(self.style.SUCCESS(f'Created {len(groups)} groups'))
        
        # Create memberships
        self.create_memberships(users, groups)
        self.stdout.write(self.style.SUCCESS('Created group memberships'))
        
        # Create group officials
        self.create_officials(groups)
        self.stdout.write(self.style.SUCCESS('Created group officials'))
        
        # Create group goals
        self.create_goals(groups, users)
        self.stdout.write(self.style.SUCCESS('Created group goals'))
        
        # Create contributions
        self.create_contributions(groups, users)
        self.stdout.write(self.style.SUCCESS('Created contributions'))
        
        # Create loans
        self.create_loans(groups, users)
        self.stdout.write(self.style.SUCCESS('Created loans'))
        
        # Create expenses
        self.create_expenses(groups, users)
        self.stdout.write(self.style.SUCCESS('Created expenses'))
        
        # Create group messages
        self.create_messages(groups, users)
        self.stdout.write(self.style.SUCCESS('Created group messages'))
        
        self.stdout.write(self.style.SUCCESS('Database seeded successfully!'))

    def create_users(self):
        """Create 50 African members with diverse names and locations."""
        
        # African first names (diverse across the continent)
        first_names = [
            'Amara', 'Kwame', 'Zuri', 'Kofi', 'Nia', 'Jabari', 'Aisha', 'Chinua',
            'Fatima', 'Themba', 'Zola', 'Kamau', 'Makena', 'Sekou', 'Thandiwe', 'Bandele',
            'Chiamaka', 'Otieno', 'Wanjiru', 'Muthoni', 'Akosua', 'Adwoa', 'Yaa', 'Kojo',
            'Nana', 'Kweku', 'Abena', 'Imani', 'Naledi', 'Sipho', 'Thabo', 'Lerato',
            'Nomsa', 'Zanele', 'Mandla', 'Precious', 'Chidi', 'Ngozi', 'Emeka', 'Chioma',
            'Ade', 'Bayo', 'Dayo', 'Folake', 'Ife', 'Kemi', 'Lola', 'Ola', 'Sade', 'Tunde'
        ]
        
        # African last names (diverse across regions)
        last_names = [
            'Okonkwo', 'Mwangi', 'Ndlovu', 'Mensah', 'Diop', 'Hassan', 'Kamara', 'Okeke',
            'Nkosi', 'Traore', 'Kenyatta', 'Abiola', 'Mutua', 'Moyo', 'Banda', 'Phiri',
            'Okoth', 'Wafula', 'Nyambura', 'Kipchoge', 'Adeyemi', 'Oluwaseun', 'Chebet', 'Rotich',
            'Kiplagat', 'Kiprono', 'Juma', 'Otieno', 'Achieng', 'Onyango', 'Owino', 'Awuor',
            'Odhiambo', 'Ouma', 'Adhiambo', 'Akinyi', 'Ababio', 'Acquah', 'Adjei', 'Afful',
            'Boateng', 'Darko', 'Essien', 'Frimpong', 'Gyasi', 'Kuffour', 'Mensah', 'Owusu',
            'Sarfo', 'Yeboah'
        ]
        
        # Kenyan cities and towns
        locations = [
            'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika', 'Malindi', 'Kitale',
            'Garissa', 'Kakamega', 'Nyeri', 'Meru', 'Machakos', 'Kiambu', 'Kericho', 'Embu',
            'Naivasha', 'Kitui', 'Bungoma', 'Homa Bay'
        ]
        
        users = []
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
                kyc_verified=random.choice([True, True, True, False]),  # 75% verified
                credit_score=Decimal(str(random.uniform(300, 850))).quantize(Decimal('0.01'))
            )
            
            # Create wallet for each user
            MemberWallet.objects.create(
                user=user,
                balance=Decimal(str(random.uniform(1000, 50000))).quantize(Decimal('0.01'))
            )
            
            users.append(user)
        
        return users

    def create_groups(self, users):
        """Create diverse Chama groups."""
        
        group_names = [
            'Umoja Savings Group', 'Harambee Investment Club', 'Mwanzo Welfare Society',
            'Tumaini Women Group', 'Jamii Development Fund', 'Ushirika Farmers Cooperative',
            'Bidii Youth Group', 'Tujenge Together', 'Amani Community Fund', 'Fahari Business Circle',
            'Neema Ladies Chama', 'Upendo Social Club', 'Baraka Investment Group', 'Furaha Sacco',
            'Maendeleo Progressive Group'
        ]
        
        group_types = ['SAVINGS', 'INVESTMENT', 'WELFARE', 'MIXED']
        frequencies = ['WEEKLY', 'BIWEEKLY', 'MONTHLY']
        
        groups = []
        for i, name in enumerate(group_names):
            group = ChamaGroup.objects.create(
                name=name,
                description=f'A community-based {random.choice(group_types).lower()} group focused on financial empowerment and mutual support.',
                group_type=random.choice(group_types),
                objectives=f'To provide financial support and foster economic growth among members through regular contributions and strategic investments.',
                contribution_frequency=random.choice(frequencies),
                minimum_contribution=Decimal(str(random.choice([500, 1000, 2000, 5000]))),
                total_balance=Decimal('0.00'),
                is_active=True,
                kyb_verified=random.choice([True, True, False]),  # 66% verified
                created_by=random.choice(users)
            )
            groups.append(group)
        
        return groups

    def create_memberships(self, users, groups):
        """Create group memberships."""
        
        for group in groups:
            # Each group gets 8-15 random members
            num_members = random.randint(8, 15)
            group_users = random.sample(users, num_members)
            
            # First member is admin (creator)
            admin_user = group_users[0]
            GroupMembership.objects.create(
                group=group,
                user=admin_user,
                role='ADMIN',
                status='ACTIVE',
                total_contributions=Decimal(str(random.uniform(5000, 50000))).quantize(Decimal('0.01'))
            )
            
            # Other members have various roles
            roles = ['MEMBER'] * 10 + ['TREASURER', 'SECRETARY', 'CHAIRPERSON']
            for user in group_users[1:]:
                GroupMembership.objects.create(
                    group=group,
                    user=user,
                    role=random.choice(roles),
                    status=random.choice(['ACTIVE', 'ACTIVE', 'ACTIVE', 'PENDING']),  # 75% active
                    total_contributions=Decimal(str(random.uniform(1000, 30000))).quantize(Decimal('0.01'))
                )

    def create_officials(self, groups):
        """Create group officials."""
        
        positions = ['CHAIRPERSON', 'TREASURER', 'SECRETARY']
        
        for group in groups:
            # Get active memberships with officer roles
            active_memberships = GroupMembership.objects.filter(
                group=group,
                status='ACTIVE'
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

    def create_goals(self, groups, users):
        """Create group financial goals."""
        
        goal_titles = [
            'Emergency Fund Target', 'Investment Capital Pool', 'Member Loan Fund',
            'Community Project', 'Annual Retreat Fund', 'Education Support Fund',
            'Business Expansion Capital', 'Property Purchase Fund'
        ]
        
        for group in groups:
            # Each group gets 1-3 goals
            num_goals = random.randint(1, 3)
            for _ in range(num_goals):
                target_amount = Decimal(str(random.choice([100000, 250000, 500000, 1000000])))
                current_amount = target_amount * Decimal(str(random.uniform(0.1, 0.8))).quantize(Decimal('0.01'))
                
                GroupGoal.objects.create(
                    group=group,
                    title=random.choice(goal_titles),
                    description=f'Group goal to achieve financial milestone for collective benefit.',
                    target_amount=target_amount,
                    current_amount=current_amount,
                    target_date=timezone.now().date() + timedelta(days=random.randint(90, 365)),
                    status=random.choice(['ACTIVE', 'ACTIVE', 'ACTIVE', 'ACHIEVED']),
                    created_by=random.choice(users)
                )

    def create_contributions(self, groups, users):
        """Create member contributions."""
        
        payment_methods = ['MPESA', 'MPESA', 'MPESA', 'BANK', 'CASH']  # 60% M-Pesa
        
        for group in groups:
            memberships = GroupMembership.objects.filter(group=group, status='ACTIVE')
            
            # Each member makes 5-15 contributions
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
                    
                    # Update group balance for completed contributions
                    if contribution.status in ['COMPLETED', 'RECONCILED']:
                        group.total_balance += amount
                        membership.total_contributions += amount
                        membership.save()
            
            group.save()

    def create_loans(self, groups, users):
        """Create loan applications and repayments."""
        
        statuses = ['APPROVED', 'DISBURSED', 'ACTIVE', 'COMPLETED', 'PENDING']
        
        for group in groups:
            memberships = GroupMembership.objects.filter(group=group, status='ACTIVE')
            
            # 30-50% of members have loans
            num_loans = int(memberships.count() * random.uniform(0.3, 0.5))
            loan_members = random.sample(list(memberships), num_loans)
            
            for membership in loan_members:
                principal = Decimal(str(random.choice([10000, 25000, 50000, 100000, 200000])))
                interest_rate = Decimal(str(random.uniform(5, 15))).quantize(Decimal('0.01'))
                duration = random.choice([3, 6, 12, 24])
                
                loan = Loan.objects.create(
                    group=group,
                    borrower=membership.user,
                    principal_amount=principal,
                    interest_rate=interest_rate,
                    duration_months=duration,
                    total_amount=Decimal('0'),  # Will be calculated in save()
                    monthly_payment=Decimal('0'),  # Will be calculated in save()
                    outstanding_balance=Decimal('0'),  # Will be calculated in save()
                    status=random.choice(statuses),
                    purpose=random.choice([
                        'Business expansion', 'Emergency medical expenses',
                        'Education fees', 'Home improvement', 'Agricultural investment',
                        'Stock purchase', 'Equipment purchase'
                    ])
                )
                
                # Create some repayments for active/completed loans
                if loan.status in ['ACTIVE', 'COMPLETED']:
                    num_repayments = random.randint(1, duration)
                    for _ in range(num_repayments):
                        LoanRepayment.objects.create(
                            loan=loan,
                            amount=loan.monthly_payment,
                            payment_method=random.choice(['MPESA', 'BANK', 'CASH']),
                            reference_number=f'REP{random.randint(100000, 999999)}',
                            status='COMPLETED'
                        )
                        loan.outstanding_balance -= loan.monthly_payment
                    loan.save()

    def create_expenses(self, groups, users):
        """Create group expenses."""
        
        categories = ['OPERATIONAL', 'ADMINISTRATIVE', 'WELFARE', 'INVESTMENT', 'OTHER']
        
        for group in groups:
            active_memberships = list(GroupMembership.objects.filter(
                group=group,
                status='ACTIVE',
                role__in=['ADMIN', 'TREASURER', 'SECRETARY']
            ))
            
            if not active_memberships:
                continue
            
            # Each group has 3-8 expenses
            num_expenses = random.randint(3, 8)
            for _ in range(num_expenses):
                Expense.objects.create(
                    group=group,
                    category=random.choice(categories),
                    description=random.choice([
                        'Meeting venue rental', 'Stationery and office supplies',
                        'Member welfare support', 'Investment opportunity',
                        'Legal and registration fees', 'Audit services',
                        'Training and capacity building', 'Communication costs'
                    ]),
                    amount=Decimal(str(random.uniform(1000, 20000))).quantize(Decimal('0.01')),
                    status=random.choice(['APPROVED', 'DISBURSED', 'PENDING', 'REJECTED']),
                    requested_by=random.choice(active_memberships).user
                )

    def create_messages(self, groups, users):
        """Create group chat messages."""
        
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
            'Reminder: Loan applications are now open.',
            'We\'ve reached 80% of our target!',
            'Thanks to our treasurer for the excellent work.',
            'Let\'s brainstorm ideas for our next project.',
            'Please update your contact information if changed.'
        ]
        
        for group in groups:
            memberships = GroupMembership.objects.filter(group=group, status='ACTIVE')
            
            # Each group has 10-30 messages
            num_messages = random.randint(10, 30)
            for _ in range(num_messages):
                GroupMessage.objects.create(
                    group=group,
                    user=random.choice(memberships).user,
                    content=random.choice(messages_content)
                )
