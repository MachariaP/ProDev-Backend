"""
URL Configuration for Education Hub.

This module defines the URL patterns for the education hub API endpoints.
It uses Django REST Framework's DefaultRouter for automatic URL generation
and includes all viewsets for the education hub feature.

Patterns:
    /api/v1/education/educational-contents/ - Educational content management
    /api/v1/education/user-progress/ - User progress tracking
    /api/v1/education/learning-paths/ - Learning path management
    /api/v1/education/savings-challenges/ - Savings challenges
    /api/v1/education/challenge-participants/ - Challenge participation
    /api/v1/education/webinars/ - Webinar management
    /api/v1/education/certificates/ - Certificate management
    /api/v1/education/dashboard/ - Education dashboard
    /api/v1/education/zoom-integration/ - Zoom integration (example)
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    EducationalContentViewSet,
    UserProgressViewSet,
    LearningPathViewSet,
    SavingsChallengeViewSet,
    ChallengeParticipantViewSet,
    WebinarViewSet,
    CertificateViewSet,
    EducationDashboardViewSet,
    ZoomIntegrationViewSet,
)

# Initialize DefaultRouter for automatic URL generation
router = DefaultRouter()

# Register viewsets with corresponding URL patterns
router.register(r'educational-contents', EducationalContentViewSet, basename='educational-content')
router.register(r'user-progress', UserProgressViewSet, basename='user-progress')
router.register(r'learning-paths', LearningPathViewSet, basename='learning-path')
router.register(r'savings-challenges', SavingsChallengeViewSet, basename='savings-challenge')
router.register(r'challenge-participants', ChallengeParticipantViewSet, basename='challenge-participant')
router.register(r'webinars', WebinarViewSet, basename='webinar')
router.register(r'certificates', CertificateViewSet, basename='certificate')
router.register(r'dashboard', EducationDashboardViewSet, basename='education-dashboard')
router.register(r'zoom-integration', ZoomIntegrationViewSet, basename='zoom-integration')

urlpatterns = [
    # Include all router-generated URLs
    path('', include(router.urls)),
]