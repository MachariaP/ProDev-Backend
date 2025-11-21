"""
Test for /actions endpoint
"""
from django.test import TestCase, Client
from django.urls import reverse, resolve
import json


class ActionsEndpointTest(TestCase):
    """Test the /actions endpoint functionality."""
    
    def setUp(self):
        """Set up test client."""
        self.client = Client()
        
    def test_actions_url_resolves(self):
        """Test that /actions URL resolves correctly."""
        match = resolve('/actions')
        self.assertEqual(match.view_name, 'actions-list')
        
    def test_actions_endpoint_returns_200(self):
        """Test that GET /actions returns 200 OK."""
        response = self.client.get('/actions')
        self.assertEqual(response.status_code, 200)
        
    def test_actions_endpoint_returns_json(self):
        """Test that /actions returns JSON response."""
        response = self.client.get('/actions')
        self.assertEqual(response['Content-Type'], 'application/json')
        
    def test_actions_endpoint_structure(self):
        """Test that /actions returns correct data structure."""
        response = self.client.get('/actions')
        data = response.json()
        
        # Check top-level structure
        self.assertIn('count', data)
        self.assertIn('actions', data)
        self.assertIsInstance(data['count'], int)
        self.assertIsInstance(data['actions'], list)
        
    def test_actions_endpoint_count_matches_list(self):
        """Test that count field matches the length of actions list."""
        response = self.client.get('/actions')
        data = response.json()
        
        self.assertEqual(data['count'], len(data['actions']))
        
    def test_action_item_structure(self):
        """Test that each action item has required fields."""
        response = self.client.get('/actions')
        data = response.json()
        
        required_fields = ['id', 'name', 'display_name', 'description', 
                          'category', 'requires_conditions', 'available_parameters']
        
        for action in data['actions']:
            for field in required_fields:
                with self.subTest(action=action['name'], field=field):
                    self.assertIn(field, action)
                    
    def test_action_categories(self):
        """Test that actions have valid categories."""
        response = self.client.get('/actions')
        data = response.json()
        
        valid_categories = ['financial', 'communication', 'reporting']
        
        for action in data['actions']:
            with self.subTest(action=action['name']):
                self.assertIn(action['category'], valid_categories)
                
    def test_actions_endpoint_no_authentication_required(self):
        """Test that /actions endpoint doesn't require authentication."""
        # This should work without any authentication headers
        response = self.client.get('/actions')
        self.assertEqual(response.status_code, 200)
        # Should NOT return 401 or 403
        self.assertNotEqual(response.status_code, 401)
        self.assertNotEqual(response.status_code, 403)
        
    def test_actions_contain_expected_action_types(self):
        """Test that response contains expected action types."""
        response = self.client.get('/actions')
        data = response.json()
        
        action_names = [action['name'] for action in data['actions']]
        
        expected_actions = [
            'RECURRING_CONTRIBUTION',
            'LATE_FEE',
            'DIVIDEND_DISTRIBUTION',
            'NOTIFICATION',
            'REMINDER'
        ]
        
        for expected in expected_actions:
            with self.subTest(action=expected):
                self.assertIn(expected, action_names)
                
    def test_action_parameters_structure(self):
        """Test that action parameters have correct structure."""
        response = self.client.get('/actions')
        data = response.json()
        
        for action in data['actions']:
            if action['available_parameters']:
                for param in action['available_parameters']:
                    with self.subTest(action=action['name'], param=param['name']):
                        # Each parameter should have name, type, and required fields
                        self.assertIn('name', param)
                        self.assertIn('type', param)
                        self.assertIn('required', param)
                        self.assertIsInstance(param['required'], bool)
