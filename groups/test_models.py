"""Tests for groups models."""
from django.test import TestCase
from django.contrib.auth import get_user_model
from decimal import Decimal
from datetime import date, timedelta
from .models import ChamaGroup, GroupMembership, GroupOfficial, GroupGoal

User = get_user_model()


class ChamaGroupModelTest(TestCase):
    """Test ChamaGroup model."""
    
    def setUp(self):
        """Set up test user and group."""
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User',
            phone_number='+254700000000'
        )
        self.group = ChamaGroup.objects.create(
            name='Test Chama',
            description='Test chama group',
            group_type='SAVINGS',
            objectives='Save together',
            created_by=self.user
        )
    
    def test_group_creation(self):
        """Test group creation."""
        self.assertEqual(self.group.name, 'Test Chama')
        self.assertEqual(self.group.group_type, 'SAVINGS')
        self.assertEqual(self.group.created_by, self.user)
        self.assertTrue(self.group.is_active)
        self.assertFalse(self.group.kyb_verified)
    
    def test_group_str(self):
        """Test string representation."""
        self.assertEqual(str(self.group), 'Test Chama')
    
    def test_is_kyb_complete_false(self):
        """Test KYB complete check when incomplete."""
        self.assertFalse(self.group.is_kyb_complete)
    
    def test_total_balance_default(self):
        """Test default total balance."""
        self.assertEqual(self.group.total_balance, Decimal('0.00'))


class GroupMembershipModelTest(TestCase):
    """Test GroupMembership model."""
    
    def setUp(self):
        """Set up test users and group."""
        self.admin_user = User.objects.create_user(
            email='admin@example.com',
            password='testpass123',
            first_name='Admin',
            last_name='User',
            phone_number='+254700000001'
        )
        self.member_user = User.objects.create_user(
            email='member@example.com',
            password='testpass123',
            first_name='Member',
            last_name='User',
            phone_number='+254700000002'
        )
        self.group = ChamaGroup.objects.create(
            name='Test Chama',
            group_type='SAVINGS',
            objectives='Save together',
            created_by=self.admin_user
        )
    
    def test_membership_creation(self):
        """Test membership creation."""
        membership = GroupMembership.objects.create(
            group=self.group,
            user=self.member_user,
            role='MEMBER',
            status='PENDING'
        )
        self.assertEqual(membership.group, self.group)
        self.assertEqual(membership.user, self.member_user)
        self.assertEqual(membership.role, 'MEMBER')
        self.assertEqual(membership.status, 'PENDING')
    
    def test_membership_str(self):
        """Test string representation."""
        membership = GroupMembership.objects.create(
            group=self.group,
            user=self.member_user,
            role='MEMBER'
        )
        expected = f"Member User - Test Chama (MEMBER)"
        self.assertEqual(str(membership), expected)
    
    def test_unique_together_constraint(self):
        """Test unique constraint on group and user."""
        GroupMembership.objects.create(
            group=self.group,
            user=self.member_user,
            role='MEMBER'
        )
        # Creating another membership for same user and group should fail
        with self.assertRaises(Exception):
            GroupMembership.objects.create(
                group=self.group,
                user=self.member_user,
                role='ADMIN'
            )
    
    def test_total_contributions_default(self):
        """Test default total contributions."""
        membership = GroupMembership.objects.create(
            group=self.group,
            user=self.member_user
        )
        self.assertEqual(membership.total_contributions, Decimal('0.00'))


class GroupOfficialModelTest(TestCase):
    """Test GroupOfficial model."""
    
    def setUp(self):
        """Set up test data."""
        self.user = User.objects.create_user(
            email='official@example.com',
            password='testpass123',
            first_name='Official',
            last_name='User',
            phone_number='+254700000003'
        )
        self.group = ChamaGroup.objects.create(
            name='Test Chama',
            group_type='SAVINGS',
            objectives='Save together',
            created_by=self.user
        )
        self.membership = GroupMembership.objects.create(
            group=self.group,
            user=self.user,
            role='ADMIN',
            status='ACTIVE'
        )
    
    def test_official_creation(self):
        """Test official creation."""
        today = date.today()
        term_end = today + timedelta(days=365)
        
        official = GroupOfficial.objects.create(
            group=self.group,
            membership=self.membership,
            position='CHAIRPERSON',
            term_start=today,
            term_end=term_end
        )
        self.assertEqual(official.group, self.group)
        self.assertEqual(official.membership, self.membership)
        self.assertEqual(official.position, 'CHAIRPERSON')
        self.assertTrue(official.is_current)
    
    def test_official_str(self):
        """Test string representation."""
        today = date.today()
        term_end = today + timedelta(days=365)
        
        official = GroupOfficial.objects.create(
            group=self.group,
            membership=self.membership,
            position='TREASURER',
            term_start=today,
            term_end=term_end
        )
        expected = f"Official User - TREASURER (Test Chama)"
        self.assertEqual(str(official), expected)


class GroupGoalModelTest(TestCase):
    """Test GroupGoal model."""
    
    def setUp(self):
        """Set up test data."""
        self.user = User.objects.create_user(
            email='user@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User',
            phone_number='+254700000004'
        )
        self.group = ChamaGroup.objects.create(
            name='Test Chama',
            group_type='INVESTMENT',
            objectives='Invest together',
            created_by=self.user
        )
    
    def test_goal_creation(self):
        """Test goal creation."""
        goal = GroupGoal.objects.create(
            group=self.group,
            title='Buy Land',
            description='Purchase investment land',
            target_amount=Decimal('1000000.00'),
            current_amount=Decimal('0.00'),
            target_date=date.today() + timedelta(days=365),
            created_by=self.user
        )
        self.assertEqual(goal.group, self.group)
        self.assertEqual(goal.title, 'Buy Land')
        self.assertEqual(goal.target_amount, Decimal('1000000.00'))
        self.assertEqual(goal.status, 'ACTIVE')
    
    def test_goal_str(self):
        """Test string representation."""
        goal = GroupGoal.objects.create(
            group=self.group,
            title='Build Rental',
            description='Build rental property',
            target_amount=Decimal('5000000.00'),
            target_date=date.today() + timedelta(days=730),
            created_by=self.user
        )
        expected = "Test Chama - Build Rental"
        self.assertEqual(str(goal), expected)
    
    def test_progress_percentage_zero(self):
        """Test progress percentage when no progress."""
        goal = GroupGoal.objects.create(
            group=self.group,
            title='Test Goal',
            description='Test',
            target_amount=Decimal('100000.00'),
            current_amount=Decimal('0.00'),
            target_date=date.today() + timedelta(days=365),
            created_by=self.user
        )
        self.assertEqual(goal.progress_percentage, 0)
    
    def test_progress_percentage_partial(self):
        """Test progress percentage with partial progress."""
        goal = GroupGoal.objects.create(
            group=self.group,
            title='Test Goal',
            description='Test',
            target_amount=Decimal('100000.00'),
            current_amount=Decimal('25000.00'),
            target_date=date.today() + timedelta(days=365),
            created_by=self.user
        )
        self.assertEqual(goal.progress_percentage, 25.0)
    
    def test_progress_percentage_complete(self):
        """Test progress percentage when complete."""
        goal = GroupGoal.objects.create(
            group=self.group,
            title='Test Goal',
            description='Test',
            target_amount=Decimal('100000.00'),
            current_amount=Decimal('100000.00'),
            target_date=date.today() + timedelta(days=365),
            created_by=self.user
        )
        self.assertEqual(goal.progress_percentage, 100.0)
