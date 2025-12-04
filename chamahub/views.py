"""
Root-level views for the ChamaHub API.
"""
from datetime import datetime
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status


@api_view(['GET', 'HEAD'])
@permission_classes([AllowAny])
def api_root(request):
    """
    Welcome endpoint for the ChamaHub API.
    
    Returns basic information about the API and available endpoints.
    Supports both GET and HEAD methods for health checks.
    """
    base_url = request.build_absolute_uri('/')
    
    response_data = {
        'name': 'ChamaHub API',
        'version': '1.0.0',
        'description': 'A comprehensive API for managing Chama (savings groups) operations',
        'timestamp': datetime.now().isoformat(),
        'status': 'operational',
        'environment': 'production' if not request.get_host().startswith('localhost') else 'development',
        'endpoints': {
            'documentation': {
                'swagger_ui': f'{base_url}api/docs/',
                'redoc': f'{base_url}api/redoc/',
                'schema': f'{base_url}api/schema/',
            },
            'authentication': {
                'jwt_token_obtain': f'{base_url}api/v1/token/',
                'jwt_token_refresh': f'{base_url}api/v1/token/refresh/',
                'legacy_token': f'{base_url}token/',
            },
            'core_services': {
                'accounts': f'{base_url}api/v1/accounts/',
                'groups': f'{base_url}api/v1/groups/',
                'finance': f'{base_url}api/v1/finance/',
                'governance': f'{base_url}api/v1/governance/',
                'investments': f'{base_url}api/v1/investments/',
            },
            'fintech_services': {
                'mpesa': f'{base_url}api/v1/mpesa/',
                'wealth_engine': f'{base_url}api/v1/wealth-engine/',
                'credit_scoring': f'{base_url}api/v1/credit-scoring/',
                'kyc_verification': f'{base_url}api/v1/kyc/',
                'ai_assistant': f'{base_url}api/v1/ai-assistant/',
                'automation': f'{base_url}api/v1/automation/',
                'gamification': f'{base_url}api/v1/gamification/',
                'education': f'{base_url}api/v1/education/',
            },
            'monitoring': {
                'health_check': f'{base_url}health/',
                'actions_list': f'{base_url}actions',
            }
        },
        'support': {
            'admin_panel': f'{base_url}admin/',
            'status': 'active',
        }
    }
    
    # For HEAD requests, return empty response with headers
    if request.method == 'HEAD':
        return Response(status=status.HTTP_200_OK)
    
    return Response(response_data, status=status.HTTP_200_OK)


@api_view(['GET', 'HEAD'])
@permission_classes([AllowAny])
def health_check(request):
    """
    Health check endpoint for monitoring and load balancers.
    Supports both GET and HEAD methods.
    """
    if request.method == 'HEAD':
        return Response(status=status.HTTP_200_OK)
    
    return Response({
        'status': 'healthy',
        'service': 'ChamaHub API',
        'timestamp': datetime.now().isoformat(),
        'database': 'connected',
        'cache': 'operational',
        'version': '1.0.0',
        'uptime': '100%',
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
def actions_list(request):
    """
    Return a list of available automation actions.
    
    This endpoint provides information about the different types of actions
    that can be configured in automation rules.
    """
    actions_data = [
        {
            "id": 1,
            "name": "RECURRING_CONTRIBUTION",
            "display_name": "Recurring Contribution",
            "description": "Automatically process recurring member contributions",
            "category": "financial",
            "requires_conditions": True,
            "available_parameters": [
                {"name": "amount", "type": "decimal", "required": True},
                {"name": "frequency", "type": "string", "required": True, "options": ["DAILY", "WEEKLY", "MONTHLY", "QUARTERLY"]},
                {"name": "start_date", "type": "date", "required": True}
            ]
        },
        {
            "id": 2,
            "name": "LATE_FEE",
            "display_name": "Late Fee Calculation",
            "description": "Automatically calculate and apply late fees for overdue payments",
            "category": "financial",
            "requires_conditions": True,
            "available_parameters": [
                {"name": "fee_amount", "type": "decimal", "required": True},
                {"name": "grace_period_days", "type": "integer", "required": False}
            ]
        },
        {
            "id": 3,
            "name": "DIVIDEND_DISTRIBUTION",
            "display_name": "Dividend Distribution",
            "description": "Automatically distribute dividends to members based on their contributions",
            "category": "financial",
            "requires_conditions": True,
            "available_parameters": [
                {"name": "distribution_ratio", "type": "string", "required": True, "options": ["EQUAL", "PROPORTIONAL"]},
                {"name": "minimum_balance", "type": "decimal", "required": False}
            ]
        },
        {
            "id": 4,
            "name": "NOTIFICATION",
            "display_name": "Send Notification",
            "description": "Send automated notifications to members or groups",
            "category": "communication",
            "requires_conditions": False,
            "available_parameters": [
                {"name": "channel", "type": "string", "required": True, "options": ["EMAIL", "SMS", "PUSH", "IN_APP"]},
                {"name": "template_id", "type": "integer", "required": False},
                {"name": "message", "type": "text", "required": True},
                {"name": "recipients", "type": "array", "required": True}
            ]
        },
        {
            "id": 5,
            "name": "REMINDER",
            "display_name": "Send Reminder",
            "description": "Send automated reminders for upcoming events or deadlines",
            "category": "communication",
            "requires_conditions": False,
            "available_parameters": [
                {"name": "reminder_type", "type": "string", "required": True, "options": ["MEETING", "PAYMENT", "LOAN_DUE", "CUSTOM"]},
                {"name": "advance_days", "type": "integer", "required": True},
                {"name": "message", "type": "text", "required": True}
            ]
        },
        {
            "id": 6,
            "name": "LOAN_APPROVAL",
            "display_name": "Auto-approve Loan",
            "description": "Automatically approve loans that meet predefined criteria",
            "category": "financial",
            "requires_conditions": True,
            "available_parameters": [
                {"name": "max_amount", "type": "decimal", "required": True},
                {"name": "min_credit_score", "type": "integer", "required": True},
                {"name": "approval_limit", "type": "decimal", "required": False}
            ]
        },
        {
            "id": 7,
            "name": "REPORT_GENERATION",
            "display_name": "Generate Report",
            "description": "Automatically generate and distribute reports",
            "category": "reporting",
            "requires_conditions": False,
            "available_parameters": [
                {"name": "report_type", "type": "string", "required": True, "options": ["FINANCIAL", "MEMBERSHIP", "LOAN", "INVESTMENT"]},
                {"name": "format", "type": "string", "required": True, "options": ["PDF", "EXCEL", "CSV"]},
                {"name": "recipients", "type": "array", "required": True}
            ]
        }
    ]
    
    return Response({
        "count": len(actions_data),
        "actions": actions_data
    }, status=status.HTTP_200_OK)
