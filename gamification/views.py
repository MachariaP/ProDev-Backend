from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import MemberAchievement, ContributionStreak, Leaderboard, RewardPoints
from .serializers import MemberAchievementSerializer, ContributionStreakSerializer, LeaderboardSerializer, RewardPointsSerializer


class MemberAchievementViewSet(viewsets.ModelViewSet):
    queryset = MemberAchievement.objects.all()
    serializer_class = MemberAchievementSerializer
    permission_classes = [IsAuthenticated]


class ContributionStreakViewSet(viewsets.ModelViewSet):
    queryset = ContributionStreak.objects.all()
    serializer_class = ContributionStreakSerializer
    permission_classes = [IsAuthenticated]


class LeaderboardViewSet(viewsets.ModelViewSet):
    queryset = Leaderboard.objects.all()
    serializer_class = LeaderboardSerializer
    permission_classes = [IsAuthenticated]


class RewardPointsViewSet(viewsets.ModelViewSet):
    queryset = RewardPoints.objects.all()
    serializer_class = RewardPointsSerializer
    permission_classes = [IsAuthenticated]

