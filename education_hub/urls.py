"""
Enhanced URL Configuration for Education Hub API.

This module defines comprehensive API endpoints for education hub with improved
versioning, authentication requirements, and detailed documentation.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_nested import routers
from .views import (
    EducationalContentViewSet,
    UserProgressViewSet,
    LearningPathViewSet,
    LearningPathEnrollmentViewSet,
    SavingsChallengeViewSet,
    ChallengeParticipantViewSet,
    WebinarViewSet,
    WebinarRegistrationViewSet,
    CertificateViewSet,
    AchievementViewSet,
    UserAchievementViewSet,
    EducationDashboardViewSet,
    ContentCompletionViewSet,
    WebinarQnAViewSet,
    WebinarPollViewSet,
)

# Initialize DefaultRouter with trailing slash
router = DefaultRouter(trailing_slash=False)

# Register primary viewsets
router.register(r'educational-contents', EducationalContentViewSet, basename='educational-content')
router.register(r'learning-paths', LearningPathViewSet, basename='learning-path')
router.register(r'savings-challenges', SavingsChallengeViewSet, basename='savings-challenge')
router.register(r'webinars', WebinarViewSet, basename='webinar')
router.register(r'certificates', CertificateViewSet, basename='certificate')
router.register(r'achievements', AchievementViewSet, basename='achievement')
router.register(r'dashboard', EducationDashboardViewSet, basename='education-dashboard')
router.register(r'user-progress', UserProgressViewSet, basename='user-progress')
router.register(r'user-achievements', UserAchievementViewSet, basename='user-achievement')

# Create nested routers for relationships
learning_path_router = routers.NestedDefaultRouter(router, r'learning-paths', lookup='learning_path')
learning_path_router.register(r'enrollments', LearningPathEnrollmentViewSet, basename='learning-path-enrollments')
learning_path_router.register(r'contents', EducationalContentViewSet, basename='learning-path-contents')

webinar_router = routers.NestedDefaultRouter(router, r'webinars', lookup='webinar')
webinar_router.register(r'registrations', WebinarRegistrationViewSet, basename='webinar-registrations')
webinar_router.register(r'questions', WebinarQnAViewSet, basename='webinar-questions')
webinar_router.register(r'polls', WebinarPollViewSet, basename='webinar-polls')

challenge_router = routers.NestedDefaultRouter(router, r'savings-challenges', lookup='savings_challenge')
challenge_router.register(r'participants', ChallengeParticipantViewSet, basename='challenge-participants')

# Content completion endpoint
router.register(r'content-completions', ContentCompletionViewSet, basename='content-completion')

# Additional direct endpoints
urlpatterns = [
    # API versioning
    path('api/v1/education/', include([
        # Include all router URLs
        path('', include(router.urls)),
        path('', include(learning_path_router.urls)),
        path('', include(webinar_router.urls)),
        path('', include(challenge_router.urls)),
        
        # Special endpoints
        path('my-progress/', UserProgressViewSet.as_view({'get': 'my_progress'}), name='my-progress'),
        path('my-enrollments/', LearningPathEnrollmentViewSet.as_view({'get': 'my_enrollments'}), name='my-enrollments'),
        path('my-challenges/', ChallengeParticipantViewSet.as_view({'get': 'my_challenges'}), name='my-challenges'),
        path('my-certificates/', CertificateViewSet.as_view({'get': 'my_certificates'}), name='my-certificates'),
        path('recommended-content/', EducationalContentViewSet.as_view({'get': 'recommended'}), name='recommended-content'),
        path('featured-content/', EducationalContentViewSet.as_view({'get': 'featured'}), name='featured-content'),
        path('upcoming-webinars/', WebinarViewSet.as_view({'get': 'upcoming'}), name='upcoming-webinars'),
        path('active-challenges/', SavingsChallengeViewSet.as_view({'get': 'active'}), name='active-challenges'),
        
        # Analytics endpoints
        path('analytics/learning-stats/', EducationDashboardViewSet.as_view({'get': 'learning_stats'}), name='learning-stats'),
        path('analytics/user-engagement/', EducationDashboardViewSet.as_view({'get': 'user_engagement'}), name='user-engagement'),
        path('analytics/completion-rates/', EducationDashboardViewSet.as_view({'get': 'completion_rates'}), name='completion-rates'),
        
        # Quick actions
        path('quick-actions/start-learning/<int:content_id>/', EducationalContentViewSet.as_view({'post': 'start_progress'}), name='start-learning'),
        path('quick-actions/complete-content/<int:content_id>/', EducationalContentViewSet.as_view({'post': 'complete_content'}), name='complete-content'),
        path('quick-actions/bookmark/<int:content_id>/', EducationalContentViewSet.as_view({'post': 'bookmark'}), name='bookmark-content'),
    ])),
    
    # Webhook endpoints (for future integrations)
    path('webhooks/zoom/', WebinarViewSet.as_view({'post': 'zoom_webhook'}), name='zoom-webhook'),
    path('webhooks/certificate-issued/', CertificateViewSet.as_view({'post': 'certificate_webhook'}), name='certificate-webhook'),
]

# Add optional trailing slash patterns
urlpatterns += [
    path('api/v1/education/', include(router.urls)),
]