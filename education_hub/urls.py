from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EducationalContentViewSet, UserProgressViewSet, SavingsChallengeViewSet, ChallengeParticipantViewSet, WebinarViewSet

router = DefaultRouter()
router.register(r'educational-contents', EducationalContentViewSet, basename='educational-content')
router.register(r'user-progresss', UserProgressViewSet, basename='user-progress')
router.register(r'savings-challenges', SavingsChallengeViewSet, basename='savings-challenge')
router.register(r'challenge-participants', ChallengeParticipantViewSet, basename='challenge-participant')
router.register(r'webinars', WebinarViewSet, basename='webinar')

urlpatterns = [
    path('', include(router.urls)),
]
