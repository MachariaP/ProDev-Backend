from django.contrib import admin
from .models import EducationalContent, UserProgress, SavingsChallenge, ChallengeParticipant, Webinar


@admin.register(EducationalContent)
class EducationalContentAdmin(admin.ModelAdmin):
    list_display = ['id']
    search_fields = []


@admin.register(UserProgress)
class UserProgressAdmin(admin.ModelAdmin):
    list_display = ['id']
    search_fields = []


@admin.register(SavingsChallenge)
class SavingsChallengeAdmin(admin.ModelAdmin):
    list_display = ['id']
    search_fields = []


@admin.register(ChallengeParticipant)
class ChallengeParticipantAdmin(admin.ModelAdmin):
    list_display = ['id']
    search_fields = []


@admin.register(Webinar)
class WebinarAdmin(admin.ModelAdmin):
    list_display = ['id']
    search_fields = []

