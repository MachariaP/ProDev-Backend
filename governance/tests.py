from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from rest_framework.test import APITestCase
from rest_framework import status
from groups.models import ChamaGroup, GroupMembership
from .models import Vote, VoteBallot

User = get_user_model()


class VoteTests(APITestCase):
    """Tests for voting functionality."""
    
    def setUp(self):
        """Set up test data."""
        # Create test users
        self.user1 = User.objects.create_user(
            email='user1@test.com',
            password='testpass123',
            first_name='User',
            last_name='One',
            phone_number='+254700000001'
        )
        self.user2 = User.objects.create_user(
            email='user2@test.com',
            password='testpass123',
            first_name='User',
            last_name='Two',
            phone_number='+254700000002'
        )
        
        # Create test group
        self.group = ChamaGroup.objects.create(
            name='Test Group',
            description='Test group for voting',
            group_type='SAVINGS',
            contribution_frequency='MONTHLY',
            minimum_contribution=1000.00,
            created_by=self.user1
        )
        
        # Create memberships
        self.membership1 = GroupMembership.objects.create(
            group=self.group,
            user=self.user1,
            role='ADMIN',
            status='ACTIVE'
        )
        self.membership2 = GroupMembership.objects.create(
            group=self.group,
            user=self.user2,
            role='MEMBER',
            status='ACTIVE'
        )
        
        # Create test vote
        self.vote = Vote.objects.create(
            group=self.group,
            title='Test Vote',
            description='Test vote description',
            vote_type='SIMPLE',
            status='DRAFT',
            start_date=timezone.now(),
            end_date=timezone.now() + timedelta(days=7),
            total_eligible_voters=2,
            created_by=self.user1
        )
    
    def test_create_vote(self):
        """Test creating a vote."""
        self.client.force_authenticate(user=self.user1)
        
        data = {
            'group': self.group.id,
            'title': 'New Vote',
            'description': 'New vote description',
            'vote_type': 'SIMPLE',
            'status': 'DRAFT',
            'start_date': timezone.now().isoformat(),
            'end_date': (timezone.now() + timedelta(days=7)).isoformat()
        }
        
        response = self.client.post('/governance/votes/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Vote.objects.count(), 2)
        
        # Check that total_eligible_voters was set automatically
        new_vote = Vote.objects.get(title='New Vote')
        self.assertEqual(new_vote.total_eligible_voters, 2)
    
    def test_activate_vote(self):
        """Test activating a vote."""
        self.client.force_authenticate(user=self.user1)
        
        response = self.client.post(f'/governance/votes/{self.vote.id}/activate/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.vote.refresh_from_db()
        self.assertEqual(self.vote.status, 'ACTIVE')
    
    def test_cast_vote(self):
        """Test casting a vote."""
        # Activate the vote first
        self.vote.status = 'ACTIVE'
        self.vote.save()
        
        self.client.force_authenticate(user=self.user1)
        
        data = {
            'choice': 'YES',
            'comments': 'I agree'
        }
        
        response = self.client.post(f'/governance/votes/{self.vote.id}/cast_vote/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Check ballot was created
        self.assertEqual(VoteBallot.objects.count(), 1)
        ballot = VoteBallot.objects.first()
        self.assertEqual(ballot.voter, self.user1)
        self.assertEqual(ballot.choice, 'YES')
        
        # Check vote counts were updated
        self.vote.refresh_from_db()
        self.assertEqual(self.vote.yes_votes, 1)
        self.assertEqual(self.vote.total_votes_cast, 1)
    
    def test_duplicate_vote_prevention(self):
        """Test that users cannot vote twice."""
        # Activate the vote
        self.vote.status = 'ACTIVE'
        self.vote.save()
        
        self.client.force_authenticate(user=self.user1)
        
        # Cast first vote
        data = {'choice': 'YES'}
        response1 = self.client.post(f'/governance/votes/{self.vote.id}/cast_vote/', data, format='json')
        self.assertEqual(response1.status_code, status.HTTP_201_CREATED)
        
        # Try to cast second vote
        response2 = self.client.post(f'/governance/votes/{self.vote.id}/cast_vote/', data, format='json')
        self.assertEqual(response2.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('already voted', response2.data['error'])
    
    def test_vote_on_inactive_vote(self):
        """Test that users cannot vote on inactive votes."""
        self.client.force_authenticate(user=self.user1)
        
        data = {'choice': 'YES'}
        response = self.client.post(f'/governance/votes/{self.vote.id}/cast_vote/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('not active', response.data['error'])
    
    def test_vote_result_calculation(self):
        """Test vote result calculation for different vote types."""
        # Test simple majority
        vote = Vote.objects.create(
            group=self.group,
            title='Simple Majority Vote',
            description='Test',
            vote_type='SIMPLE',
            status='ACTIVE',
            start_date=timezone.now(),
            end_date=timezone.now() + timedelta(days=7),
            total_eligible_voters=2,
            yes_votes=1,
            no_votes=1,
            total_votes_cast=2,
            created_by=self.user1
        )
        self.assertFalse(vote.is_passed)  # 50% is not > 50%
        
        vote.yes_votes = 2
        vote.no_votes = 0
        vote.save()
        self.assertTrue(vote.is_passed)  # 100% is > 50%
        
        # Test two-thirds majority
        vote.vote_type = 'TWO_THIRDS'
        vote.yes_votes = 1
        vote.no_votes = 1
        vote.save()
        self.assertFalse(vote.is_passed)  # 50% is not >= 66.67%
        
        # Test unanimous
        vote.vote_type = 'UNANIMOUS'
        vote.yes_votes = 2
        vote.no_votes = 0
        vote.save()
        self.assertTrue(vote.is_passed)
        
        vote.yes_votes = 1
        vote.no_votes = 1
        vote.save()
        self.assertFalse(vote.is_passed)
    
    def test_close_vote(self):
        """Test closing a vote."""
        self.vote.status = 'ACTIVE'
        self.vote.save()
        
        self.client.force_authenticate(user=self.user1)
        
        response = self.client.post(f'/governance/votes/{self.vote.id}/close/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.vote.refresh_from_db()
        self.assertEqual(self.vote.status, 'CLOSED')
