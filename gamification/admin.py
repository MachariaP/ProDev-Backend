from django.contrib import admin
from .models import MemberAchievement, ContributionStreak, Leaderboard, RewardPoints


@admin.register(MemberAchievement)
class MemberAchievementAdmin(admin.ModelAdmin):
    list_display = ['id']
    search_fields = []


@admin.register(ContributionStreak)
class ContributionStreakAdmin(admin.ModelAdmin):
    list_display = ['id']
    search_fields = []


@admin.register(Leaderboard)
class LeaderboardAdmin(admin.ModelAdmin):
    list_display = ['id']
    search_fields = []


@admin.register(RewardPoints)
class RewardPointsAdmin(admin.ModelAdmin):
    list_display = ['id']
    search_fields = []

