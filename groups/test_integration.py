"""Integration tests for Group Management API to verify all requirements from the problem statement."""
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from decimal import Decimal
from datetime import date, timedelta
from .models import ChamaGroup, GroupMembership, GroupOfficial, GroupGoal

User = get_user_model()


class GroupManagementIntegrationTest(TestCase):
    """
    Integration test to verify the complete group management flow
    as described in the problem statement.
    """
    
    def setUp(self):
        """Set up test data."""
        self.client = APIClient()
        
        # Create users
        self.admin_user = User.objects.create_user(
            email='admin@example.com',
            password='testpass123',
            first_name='Admin',
            last_name='User',
            phone_number='+254700000001'
        )
        self.member1 = User.objects.create_user(
            email='member1@example.com',
            password='testpass123',
            first_name='Member',
            last_name='One',
            phone_number='+254700000002'
        )
        self.member2 = User.objects.create_user(
            email='member2@example.com',
            password='testpass123',
            first_name='Member',
            last_name='Two',
            phone_number='+254700000003'
        )
        
        self.client.force_authenticate(user=self.admin_user)
    
    def test_complete_group_workflow(self):
        """
        Test the complete group workflow from creation to management.
        This verifies all the functionality described in the problem statement.
        """
        # ===== 1. CREATE GROUP =====
        # Frontend: "Create Group" Form
        # Endpoint: POST /api/v1/groups/chama-groups/
        create_url = reverse('chamagroup-list')
        group_data = {
            'name': 'Test Savings Group',
            'description': 'A test savings group',
            'group_type': 'SAVINGS',
            'objectives': 'Save money together for community development',
            'contribution_frequency': 'MONTHLY',
            'minimum_contribution': '1000.00'
        }
        
        response = self.client.post(create_url, group_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        group_id = response.data['id']
        group = ChamaGroup.objects.get(id=group_id)
        
        # Verify creator was automatically added as ADMIN
        admin_membership = GroupMembership.objects.filter(
            group=group,
            user=self.admin_user,
            role='ADMIN',
            status='ACTIVE'
        ).first()
        self.assertIsNotNone(admin_membership)
        
        # ===== 2. FETCH GROUP DASHBOARD =====
        # Frontend: Group Dashboard/Overview Tab
        # Endpoint: GET /api/v1/groups/chama-groups/{id}/dashboard/
        dashboard_url = reverse('chamagroup-dashboard', kwargs={'pk': group_id})
        response = self.client.get(dashboard_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('name', response.data)
        self.assertIn('total_balance', response.data)
        self.assertIn('member_count', response.data)
        self.assertIn('total_contributions', response.data)
        self.assertIn('active_goals', response.data)
        self.assertEqual(response.data['name'], 'Test Savings Group')
        self.assertEqual(response.data['member_count'], 1)  # Only admin so far
        
        # ===== 3. MY GROUPS =====
        # Frontend: Sidebar/Dashboard
        # Endpoint: GET /api/v1/groups/chama-groups/my_groups/
        my_groups_url = reverse('chamagroup-my-groups')
        response = self.client.get(my_groups_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['id'], group_id)
        
        # ===== 4. ADD MEMBERS (PENDING) =====
        # Simulate members joining the group
        membership_url = reverse('membership-list')
        
        membership1 = GroupMembership.objects.create(
            group=group,
            user=self.member1,
            role='MEMBER',
            status='PENDING'
        )
        membership2 = GroupMembership.objects.create(
            group=group,
            user=self.member2,
            role='MEMBER',
            status='PENDING'
        )
        
        # ===== 5. FETCH MEMBERS =====
        # Frontend: Member Management Tab
        # Endpoint: GET /api/v1/groups/memberships/?group={group_id}
        response = self.client.get(membership_url, {'group': group_id})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 3)  # admin + 2 members
        
        # ===== 6. APPROVE MEMBERSHIP =====
        # Frontend: Admin clicks "Approve" button
        # Endpoint: POST /api/v1/groups/memberships/{id}/approve/
        approve_url = reverse('membership-approve', kwargs={'pk': membership1.pk})
        response = self.client.post(approve_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        membership1.refresh_from_db()
        self.assertEqual(membership1.status, 'ACTIVE')
        self.assertIsNotNone(membership1.approved_at)
        
        # ===== 7. SUSPEND MEMBERSHIP =====
        # Frontend: Admin clicks "Suspend" button
        # Endpoint: POST /api/v1/groups/memberships/{id}/suspend/
        suspend_url = reverse('membership-suspend', kwargs={'pk': membership2.pk})
        response = self.client.post(suspend_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        membership2.refresh_from_db()
        self.assertEqual(membership2.status, 'SUSPENDED')
        
        # ===== 8. CREATE GOALS =====
        # Frontend: New Goal Form
        # Endpoint: POST /api/v1/groups/goals/
        goals_url = reverse('goal-list')
        goal_data = {
            'group': group_id,
            'title': 'Buy Group Vehicle',
            'description': 'Save for a group transport vehicle',
            'target_amount': '2000000.00',
            'target_date': (date.today() + timedelta(days=365)).isoformat()
        }
        
        response = self.client.post(goals_url, goal_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        goal_id = response.data['id']
        
        # ===== 9. FETCH GOALS WITH PROGRESS =====
        # Frontend: Goals and Objectives Tab
        # Endpoint: GET /api/v1/groups/goals/?group={group_id}
        response = self.client.get(goals_url, {'group': group_id})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        
        goal_data = response.data['results'][0]
        self.assertIn('progress_percentage', goal_data)
        self.assertEqual(float(goal_data['progress_percentage']), 0.0)  # No contributions yet
        
        # Update goal progress
        goal = GroupGoal.objects.get(id=goal_id)
        goal.current_amount = Decimal('1000000.00')  # 50% funded
        goal.save()
        
        response = self.client.get(goals_url, {'group': group_id})
        goal_data = response.data['results'][0]
        self.assertEqual(float(goal_data['progress_percentage']), 50.0)
        
        # ===== 10. MARK GOAL AS ACHIEVED =====
        # Frontend: Admin marks goal complete
        # Endpoint: POST /api/v1/groups/goals/{id}/mark_achieved/
        goal.current_amount = Decimal('2000000.00')  # Fully funded
        goal.save()
        
        achieve_url = reverse('goal-mark-achieved', kwargs={'pk': goal_id})
        response = self.client.post(achieve_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        goal.refresh_from_db()
        self.assertEqual(goal.status, 'ACHIEVED')
        self.assertIsNotNone(goal.achieved_at)
        
        # ===== 11. CREATE OFFICIALS =====
        # Add group officials
        today = date.today()
        
        chairperson = GroupOfficial.objects.create(
            group=group,
            membership=admin_membership,
            position='CHAIRPERSON',
            term_start=today,
            term_end=today + timedelta(days=365),
            is_current=True
        )
        
        # Use the already approved membership for member1
        membership1.refresh_from_db()
        
        treasurer = GroupOfficial.objects.create(
            group=group,
            membership=membership1,
            position='TREASURER',
            term_start=today,
            term_end=today + timedelta(days=365),
            is_current=True
        )
        
        # ===== 12. FETCH CURRENT OFFICIALS =====
        # Frontend: Leadership/Officials Tab
        # Endpoint: GET /api/v1/groups/officials/?group={group_id}&is_current=True
        officials_url = reverse('official-list')
        response = self.client.get(officials_url, {
            'group': group_id,
            'is_current': 'True'
        })
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 2)  # Chairperson and Treasurer
        
        positions = [official['position'] for official in response.data['results']]
        self.assertIn('CHAIRPERSON', positions)
        self.assertIn('TREASURER', positions)
        
        # ===== 13. VERIFY DASHBOARD WITH ALL DATA =====
        response = self.client.get(dashboard_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # We have: admin (active) + member1 (active) = 2 active members
        # member2 was suspended
        self.assertEqual(response.data['member_count'], 2)
        
        # Verify active goals are included
        self.assertIn('active_goals', response.data)
    
    def test_goal_progress_percentage_calculation(self):
        """Test that goal progress percentage is calculated correctly."""
        group = ChamaGroup.objects.create(
            name='Test Group',
            group_type='SAVINGS',
            objectives='Test',
            created_by=self.admin_user
        )
        
        goal = GroupGoal.objects.create(
            group=group,
            title='Test Goal',
            description='Test',
            target_amount=Decimal('100000.00'),
            current_amount=Decimal('25000.00'),  # 25% funded
            target_date=date.today() + timedelta(days=90),
            created_by=self.admin_user
        )
        
        # Test via serializer
        goals_url = reverse('goal-list')
        response = self.client.get(goals_url, {'group': group.id})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        goal_data = response.data['results'][0]
        self.assertEqual(float(goal_data['progress_percentage']), 25.0)
    
    def test_membership_filtering_by_group(self):
        """Test that memberships can be filtered by group."""
        # Create two groups
        group1 = ChamaGroup.objects.create(
            name='Group 1',
            group_type='SAVINGS',
            objectives='Test',
            created_by=self.admin_user
        )
        group2 = ChamaGroup.objects.create(
            name='Group 2',
            group_type='INVESTMENT',
            objectives='Test',
            created_by=self.admin_user
        )
        
        # Add members to both groups
        GroupMembership.objects.create(group=group1, user=self.member1, status='ACTIVE')
        GroupMembership.objects.create(group=group2, user=self.member1, status='ACTIVE')
        GroupMembership.objects.create(group=group1, user=self.member2, status='PENDING')
        
        # Test filtering
        membership_url = reverse('membership-list')
        response = self.client.get(membership_url, {'group': group1.id})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 2)  # member1 and member2 in group1
    
    def test_officials_filtering_by_is_current(self):
        """Test that officials can be filtered by is_current status."""
        group = ChamaGroup.objects.create(
            name='Test Group',
            group_type='SAVINGS',
            objectives='Test',
            created_by=self.admin_user
        )
        
        membership = GroupMembership.objects.create(
            group=group,
            user=self.admin_user,
            status='ACTIVE'
        )
        
        today = date.today()
        
        # Current official
        current_official = GroupOfficial.objects.create(
            group=group,
            membership=membership,
            position='CHAIRPERSON',
            term_start=today,
            term_end=today + timedelta(days=365),
            is_current=True
        )
        
        # Past official
        past_official = GroupOfficial.objects.create(
            group=group,
            membership=membership,
            position='TREASURER',
            term_start=today - timedelta(days=730),
            term_end=today - timedelta(days=365),
            is_current=False
        )
        
        # Test filtering for current officials only
        officials_url = reverse('official-list')
        response = self.client.get(officials_url, {
            'group': group.id,
            'is_current': 'True'
        })
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['position'], 'CHAIRPERSON')
