from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    EducationalContentViewSet, UserProgressViewSet,
    LearningPathViewSet, LearningPathEnrollmentViewSet,
    SavingsChallengeViewSet, ChallengeParticipantViewSet,
    WebinarViewSet, WebinarRegistrationViewSet,
    CertificateViewSet, EducationDashboardViewSet,
    ZoomIntegrationViewSet
)

router = DefaultRouter()
router.register(r'educational-contents', EducationalContentViewSet, basename='educational-content')
router.register(r'user-progress', UserProgressViewSet, basename='user-progress')
router.register(r'learning-paths', LearningPathViewSet, basename='learning-path')
router.register(r'learning-path-enrollments', LearningPathEnrollmentViewSet, basename='learning-path-enrollment')
router.register(r'savings-challenges', SavingsChallengeViewSet, basename='savings-challenge')
router.register(r'challenge-participants', ChallengeParticipantViewSet, basename='challenge-participant')
router.register(r'webinars', WebinarViewSet, basename='webinar')
router.register(r'webinar-registrations', WebinarRegistrationViewSet, basename='webinar-registration')
router.register(r'certificates', CertificateViewSet, basename='certificate')
router.register(r'dashboard', EducationDashboardViewSet, basename='education-dashboard')
router.register(r'zoom-integration', ZoomIntegrationViewSet, basename='zoom-integration')

urlpatterns = [
    path('', include(router.urls)),
]