from django.contrib import admin
from django.utils.html import format_html
from .models import (
    EducationalContent, UserProgress, LearningPath, LearningPathContent,
    LearningPathEnrollment, ContentCompletion, Certificate, SavingsChallenge,
    ChallengeParticipant, Webinar, WebinarRegistration, WebinarQnA,
    WebinarPoll, WebinarPollResponse, Achievement, UserAchievement
)


@admin.register(EducationalContent)
class EducationalContentAdmin(admin.ModelAdmin):
    list_display = ['title', 'content_type', 'category', 'difficulty', 
                   'is_published', 'is_featured', 'views_count', 'points_reward']
    list_filter = ['content_type', 'category', 'difficulty', 'is_published', 'is_featured']
    search_fields = ['title', 'description', 'tags']
    prepopulated_fields = {'slug': ['title']}
    readonly_fields = ['views_count', 'created_at', 'updated_at', 'published_at']
    filter_horizontal = ['prerequisites']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'slug', 'description', 'content_type', 
                      'category', 'difficulty', 'tags')
        }),
        ('Content', {
            'fields': ('content', 'video_url', 'thumbnail_url', 'learning_objectives')
        }),
        ('Settings', {
            'fields': ('duration_minutes', 'points_reward', 'certificate_available',
                      'is_published', 'is_featured', 'author')
        }),
        ('Quiz Settings', {
            'fields': ('quiz_questions', 'passing_score'),
            'classes': ('collapse',)
        }),
        ('Relations', {
            'fields': ('prerequisites',),
            'classes': ('collapse',)
        }),
        ('Statistics', {
            'fields': ('views_count', 'likes_count', 'share_count'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'published_at'),
            'classes': ('collapse',)
        })
    )


@admin.register(LearningPath)
class LearningPathAdmin(admin.ModelAdmin):
    list_display = ['title', 'path_type', 'difficulty', 'is_published', 
                   'is_featured', 'enrolled_count', 'completed_count']
    list_filter = ['path_type', 'difficulty', 'is_published', 'is_featured']
    search_fields = ['title', 'description', 'short_description']
    prepopulated_fields = {'slug': ['title']}
    readonly_fields = ['enrolled_count', 'completed_count', 'created_at', 'updated_at']
    filter_horizontal = ['learning_path_contents']


@admin.register(LearningPathEnrollment)
class LearningPathEnrollmentAdmin(admin.ModelAdmin):
    list_display = ['user', 'learning_path', 'status', 'progress_percentage', 
                   'enrolled_at', 'last_accessed_at']
    list_filter = ['status', 'learning_path']
    search_fields = ['user__email', 'user__first_name', 'user__last_name', 
                    'learning_path__title']
    readonly_fields = ['enrollment_id', 'enrolled_at', 'started_at', 
                      'completed_at', 'last_accessed_at']


@admin.register(Certificate)
class CertificateAdmin(admin.ModelAdmin):
    list_display = ['certificate_id', 'user', 'title', 'issued_at', 'is_public']
    list_filter = ['is_public', 'grade']
    search_fields = ['certificate_id', 'user__email', 'title', 'verification_code']
    readonly_fields = ['certificate_id', 'issued_at', 'verification_code']


@admin.register(SavingsChallenge)
class SavingsChallengeAdmin(admin.ModelAdmin):
    list_display = ['title', 'challenge_type', 'status', 'start_date', 
                   'end_date', 'participants_count', 'success_rate']
    list_filter = ['challenge_type', 'status']
    search_fields = ['title', 'description', 'short_description']
    prepopulated_fields = {'slug': ['title']}
    readonly_fields = ['participants_count', 'total_amount_saved', 'success_rate', 
                      'created_at']
    filter_horizontal = ['educational_content']


@admin.register(Webinar)
class WebinarAdmin(admin.ModelAdmin):
    list_display = ['title', 'presenter', 'scheduled_at', 'status', 
                   'platform', 'registered_count', 'attended_count']
    list_filter = ['status', 'platform', 'category', 'difficulty']
    search_fields = ['title', 'description', 'presenter__email']
    prepopulated_fields = {'slug': ['title']}
    readonly_fields = ['registered_count', 'attended_count', 'views_count', 
                      'average_rating', 'created_at', 'updated_at']
    filter_horizontal = ['co_presenters', 'related_content']


@admin.register(WebinarRegistration)
class WebinarRegistrationAdmin(admin.ModelAdmin):
    list_display = ['user', 'webinar', 'status', 'registered_at', 'checked_in']
    list_filter = ['status', 'checked_in', 'source']
    search_fields = ['user__email', 'webinar__title', 'registration_id']


@admin.register(Achievement)
class AchievementAdmin(admin.ModelAdmin):
    list_display = ['title', 'achievement_type', 'rarity', 'points_value', 'is_active']
    list_filter = ['achievement_type', 'rarity', 'is_active']
    search_fields = ['title', 'description']


# Register other models with default admin
admin.site.register(UserProgress)
admin.site.register(LearningPathContent)
admin.site.register(ContentCompletion)
admin.site.register(ChallengeParticipant)
admin.site.register(WebinarQnA)
admin.site.register(WebinarPoll)
admin.site.register(WebinarPollResponse)
admin.site.register(UserAchievement)