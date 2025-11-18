"""Tests for groups serializers."""
from django.test import TestCase
from django.contrib.auth import get_user_model
from decimal import Decimal
from datetime import date, timedelta
from .models import ChamaGroup, GroupMembership, GroupOfficial, GroupGoal
from .serializers import (
    ChamaGroupSerializer, GroupMembershipSerializer,
    GroupOfficialSerializer, GroupGoalSerializer,
    GroupDashboardSerializer
)

User = get_user_model()


class ChamaGroupSerializerTest(TestCase):
    """Test ChamaGroupSerializer."""
    
    def setUp(self):
        """Set up test data."""
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User',
            phone_number='+254700000000'
        )
        self.group_data = {
            'name': 'Test Savings Group',
            'description': 'A group for testing',
            'group_type': 'SAVINGS',
            'objectives': 'Save money together',
            'contribution_frequency': 'MONTHLY',
            'minimum_contribution': '1000.00'
        }
    
    def test_serialize_group(self):
        """Test serializing a group."""
        group = ChamaGroup.objects.create(
            created_by=self.user,
            **self.group_data
        )
        # Create a membership to test member_count
        GroupMembership.objects.create(
            group=group,
            user=self.user,
            status='ACTIVE'
        )
        
        serializer = ChamaGroupSerializer(group)
        data = serializer.data
        
        self.assertEqual(data['name'], 'Test Savings Group')
        self.assertEqual(data['group_type'], 'SAVINGS')
        self.assertEqual(data['member_count'], 1)
        self.assertFalse(data['is_kyb_complete'])
        self.assertIn('created_by_name', data)
    
    def test_deserialize_group(self):
        """Test deserializing group data."""
        serializer = ChamaGroupSerializer(data=self.group_data)
        self.assertTrue(serializer.is_valid(), serializer.errors)
        
        # Note: created_by is set in the view, not in serializer validation
        group = serializer.save(created_by=self.user)
        self.assertEqual(group.name, 'Test Savings Group')
        self.assertEqual(group.created_by, self.user)


class GroupMembershipSerializerTest(TestCase):
    """Test GroupMembershipSerializer."""
    
    def setUp(self):
        """Set up test data."""
        self.user = User.objects.create_user(
            email='member@example.com',
            password='testpass123',
            first_name='Member',
            last_name='User',
            phone_number='+254700000001'
        )
        self.creator = User.objects.create_user(
            email='creator@example.com',
            password='testpass123',
            first_name='Creator',
            last_name='User',
            phone_number='+254700000002'
        )
        self.group = ChamaGroup.objects.create(
            name='Test Chama',
            group_type='SAVINGS',
            objectives='Save together',
            created_by=self.creator
        )
    
    def test_serialize_membership(self):
        """Test serializing a membership."""
        membership = GroupMembership.objects.create(
            group=self.group,
            user=self.user,
            role='MEMBER',
            status='ACTIVE'
        )
        
        serializer = GroupMembershipSerializer(membership)
        data = serializer.data
        
        self.assertEqual(data['role'], 'MEMBER')
        self.assertEqual(data['status'], 'ACTIVE')
        self.assertEqual(data['group_name'], 'Test Chama')
        self.assertIn('user_details', data)
        self.assertEqual(data['total_contributions'], '0.00')


class GroupOfficialSerializerTest(TestCase):
    """Test GroupOfficialSerializer."""
    
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
    
    def test_serialize_official(self):
        """Test serializing an official."""
        today = date.today()
        official = GroupOfficial.objects.create(
            group=self.group,
            membership=self.membership,
            position='CHAIRPERSON',
            term_start=today,
            term_end=today + timedelta(days=365)
        )
        
        serializer = GroupOfficialSerializer(official)
        data = serializer.data
        
        self.assertEqual(data['position'], 'CHAIRPERSON')
        self.assertEqual(data['group_name'], 'Test Chama')
        self.assertEqual(data['official_name'], 'Official User')
        self.assertTrue(data['is_current'])


class GroupGoalSerializerTest(TestCase):
    """Test GroupGoalSerializer."""
    
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
    
    def test_serialize_goal(self):
        """Test serializing a goal."""
        goal = GroupGoal.objects.create(
            group=self.group,
            title='Buy Equipment',
            description='Purchase new equipment',
            target_amount=Decimal('500000.00'),
            current_amount=Decimal('125000.00'),
            target_date=date.today() + timedelta(days=180),
            created_by=self.user
        )
        
        serializer = GroupGoalSerializer(goal)
        data = serializer.data
        
        self.assertEqual(data['title'], 'Buy Equipment')
        self.assertEqual(data['group_name'], 'Test Chama')
        self.assertEqual(data['status'], 'ACTIVE')
        self.assertEqual(float(data['progress_percentage']), 25.0)
    
    def test_deserialize_goal(self):
        """Test deserializing goal data."""
        goal_data = {
            'group': self.group.id,
            'title': 'New Project',
            'description': 'Fund a new project',
            'target_amount': '1000000.00',
            'target_date': (date.today() + timedelta(days=365)).isoformat()
        }
        
        serializer = GroupGoalSerializer(data=goal_data)
        self.assertTrue(serializer.is_valid(), serializer.errors)
        
        goal = serializer.save(created_by=self.user)
        self.assertEqual(goal.title, 'New Project')
        self.assertEqual(goal.group, self.group)


class GroupDashboardSerializerTest(TestCase):
    """Test GroupDashboardSerializer."""
    
    def setUp(self):
        """Set up test data."""
        self.user = User.objects.create_user(
            email='user@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User',
            phone_number='+254700000005'
        )
        self.group = ChamaGroup.objects.create(
            name='Dashboard Test Chama',
            group_type='SAVINGS',
            objectives='Save together',
            total_balance=Decimal('50000.00'),
            created_by=self.user
        )
        # Create active memberships
        for i in range(3):
            user = User.objects.create_user(
                email=f'member{i}@example.com',
                password='testpass123',
                first_name=f'Member{i}',
                last_name='User',
                phone_number=f'+25470000000{i+6}'
            )
            GroupMembership.objects.create(
                group=self.group,
                user=user,
                status='ACTIVE'
            )
    
    def test_serialize_dashboard(self):
        """Test serializing dashboard data."""
        serializer = GroupDashboardSerializer(self.group)
        data = serializer.data
        
        self.assertEqual(data['name'], 'Dashboard Test Chama')
        self.assertEqual(data['group_type'], 'SAVINGS')
        self.assertEqual(data['total_balance'], '50000.00')
        self.assertEqual(data['member_count'], 3)
        # These will be 0 since we didn't create any contributions/loans
        self.assertEqual(data['total_contributions'], 0)
        self.assertEqual(data['total_loans_outstanding'], 0)
        self.assertEqual(data['total_investments'], 0)
