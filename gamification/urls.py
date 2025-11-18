from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MemberAchievementViewSet, ContributionStreakViewSet, LeaderboardViewSet, RewardPointsViewSet

router = DefaultRouter()
router.register(r'member-achievements', MemberAchievementViewSet, basename='member-achievement')
router.register(r'contribution-streaks', ContributionStreakViewSet, basename='contribution-streak')
router.register(r'leaderboards', LeaderboardViewSet, basename='leaderboard')
router.register(r'reward-pointss', RewardPointsViewSet, basename='reward-points')

urlpatterns = [
    path('', include(router.urls)),
]
