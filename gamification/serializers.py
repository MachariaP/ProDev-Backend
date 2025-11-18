from rest_framework import serializers
from .models import MemberAchievement, ContributionStreak, Leaderboard, RewardPoints


class MemberAchievementSerializer(serializers.ModelSerializer):
    class Meta:
        model = MemberAchievement
        fields = '__all__'
        read_only_fields = ['id']


class ContributionStreakSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContributionStreak
        fields = '__all__'
        read_only_fields = ['id']


class LeaderboardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Leaderboard
        fields = '__all__'
        read_only_fields = ['id']


class RewardPointsSerializer(serializers.ModelSerializer):
    class Meta:
        model = RewardPoints
        fields = '__all__'
        read_only_fields = ['id']

