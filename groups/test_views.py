"""Tests for groups API views."""
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from decimal import Decimal
from datetime import date, timedelta
from .models import ChamaGroup, GroupMembership, GroupOfficial, GroupGoal

User = get_user_model()


class ChamaGroupViewSetTest(TestCase):
    """Test ChamaGroupViewSet."""
    
    def setUp(self):
        """Set up test client and user."""
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User',
            phone_number='+254700000000'
        )
        self.client.force_authenticate(user=self.user)
    
    def test_create_group(self):
        """Test creating a new group."""
        url = reverse('chamagroup-list')
        data = {
            'name': 'New Savings Group',
            'description': 'A test savings group',
            'group_type': 'SAVINGS',
            'objectives': 'Save money together',
            'contribution_frequency': 'MONTHLY',
            'minimum_contribution': '1000.00'
        }
        
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(ChamaGroup.objects.count(), 1)
        
        group = ChamaGroup.objects.first()
        self.assertEqual(group.name, 'New Savings Group')
        self.assertEqual(group.created_by, self.user)
        
        # Check that creator was added as admin
        membership = GroupMembership.objects.filter(group=group, user=self.user).first()
        self.assertIsNotNone(membership)
        self.assertEqual(membership.role, 'ADMIN')
        self.assertEqual(membership.status, 'ACTIVE')
    
    def test_list_groups(self):
        """Test listing groups."""
        # Create a few groups
        for i in range(3):
            ChamaGroup.objects.create(
                name=f'Group {i}',
                group_type='SAVINGS',
                objectives='Test',
                created_by=self.user
            )
        
        url = reverse('chamagroup-list')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 3)
    
    def test_retrieve_group(self):
        """Test retrieving a specific group."""
        group = ChamaGroup.objects.create(
            name='Test Group',
            group_type='INVESTMENT',
            objectives='Test objectives',
            created_by=self.user
        )
        
        url = reverse('chamagroup-detail', kwargs={'pk': group.pk})
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Test Group')
        self.assertEqual(response.data['group_type'], 'INVESTMENT')
    
    def test_my_groups(self):
        """Test getting user's groups."""
        # Create groups
        group1 = ChamaGroup.objects.create(
            name='My Group',
            group_type='SAVINGS',
            objectives='Test',
            created_by=self.user
        )
        group2 = ChamaGroup.objects.create(
            name='Other Group',
            group_type='SAVINGS',
            objectives='Test',
            created_by=self.user
        )
        
        # Add user as active member to group1
        GroupMembership.objects.create(
            group=group1,
            user=self.user,
            status='ACTIVE'
        )
        
        # Add user as pending member to group2 (should not appear)
        GroupMembership.objects.create(
            group=group2,
            user=self.user,
            status='PENDING'
        )
        
        url = reverse('chamagroup-my-groups')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], 'My Group')
    
    def test_dashboard(self):
        """Test group dashboard endpoint."""
        group = ChamaGroup.objects.create(
            name='Dashboard Group',
            group_type='SAVINGS',
            objectives='Test',
            total_balance=Decimal('100000.00'),
            created_by=self.user
        )
        
        # Add some members
        for i in range(3):
            user = User.objects.create_user(
                email=f'member{i}@example.com',
                password='testpass123',
                first_name=f'Member{i}',
                last_name='User',
                phone_number=f'+25470000000{i+1}'
            )
            GroupMembership.objects.create(
                group=group,
                user=user,
                status='ACTIVE'
            )
        
        url = reverse('chamagroup-dashboard', kwargs={'pk': group.pk})
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Dashboard Group')
        self.assertEqual(response.data['member_count'], 3)
        self.assertEqual(response.data['total_balance'], '100000.00')
    
    def test_unauthenticated_access(self):
        """Test that unauthenticated users cannot access endpoints."""
        self.client.force_authenticate(user=None)
        
        url = reverse('chamagroup-list')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class GroupMembershipViewSetTest(TestCase):
    """Test GroupMembershipViewSet."""
    
    def setUp(self):
        """Set up test data."""
        self.client = APIClient()
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
        self.client.force_authenticate(user=self.admin_user)
    
    def test_list_memberships(self):
        """Test listing memberships."""
        GroupMembership.objects.create(
            group=self.group,
            user=self.admin_user,
            role='ADMIN',
            status='ACTIVE'
        )
        GroupMembership.objects.create(
            group=self.group,
            user=self.member_user,
            role='MEMBER',
            status='PENDING'
        )
        
        url = reverse('membership-list')
        response = self.client.get(url, {'group': self.group.id})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 2)
    
    def test_approve_membership(self):
        """Test approving a pending membership."""
        membership = GroupMembership.objects.create(
            group=self.group,
            user=self.member_user,
            role='MEMBER',
            status='PENDING'
        )
        
        url = reverse('membership-approve', kwargs={'pk': membership.pk})
        response = self.client.post(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        membership.refresh_from_db()
        self.assertEqual(membership.status, 'ACTIVE')
        self.assertIsNotNone(membership.approved_at)
    
    def test_approve_non_pending_membership_fails(self):
        """Test that approving non-pending membership fails."""
        membership = GroupMembership.objects.create(
            group=self.group,
            user=self.member_user,
            role='MEMBER',
            status='ACTIVE'
        )
        
        url = reverse('membership-approve', kwargs={'pk': membership.pk})
        response = self.client.post(url)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_suspend_membership(self):
        """Test suspending a membership."""
        membership = GroupMembership.objects.create(
            group=self.group,
            user=self.member_user,
            role='MEMBER',
            status='ACTIVE'
        )
        
        url = reverse('membership-suspend', kwargs={'pk': membership.pk})
        response = self.client.post(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        membership.refresh_from_db()
        self.assertEqual(membership.status, 'SUSPENDED')


class GroupOfficialViewSetTest(TestCase):
    """Test GroupOfficialViewSet."""
    
    def setUp(self):
        """Set up test data."""
        self.client = APIClient()
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
        self.client.force_authenticate(user=self.user)
    
    def test_list_officials(self):
        """Test listing officials."""
        today = date.today()
        GroupOfficial.objects.create(
            group=self.group,
            membership=self.membership,
            position='CHAIRPERSON',
            term_start=today,
            term_end=today + timedelta(days=365),
            is_current=True
        )
        
        url = reverse('official-list')
        response = self.client.get(url, {'group': self.group.id, 'is_current': 'True'})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['position'], 'CHAIRPERSON')


class GroupGoalViewSetTest(TestCase):
    """Test GroupGoalViewSet."""
    
    def setUp(self):
        """Set up test data."""
        self.client = APIClient()
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
        self.client.force_authenticate(user=self.user)
    
    def test_create_goal(self):
        """Test creating a new goal."""
        url = reverse('goal-list')
        data = {
            'group': self.group.id,
            'title': 'Buy Equipment',
            'description': 'Purchase new equipment',
            'target_amount': '500000.00',
            'target_date': (date.today() + timedelta(days=180)).isoformat()
        }
        
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(GroupGoal.objects.count(), 1)
        
        goal = GroupGoal.objects.first()
        self.assertEqual(goal.title, 'Buy Equipment')
        self.assertEqual(goal.created_by, self.user)
    
    def test_list_goals(self):
        """Test listing goals."""
        GroupGoal.objects.create(
            group=self.group,
            title='Goal 1',
            description='Test goal',
            target_amount=Decimal('100000.00'),
            target_date=date.today() + timedelta(days=90),
            created_by=self.user
        )
        GroupGoal.objects.create(
            group=self.group,
            title='Goal 2',
            description='Another test goal',
            target_amount=Decimal('200000.00'),
            target_date=date.today() + timedelta(days=180),
            status='ACHIEVED',
            created_by=self.user
        )
        
        url = reverse('goal-list')
        
        # List all goals
        response = self.client.get(url, {'group': self.group.id})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 2)
        
        # Filter by status
        response = self.client.get(url, {'group': self.group.id, 'status': 'ACTIVE'})
        self.assertEqual(len(response.data['results']), 1)
    
    def test_mark_goal_achieved(self):
        """Test marking a goal as achieved."""
        goal = GroupGoal.objects.create(
            group=self.group,
            title='Test Goal',
            description='Test',
            target_amount=Decimal('100000.00'),
            current_amount=Decimal('100000.00'),
            target_date=date.today() + timedelta(days=90),
            created_by=self.user
        )
        
        url = reverse('goal-mark-achieved', kwargs={'pk': goal.pk})
        response = self.client.post(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        goal.refresh_from_db()
        self.assertEqual(goal.status, 'ACHIEVED')
        self.assertIsNotNone(goal.achieved_at)
