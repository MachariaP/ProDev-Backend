"""
Management command to seed the database with sample investment data.
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from decimal import Decimal
import random
from datetime import timedelta, date

from investments.models import Investment, InvestmentTransaction
from groups.models import ChamaGroup, GroupMembership

User = get_user_model()


class Command(BaseCommand):
    help = 'Seed database with sample investment data'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.WARNING('Starting investment data seeding...'))
        
        # Get all active groups
        groups = ChamaGroup.objects.filter(is_active=True)
        
        if not groups.exists():
            self.stdout.write(self.style.ERROR('No active groups found. Please run seed_data command first.'))
            return
        
        self.stdout.write(f'Found {groups.count()} active groups')
        
        # Create investments for groups
        total_investments = 0
        for group in groups:
            # Each group gets 2-5 investments
            num_investments = random.randint(2, 5)
            
            # Get active members from this group
            active_members = GroupMembership.objects.filter(
                group=group,
                status='ACTIVE'
            ).select_related('user')
            
            if not active_members.exists():
                continue
            
            created_by = random.choice(active_members).user
            
            for _ in range(num_investments):
                investment = self.create_investment(group, created_by)
                if investment:
                    total_investments += 1
                    # Create some transactions for the investment
                    self.create_investment_transactions(investment, created_by)
        
        self.stdout.write(self.style.SUCCESS(f'Successfully created {total_investments} investments!'))

    def create_investment(self, group, created_by):
        """Create a single investment."""
        
        investment_types = [
            ('TREASURY_BILL', 'Treasury Bill'),
            ('FIXED_DEPOSIT', 'Fixed Deposit'),
            ('MONEY_MARKET', 'Money Market Fund'),
            ('STOCKS', 'Stocks/Shares'),
            ('BONDS', 'Corporate Bond'),
            ('REAL_ESTATE', 'Real Estate'),
        ]
        
        investment_type, type_name = random.choice(investment_types)
        
        # Generate investment data
        principal_amount = Decimal(str(random.choice([50000, 100000, 200000, 500000, 1000000])))
        
        # Calculate returns based on investment type
        if investment_type == 'TREASURY_BILL':
            expected_return_rate = Decimal(str(random.uniform(8.0, 12.0))).quantize(Decimal('0.01'))
            duration_days = random.choice([91, 182, 364])
        elif investment_type == 'FIXED_DEPOSIT':
            expected_return_rate = Decimal(str(random.uniform(6.0, 10.0))).quantize(Decimal('0.01'))
            duration_days = random.choice([180, 365, 730])
        elif investment_type == 'MONEY_MARKET':
            expected_return_rate = Decimal(str(random.uniform(7.0, 11.0))).quantize(Decimal('0.01'))
            duration_days = random.choice([90, 180, 365])
        elif investment_type == 'STOCKS':
            expected_return_rate = Decimal(str(random.uniform(-5.0, 25.0))).quantize(Decimal('0.01'))
            duration_days = random.choice([365, 730, 1095])
        elif investment_type == 'BONDS':
            expected_return_rate = Decimal(str(random.uniform(8.0, 14.0))).quantize(Decimal('0.01'))
            duration_days = random.choice([365, 730, 1095, 1825])
        else:  # REAL_ESTATE
            expected_return_rate = Decimal(str(random.uniform(10.0, 20.0))).quantize(Decimal('0.01'))
            duration_days = random.choice([1095, 1825, 3650])
        
        # Calculate purchase and maturity dates
        purchase_date = timezone.now().date() - timedelta(days=random.randint(0, 180))
        maturity_date = purchase_date + timedelta(days=duration_days)
        
        # Calculate current value based on time elapsed and expected returns
        days_elapsed = (timezone.now().date() - purchase_date).days
        years_elapsed = Decimal(str(days_elapsed / 365.25))
        
        # Simple compound interest calculation
        growth_factor = (Decimal('1') + (expected_return_rate / Decimal('100'))) ** years_elapsed
        current_value = (principal_amount * growth_factor).quantize(Decimal('0.01'))
        
        # Add some randomness to current value (+/- 5%)
        variance = Decimal(str(random.uniform(0.95, 1.05)))
        current_value = (current_value * variance).quantize(Decimal('0.01'))
        
        # Determine status
        if timezone.now().date() >= maturity_date:
            status = random.choice(['MATURED', 'SOLD'])
        else:
            status = random.choice(['ACTIVE', 'ACTIVE', 'ACTIVE', 'ACTIVE', 'CANCELLED'])
        
        # Generate investment name
        names_by_type = {
            'TREASURY_BILL': [
                f'T-Bill {duration_days}-Day',
                f'Government T-Bill {duration_days}D',
                f'Treasury Bill {purchase_date.strftime("%b %Y")}'
            ],
            'FIXED_DEPOSIT': [
                f'Fixed Deposit - {duration_days // 365}Y',
                f'Term Deposit {purchase_date.strftime("%b %Y")}',
                f'FD Account #{random.randint(1000, 9999)}'
            ],
            'MONEY_MARKET': [
                'CIC Money Market Fund',
                'Sanlam Money Market',
                'NCBA Money Market Fund',
                'Britam Money Market',
                'Cytonn Money Market Fund'
            ],
            'STOCKS': [
                'Safaricom Shares',
                'KCB Group Stocks',
                'Equity Bank Shares',
                'EABL Stocks',
                'BAT Kenya Shares',
                'Bamburi Cement Stocks',
                'Co-operative Bank Shares'
            ],
            'BONDS': [
                f'Corporate Bond {purchase_date.year}',
                'Infrastructure Bond',
                f'Bond Series {random.choice(["A", "B", "C"])}-{purchase_date.year}',
                'Development Bond'
            ],
            'REAL_ESTATE': [
                'Nairobi Commercial Property',
                'Residential Apartment Units',
                'Land Investment - Kiambu',
                'Real Estate Development Fund',
                'Property Portfolio Investment'
            ]
        }
        
        investment_name = random.choice(names_by_type[investment_type])
        
        descriptions = {
            'TREASURY_BILL': f'Short-term government security with {duration_days} days maturity period.',
            'FIXED_DEPOSIT': f'Fixed deposit account with guaranteed returns over {duration_days // 365} year(s).',
            'MONEY_MARKET': 'Low-risk money market fund investment for stable returns.',
            'STOCKS': 'Equity investment in Nairobi Securities Exchange (NSE) listed company.',
            'BONDS': 'Corporate bond investment with fixed interest payments.',
            'REAL_ESTATE': 'Real estate investment for long-term capital appreciation.'
        }
        
        try:
            investment = Investment.objects.create(
                group=group,
                investment_type=investment_type,
                name=investment_name,
                description=descriptions[investment_type],
                principal_amount=principal_amount,
                current_value=current_value,
                expected_return_rate=expected_return_rate,
                purchase_date=purchase_date,
                maturity_date=maturity_date,
                status=status,
                created_by=created_by,
                notes=f'Created for portfolio tracking and performance monitoring.'
            )
            
            return investment
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error creating investment: {str(e)}'))
            return None

    def create_investment_transactions(self, investment, created_by):
        """Create sample transactions for an investment."""
        
        # Create initial BUY transaction
        InvestmentTransaction.objects.create(
            investment=investment,
            transaction_type='BUY',
            amount=investment.principal_amount,
            transaction_date=investment.purchase_date,
            reference_number=f'BUY-{random.randint(100000, 999999)}',
            notes='Initial investment purchase',
            created_by=created_by
        )
        
        # For matured/sold investments, add maturity or sell transaction
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
        elif investment.status == 'SOLD':
            sell_date = investment.purchase_date + timedelta(
                days=random.randint(30, (investment.maturity_date - investment.purchase_date).days)
            )
            InvestmentTransaction.objects.create(
                investment=investment,
                transaction_type='SELL',
                amount=investment.current_value,
                transaction_date=sell_date,
                reference_number=f'SELL-{random.randint(100000, 999999)}',
                notes='Early investment liquidation',
                created_by=created_by
            )
        
        # Add dividend/interest transactions for some investments
        if investment.investment_type in ['STOCKS', 'BONDS', 'MONEY_MARKET']:
            num_dividends = random.randint(0, 3)
            days_since_purchase = (timezone.now().date() - investment.purchase_date).days
            for i in range(num_dividends):
                if days_since_purchase > 30:
                    dividend_date = investment.purchase_date + timedelta(
                        days=random.randint(30, days_since_purchase)
                    )
                else:
                    continue
                dividend_amount = (investment.principal_amount * Decimal('0.01') * 
                                 random.choice([1, 2, 3, 4, 5]))
                
                transaction_type = 'DIVIDEND' if investment.investment_type == 'STOCKS' else 'INTEREST'
                
                InvestmentTransaction.objects.create(
                    investment=investment,
                    transaction_type=transaction_type,
                    amount=dividend_amount,
                    transaction_date=dividend_date,
                    reference_number=f'{transaction_type[:3]}-{random.randint(100000, 999999)}',
                    notes=f'{transaction_type.capitalize()} payment',
                    created_by=created_by
                )
