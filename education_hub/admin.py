"""
Admin Configuration for Education Hub.

This module registers all education hub models with the Django admin interface.
It provides custom admin classes with optimized list displays, filters,
search fields, and form configurations for better administrative management.

The admin interface is designed to be intuitive for content managers and 
administrators, with inline editing capabilities and detailed action logging.

Key Features:
- Inline editing for related models (LearningPathContent, WebinarQnA, etc.)
- Custom action methods for bulk operations
- Export functionality for analytics data
- Real-time statistics and progress tracking
- Image previews for thumbnails and certificates
"""

from django.contrib import admin
from django.utils.html import format_html, mark_safe
from django.urls import reverse
from django.utils.text import Truncator
from django.contrib import messages
from django.db.models import Count, Sum, Avg
from django.utils import timezone
from datetime import timedelta
import csv
from django.http import HttpResponse

from .models import (
    EducationalContent, UserProgress, LearningPath, LearningPathContent,
    LearningPathEnrollment, ContentCompletion, Certificate, SavingsChallenge,
    ChallengeParticipant, Webinar, WebinarRegistration, WebinarQnA,
    WebinarPoll, WebinarPollResponse, Achievement, UserAchievement
)


class ExportCSVMixin:
    """Mixin class to add CSV export functionality to admin classes."""
    
    def export_as_csv(self, request, queryset):
        """Export selected objects as CSV file."""
        
        meta = self.model._meta
        field_names = [field.name for field in meta.fields]
        
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename={meta.verbose_name_plural}.csv'
        
        writer = csv.writer(response)
        writer.writerow(field_names)
        for obj in queryset:
            row = [getattr(obj, field) for field in field_names]
            writer.writerow(row)
        
        self.message_user(request, f'{queryset.count()} records exported successfully.')
        return response
    
    export_as_csv.short_description = "Export selected items as CSV"


class ContentCompletionInline(admin.TabularInline):
    """Inline admin for ContentCompletion model."""
    
    model = ContentCompletion
    extra = 0
    readonly_fields = ['completed_at', 'quiz_score', 'passed']
    fields = ['enrollment', 'content', 'completed_at', 'time_spent_minutes', 'quiz_score', 'passed']
    raw_id_fields = ['enrollment', 'content']


class LearningPathContentInline(admin.TabularInline):
    """Inline admin for LearningPathContent model."""
    
    model = LearningPathContent
    extra = 1
    fields = ['content', 'order', 'is_required']
    raw_id_fields = ['content']
    ordering = ['order']


class ChallengeParticipantInline(admin.TabularInline):
    """Inline admin for ChallengeParticipant model."""
    
    model = ChallengeParticipant
    extra = 0
    readonly_fields = ['joined_at', 'progress_percentage', 'completed_at']
    fields = ['user', 'current_amount', 'target_amount', 'progress_percentage', 
              'completed', 'streak_days', 'joined_at']


class WebinarRegistrationInline(admin.TabularInline):
    """Inline admin for WebinarRegistration model."""
    
    model = WebinarRegistration
    extra = 0
    readonly_fields = ['registered_at', 'checkin_at']
    fields = ['user', 'status', 'checked_in', 'registered_at', 'checkin_at', 'rating']
    raw_id_fields = ['user']


@admin.register(EducationalContent)
class EducationalContentAdmin(admin.ModelAdmin, ExportCSVMixin):
    """Admin interface for EducationalContent model with enhanced features."""
    
    actions = ['export_as_csv', 'publish_selected', 'unpublish_selected', 'feature_selected']
    list_display = [
        'title', 'content_type', 'category', 'difficulty', 'get_author_name',
        'is_published', 'is_featured', 'views_count', 'points_reward', 
        'completion_count', 'average_rating'
    ]
    list_filter = [
        'content_type', 'category', 'difficulty', 'is_published', 
        'is_featured', 'created_at', 'author'
    ]
    search_fields = ['title', 'description', 'tags', 'author__email', 'author__first_name']
    prepopulated_fields = {'slug': ['title']}
    readonly_fields = [
        'views_count', 'likes_count', 'share_count', 'created_at', 
        'updated_at', 'published_at', 'thumbnail_preview', 'completion_stats'
    ]
    filter_horizontal = ['prerequisites']
    raw_id_fields = ['author']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'slug', 'description', 'content_type', 
                      'category', 'difficulty', 'tags', 'thumbnail_preview')
        }),
        ('Content & Media', {
            'fields': ('content', 'video_url', 'thumbnail_url', 'learning_objectives')
        }),
        ('Settings & Requirements', {
            'fields': ('duration_minutes', 'points_reward', 'certificate_available',
                      'is_published', 'is_featured', 'author', 'prerequisites')
        }),
        ('Quiz Configuration', {
            'fields': ('quiz_questions', 'passing_score'),
            'classes': ('collapse',)
        }),
        ('Statistics & Analytics', {
            'fields': ('views_count', 'likes_count', 'share_count', 'completion_stats'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'published_at'),
            'classes': ('collapse',)
        })
    )
    
    def get_author_name(self, obj):
        """Return formatted author name or 'System' if no author."""
        return obj.author.get_full_name() if obj.author else 'System'
    get_author_name.short_description = 'Author'
    get_author_name.admin_order_field = 'author__first_name'
    
    def completion_count(self, obj):
        """Return count of users who completed this content."""
        return obj.user_progress.filter(status='COMPLETED').count()
    completion_count.short_description = 'Completions'
    
    def average_rating(self, obj):
        """Calculate average rating from completed user progress."""
        completed = obj.user_progress.filter(status='COMPLETED', quiz_score__isnull=False)
        if completed.exists():
            avg = completed.aggregate(avg=Avg('quiz_score'))['avg']
            return f"{avg:.1f}/100"
        return "N/A"
    average_rating.short_description = 'Avg Score'
    
    def thumbnail_preview(self, obj):
        """Display thumbnail preview in admin."""
        if obj.thumbnail_url:
            return format_html(
                '<img src="{}" style="max-height: 200px; max-width: 300px;" />',
                obj.thumbnail_url
            )
        return "No thumbnail"
    thumbnail_preview.short_description = 'Thumbnail Preview'
    
    def completion_stats(self, obj):
        """Display completion statistics."""
        total = obj.user_progress.count()
        completed = obj.user_progress.filter(status='COMPLETED').count()
        in_progress = obj.user_progress.filter(status='IN_PROGRESS').count()
        
        if total == 0:
            return "No progress data"
        
        completion_rate = (completed / total) * 100
        return format_html(
            """
            <div style="padding: 10px; background: #f8f9fa; border-radius: 5px;">
                <strong>Completion Statistics:</strong><br>
                Total Learners: {}<br>
                Completed: {} ({:.1f}%)<br>
                In Progress: {}
            </div>
            """,
            total, completed, completion_rate, in_progress
        )
    completion_stats.short_description = 'Progress Statistics'
    
    def publish_selected(self, request, queryset):
        """Admin action to publish selected content."""
        updated = queryset.update(is_published=True, published_at=timezone.now())
        self.message_user(
            request, 
            f'Successfully published {updated} content item(s).',
            messages.SUCCESS
        )
    publish_selected.short_description = "Publish selected content"
    
    def unpublish_selected(self, request, queryset):
        """Admin action to unpublish selected content."""
        updated = queryset.update(is_published=False)
        self.message_user(
            request, 
            f'Successfully unpublished {updated} content item(s).',
            messages.SUCCESS
        )
    unpublish_selected.short_description = "Unpublish selected content"
    
    def feature_selected(self, request, queryset):
        """Admin action to feature selected content."""
        updated = queryset.update(is_featured=True)
        self.message_user(
            request, 
            f'Successfully featured {updated} content item(s).',
            messages.SUCCESS
        )
    feature_selected.short_description = "Feature selected content"
    
    def get_queryset(self, request):
        """Optimize queryset with prefetch_related and annotate."""
        queryset = super().get_queryset(request)
        queryset = queryset.select_related('author').prefetch_related('user_progress')
        return queryset
    
    def save_model(self, request, obj, form, change):
        """Override save to auto-set author if not provided."""
        if not obj.author and request.user.is_authenticated:
            obj.author = request.user
        super().save_model(request, obj, form, change)


@admin.register(LearningPath)
class LearningPathAdmin(admin.ModelAdmin, ExportCSVMixin):
    """Admin interface for LearningPath model with enhanced analytics."""
    
    actions = ['export_as_csv', 'update_counts_selected']
    list_display = [
        'title', 'path_type', 'difficulty', 'is_published', 'is_featured',
        'enrolled_count', 'completed_count', 'completion_rate', 
        'average_progress', 'created_at'
    ]
    list_filter = ['path_type', 'difficulty', 'is_published', 'is_featured', 'created_at']
    search_fields = ['title', 'description', 'short_description']
    prepopulated_fields = {'slug': ['title']}
    readonly_fields = [
        'enrolled_count', 'completed_count', 'created_at', 'updated_at',
        'completion_rate', 'average_progress_display', 'contents_list'
    ]
    inlines = [LearningPathContentInline]
    filter_horizontal = []
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'slug', 'description', 'short_description')
        }),
        ('Configuration', {
            'fields': ('path_type', 'icon_name', 'color_code', 'difficulty')
        }),
        ('Settings', {
            'fields': ('is_published', 'is_featured', 'completion_certificate', 'completion_badge')
        }),
        ('Statistics', {
            'fields': ('enrolled_count', 'completed_count', 'completion_rate', 
                      'average_progress_display', 'contents_list'),
            'classes': ('collapse',)
        }),
        ('Calculated Fields', {
            'fields': ('total_duration_hours', 'total_points', 'contents_count'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    
    def completion_rate(self, obj):
        """Calculate completion rate for the learning path."""
        if obj.enrolled_count > 0:
            rate = (obj.completed_count / obj.enrolled_count) * 100
            return f"{rate:.1f}%"
        return "0%"
    completion_rate.short_description = 'Completion Rate'
    
    def average_progress(self, obj):
        """Calculate average progress percentage among enrolled users."""
        enrollments = obj.enrollments.all()
        if enrollments.exists():
            avg = enrollments.aggregate(avg=Avg('progress_percentage'))['avg']
            return f"{avg:.1f}%"
        return "0%"
    average_progress.short_description = 'Avg Progress'
    
    def average_progress_display(self, obj):
        """Display average progress with visual indicator."""
        enrollments = obj.enrollments.all()
        if enrollments.exists():
            avg = enrollments.aggregate(avg=Avg('progress_percentage'))['avg']
            color = "green" if avg >= 70 else "orange" if avg >= 30 else "red"
            return format_html(
                '<div style="display: flex; align-items: center; gap: 10px;">'
                '<span style="color: {}; font-weight: bold;">{:.1f}%</span>'
                '<div style="width: 100px; height: 10px; background: #e0e0e0; border-radius: 5px;">'
                '<div style="width: {}%; height: 100%; background: {}; border-radius: 5px;"></div>'
                '</div></div>',
                color, avg, avg, color
            )
        return "No enrollments"
    average_progress_display.short_description = 'Average Progress'
    
    def contents_list(self, obj):
        """Display list of contents in the learning path."""
        contents = obj.path_contents.order_by('order')
        if not contents.exists():
            return "No contents added"
        
        html = '<ul style="margin: 0; padding-left: 20px;">'
        for path_content in contents:
            content = path_content.content
            html += format_html(
                '<li>'
                '<a href="{}" target="_blank">{}</a> '
                '(Order: {}, Required: {})'
                '</li>',
                reverse('admin:education_hub_educationalcontent_change', args=[content.id]),
                content.title,
                path_content.order,
                "Yes" if path_content.is_required else "No"
            )
        html += '</ul>'
        return mark_safe(html)
    contents_list.short_description = 'Learning Path Contents'
    
    def update_counts_selected(self, request, queryset):
        """Admin action to update counts for selected learning paths."""
        for path in queryset:
            path.update_counts()
        self.message_user(
            request, 
            f'Successfully updated counts for {queryset.count()} learning path(s).',
            messages.SUCCESS
        )
    update_counts_selected.short_description = "Update counts for selected paths"
    
    def save_formset(self, request, form, formset, change):
        """Handle saving of inline formsets and update counts."""
        super().save_formset(request, form, formset, change)
        if formset.model == LearningPathContent:
            # Update the learning path counts when contents are changed
            obj = form.instance
            obj.update_counts()


@admin.register(LearningPathEnrollment)
class LearningPathEnrollmentAdmin(admin.ModelAdmin, ExportCSVMixin):
    """Admin interface for LearningPathEnrollment model with progress tracking."""
    
    actions = ['export_as_csv', 'mark_as_completed', 'reset_progress']
    list_display = [
        'enrollment_id', 'user', 'learning_path', 'status', 'progress_percentage',
        'enrolled_at', 'last_accessed_at', 'time_spent', 'earned_points'
    ]
    list_filter = ['status', 'learning_path', 'enrolled_at']
    search_fields = [
        'user__email', 'user__first_name', 'user__last_name', 
        'learning_path__title', 'enrollment_id'
    ]
    readonly_fields = [
        'enrollment_id', 'enrolled_at', 'started_at', 'completed_at', 
        'last_accessed_at', 'progress_history', 'completions_list'
    ]
    raw_id_fields = ['user', 'learning_path', 'current_content']
    inlines = [ContentCompletionInline]
    
    fieldsets = (
        ('Enrollment Information', {
            'fields': ('enrollment_id', 'user', 'learning_path', 'status', 'notes')
        }),
        ('Progress Tracking', {
            'fields': ('current_content', 'progress_percentage', 'total_time_spent_minutes', 
                      'earned_points', 'progress_history')
        }),
        ('Timestamps', {
            'fields': ('enrolled_at', 'started_at', 'completed_at', 'last_accessed_at')
        }),
        ('Completions', {
            'fields': ('completions_list',),
            'classes': ('collapse',)
        })
    )
    
    def time_spent(self, obj):
        """Format time spent in hours and minutes."""
        hours = obj.total_time_spent_minutes // 60
        minutes = obj.total_time_spent_minutes % 60
        return f"{hours}h {minutes}m"
    time_spent.short_description = 'Time Spent'
    
    def progress_history(self, obj):
        """Display visual progress history."""
        completions = obj.completions.order_by('completed_at')
        if not completions.exists():
            return "No progress recorded"
        
        html = '<div style="padding: 10px; background: #f8f9fa; border-radius: 5px;">'
        html += '<strong>Progress History:</strong><br>'
        
        for completion in completions:
            html += format_html(
                '<div style="margin: 5px 0; padding: 5px; border-left: 3px solid #4CAF50;">'
                '{} - {} ({} min) - Score: {}'
                '</div>',
                completion.completed_at.strftime('%Y-%m-%d %H:%M'),
                completion.content.title,
                completion.time_spent_minutes,
                f"{completion.quiz_score:.1f}" if completion.quiz_score else "N/A"
            )
        
        html += '</div>'
        return mark_safe(html)
    progress_history.short_description = 'Progress History'
    
    def completions_list(self, obj):
        """Display list of completed content items."""
        completions = obj.completions.select_related('content')
        if not completions.exists():
            return "No completions"
        
        html = '<ul style="margin: 0; padding-left: 20px;">'
        for completion in completions:
            html += format_html(
                '<li>'
                '<a href="{}" target="_blank">{}</a> '
                '({}, Score: {})'
                '</li>',
                reverse('admin:education_hub_educationalcontent_change', args=[completion.content.id]),
                completion.content.title,
                completion.completed_at.strftime('%Y-%m-%d'),
                f"{completion.quiz_score:.1f}" if completion.quiz_score else "N/A"
            )
        html += '</ul>'
        return mark_safe(html)
    completions_list.short_description = 'Completed Content'
    
    def mark_as_completed(self, request, queryset):
        """Admin action to mark enrollments as completed."""
        for enrollment in queryset:
            enrollment.status = 'COMPLETED'
            enrollment.progress_percentage = 100
            enrollment.completed_at = timezone.now()
            enrollment.save()
        
        self.message_user(
            request,
            f'Marked {queryset.count()} enrollment(s) as completed.',
            messages.SUCCESS
        )
    mark_as_completed.short_description = "Mark as completed"
    
    def reset_progress(self, request, queryset):
        """Admin action to reset enrollment progress."""
        for enrollment in queryset:
            enrollment.status = 'ENROLLED'
            enrollment.progress_percentage = 0
            enrollment.current_content = None
            enrollment.started_at = None
            enrollment.completed_at = None
            enrollment.total_time_spent_minutes = 0
            enrollment.earned_points = 0
            enrollment.completions.all().delete()
            enrollment.save()
        
        self.message_user(
            request,
            f'Reset progress for {queryset.count()} enrollment(s).',
            messages.SUCCESS
        )
    reset_progress.short_description = "Reset progress"
    
    def get_queryset(self, request):
        """Optimize queryset with select_related."""
        queryset = super().get_queryset(request)
        queryset = queryset.select_related('user', 'learning_path', 'current_content')
        return queryset


@admin.register(Certificate)
class CertificateAdmin(admin.ModelAdmin, ExportCSVMixin):
    """Admin interface for Certificate model with verification features."""
    
    actions = ['export_as_csv', 'make_public', 'make_private', 'regenerate_verification_code']
    list_display = [
        'certificate_id', 'user', 'title', 'issued_at', 'is_public', 
        'verification_code', 'download_link', 'preview_link'
    ]
    list_filter = ['is_public', 'grade', 'issued_at']
    search_fields = [
        'certificate_id', 'user__email', 'title', 'verification_code',
        'user__first_name', 'user__last_name'
    ]
    readonly_fields = [
        'certificate_id', 'issued_at', 'verification_code', 
        'certificate_preview', 'verification_link'
    ]
    raw_id_fields = ['user', 'learning_path', 'content']
    
    fieldsets = (
        ('Certificate Information', {
            'fields': ('certificate_id', 'user', 'title', 'description')
        }),
        ('Issuance Details', {
            'fields': ('learning_path', 'content', 'grade', 'score')
        }),
        ('Settings', {
            'fields': ('is_public', 'verification_code', 'verification_link')
        }),
        ('Certificate Files', {
            'fields': ('certificate_url', 'certificate_pdf', 'certificate_preview')
        }),
        ('Validity', {
            'fields': ('issued_at', 'valid_until'),
            'classes': ('collapse',)
        })
    )
    
    def download_link(self, obj):
        """Generate download link for certificate."""
        if obj.certificate_pdf:
            return format_html(
                '<a href="{}" target="_blank">📥 Download PDF</a>',
                obj.certificate_pdf.url
            )
        elif obj.certificate_url:
            return format_html(
                '<a href="{}" target="_blank">🌐 View Online</a>',
                obj.certificate_url
            )
        return "No file"
    download_link.short_description = 'Download'
    
    def preview_link(self, obj):
        """Generate preview link for certificate."""
        return format_html(
            '<a href="{}" target="_blank">👁️ Preview</a>',
            reverse('admin:education_hub_certificate_preview', args=[obj.id])
        )
    preview_link.short_description = 'Preview'
    
    def certificate_preview(self, obj):
        """Display certificate preview if available."""
        if obj.certificate_url:
            return format_html(
                '<iframe src="{}" style="width: 100%; height: 400px; border: 1px solid #ddd;"></iframe>',
                obj.certificate_url
            )
        elif obj.certificate_pdf:
            return format_html(
                '<div style="padding: 20px; background: #f0f0f0; text-align: center;">'
                'PDF certificate available. <a href="{}" target="_blank">Download</a>'
                '</div>',
                obj.certificate_pdf.url
            )
        return "No certificate file available"
    certificate_preview.short_description = 'Certificate Preview'
    
    def verification_link(self, obj):
        """Generate public verification link."""
        verification_url = reverse('certificate-verify-public') + f'?code={obj.verification_code}'
        full_url = request.build_absolute_uri(verification_url) if request else verification_url
        return format_html(
            '<input type="text" readonly value="{}" style="width: 100%;">'
            '<small>Public verification link</small>',
            full_url
        )
    verification_link.short_description = 'Verification Link'
    
    def make_public(self, request, queryset):
        """Admin action to make selected certificates public."""
        updated = queryset.update(is_public=True)
        self.message_user(
            request,
            f'Made {updated} certificate(s) public.',
            messages.SUCCESS
        )
    make_public.short_description = "Make public"
    
    def make_private(self, request, queryset):
        """Admin action to make selected certificates private."""
        updated = queryset.update(is_public=False)
        self.message_user(
            request,
            f'Made {updated} certificate(s) private.',
            messages.SUCCESS
        )
    make_private.short_description = "Make private"
    
    def regenerate_verification_code(self, request, queryset):
        """Admin action to regenerate verification codes."""
        import secrets
        updated = 0
        for certificate in queryset:
            certificate.verification_code = secrets.token_urlsafe(16)
            certificate.save()
            updated += 1
        
        self.message_user(
            request,
            f'Regenerated verification codes for {updated} certificate(s).',
            messages.SUCCESS
        )
    regenerate_verification_code.short_description = "Regenerate verification code"
    
    def get_queryset(self, request):
        """Optimize queryset with select_related."""
        queryset = super().get_queryset(request)
        queryset = queryset.select_related('user', 'learning_path', 'content')
        return queryset


@admin.register(SavingsChallenge)
class SavingsChallengeAdmin(admin.ModelAdmin, ExportCSVMixin):
    """Admin interface for SavingsChallenge model with progress tracking."""
    
    actions = ['export_as_csv', 'update_status_selected', 'calculate_stats_selected']
    list_display = [
        'title', 'challenge_type', 'status', 'start_date', 'end_date',
        'participants_count', 'success_rate', 'total_amount_saved',
        'days_remaining', 'completion_rate'
    ]
    list_filter = ['challenge_type', 'status', 'start_date', 'end_date']
    search_fields = ['title', 'description', 'short_description']
    prepopulated_fields = {'slug': ['title']}
    readonly_fields = [
        'participants_count', 'total_amount_saved', 'success_rate', 
        'created_at', 'days_remaining', 'progress_summary', 'leaderboard'
    ]
    filter_horizontal = ['educational_content']
    raw_id_fields = ['learning_path', 'created_by']
    inlines = [ChallengeParticipantInline]
    
    fieldsets = (
        ('Challenge Information', {
            'fields': ('title', 'slug', 'description', 'short_description')
        }),
        ('Configuration', {
            'fields': ('challenge_type', 'target_amount', 'duration_days', 
                      'start_date', 'end_date', 'status')
        }),
        ('Requirements & Limits', {
            'fields': ('min_participants', 'max_participants')
        }),
        ('Rewards', {
            'fields': ('reward_points', 'reward_badge')
        }),
        ('Educational Content', {
            'fields': ('learning_path', 'educational_content'),
            'classes': ('collapse',)
        }),
        ('Creator', {
            'fields': ('created_by',),
            'classes': ('collapse',)
        }),
        ('Statistics', {
            'fields': ('participants_count', 'total_amount_saved', 'success_rate',
                      'days_remaining', 'progress_summary', 'leaderboard'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        })
    )
    
    def days_remaining(self, obj):
        """Calculate days remaining until challenge end."""
        if obj.status == 'ACTIVE':
            remaining = (obj.end_date - timezone.now().date()).days
            return f"{remaining} days" if remaining > 0 else "Ending today"
        return "N/A"
    days_remaining.short_description = 'Days Remaining'
    
    def completion_rate(self, obj):
        """Calculate completion rate among participants."""
        participants = obj.participants.count()
        completed = obj.participants.filter(completed=True).count()
        if participants > 0:
            rate = (completed / participants) * 100
            return f"{rate:.1f}%"
        return "0%"
    completion_rate.short_description = 'Completion Rate'
    
    def progress_summary(self, obj):
        """Display progress summary with visual indicators."""
        participants = obj.participants.all()
        total_target = obj.target_amount * participants.count()
        total_saved = obj.total_amount_saved
        
        if total_target > 0:
            percentage = (total_saved / total_target) * 100
            color = "green" if percentage >= 100 else "orange" if percentage >= 50 else "red"
            
            return format_html(
                '''
                <div style="padding: 15px; background: #f8f9fa; border-radius: 5px;">
                    <strong>Progress Summary:</strong><br>
                    Total Target: ${:,.2f}<br>
                    Total Saved: ${:,.2f}<br>
                    Achievement: {:.1f}%<br>
                    <div style="margin-top: 10px; width: 100%; height: 20px; background: #e0e0e0; border-radius: 10px;">
                        <div style="width: {}%; height: 100%; background: {}; border-radius: 10px;"></div>
                    </div>
                </div>
                ''',
                total_target, total_saved, percentage, percentage, color
            )
        return "No participants"
    progress_summary.short_description = 'Progress Summary'
    
    def leaderboard(self, obj):
        """Display challenge leaderboard."""
        top_participants = obj.participants.order_by('-current_amount')[:5]
        
        if not top_participants.exists():
            return "No participants"
        
        html = '''
        <div style="padding: 15px; background: #f8f9fa; border-radius: 5px;">
            <strong>Top 5 Participants:</strong><br>
            <table style="width: 100%; margin-top: 10px; border-collapse: collapse;">
                <thead>
                    <tr style="background: #e9ecef;">
                        <th style="padding: 8px; text-align: left;">Rank</th>
                        <th style="padding: 8px; text-align: left;">Participant</th>
                        <th style="padding: 8px; text-align: left;">Amount Saved</th>
                        <th style="padding: 8px; text-align: left;">Progress</th>
                    </tr>
                </thead>
                <tbody>
        '''
        
        for i, participant in enumerate(top_participants, 1):
            progress = (participant.current_amount / obj.target_amount) * 100 if obj.target_amount > 0 else 0
            medal = "🥇" if i == 1 else "🥈" if i == 2 else "🥉" if i == 3 else f"{i}."
            
            html += format_html(
                '''
                <tr style="border-bottom: 1px solid #dee2e6;">
                    <td style="padding: 8px;">{}</td>
                    <td style="padding: 8px;">{}</td>
                    <td style="padding: 8px;">${:,.2f}</td>
                    <td style="padding: 8px;">
                        <div style="width: 100px; height: 10px; background: #e0e0e0; border-radius: 5px;">
                            <div style="width: {}%; height: 100%; background: #4CAF50; border-radius: 5px;"></div>
                        </div>
                        {:.1f}%
                    </td>
                </tr>
                ''',
                medal, participant.user.get_full_name(), participant.current_amount,
                progress, progress
            )
        
        html += '</tbody></table></div>'
        return mark_safe(html)
    leaderboard.short_description = 'Leaderboard'
    
    def update_status_selected(self, request, queryset):
        """Admin action to update status of selected challenges."""
        for challenge in queryset:
            challenge.update_challenge_status()
        
        self.message_user(
            request,
            f'Updated status for {queryset.count()} challenge(s).',
            messages.SUCCESS
        )
    update_status_selected.short_description = "Update challenge status"
    
    def calculate_stats_selected(self, request, queryset):
        """Admin action to calculate statistics for selected challenges."""
        for challenge in queryset:
            challenge.calculate_success_rate()
        
        self.message_user(
            request,
            f'Calculated statistics for {queryset.count()} challenge(s).',
            messages.SUCCESS
        )
    calculate_stats_selected.short_description = "Calculate statistics"
    
    def save_model(self, request, obj, form, change):
        """Override save to auto-set creator if not provided."""
        if not obj.created_by and request.user.is_authenticated:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(Webinar)
class WebinarAdmin(admin.ModelAdmin, ExportCSVMixin):
    """Admin interface for Webinar model with integration features."""
    
    actions = ['export_as_csv', 'start_webinar', 'end_webinar', 'send_reminders']
    list_display = [
        'title', 'presenter', 'scheduled_at', 'status', 'platform',
        'registered_count', 'attended_count', 'attendance_rate', 
        'average_rating', 'days_until'
    ]
    list_filter = ['status', 'platform', 'category', 'difficulty', 'scheduled_at']
    search_fields = ['title', 'description', 'presenter__email', 'presenter__first_name']
    prepopulated_fields = {'slug': ['title']}
    readonly_fields = [
        'registered_count', 'attended_count', 'views_count', 'average_rating',
        'created_at', 'updated_at', 'days_until', 'meeting_info', 
        'registration_stats', 'attendance_stats'
    ]
    filter_horizontal = ['co_presenters', 'related_content']
    raw_id_fields = ['presenter', 'learning_path']
    inlines = [WebinarRegistrationInline]
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'slug', 'description', 'short_description')
        }),
        ('Presenter Information', {
            'fields': ('presenter', 'co_presenters')
        }),
        ('Schedule & Timing', {
            'fields': ('scheduled_at', 'duration_minutes', 'timezone', 'days_until')
        }),
        ('Platform Integration', {
            'fields': ('platform', 'meeting_id', 'meeting_url', 'join_url', 
                      'host_url', 'password', 'meeting_info')
        }),
        ('Recording', {
            'fields': ('recording_url', 'recording_password', 'recording_available_at'),
            'classes': ('collapse',)
        }),
        ('Webinar Details', {
            'fields': ('status', 'category', 'difficulty', 'max_participants')
        }),
        ('Features', {
            'fields': ('qna_enabled', 'poll_enabled')
        }),
        ('Educational Content', {
            'fields': ('learning_path', 'related_content'),
            'classes': ('collapse',)
        }),
        ('Resources', {
            'fields': ('slides_url', 'resources_url'),
            'classes': ('collapse',)
        }),
        ('Rewards', {
            'fields': ('points_reward', 'certificate_available'),
            'classes': ('collapse',)
        }),
        ('Statistics', {
            'fields': ('registered_count', 'attended_count', 'views_count', 
                      'average_rating', 'registration_stats', 'attendance_stats'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    
    def attendance_rate(self, obj):
        """Calculate attendance rate."""
        if obj.registered_count > 0:
            rate = (obj.attended_count / obj.registered_count) * 100
            return f"{rate:.1f}%"
        return "0%"
    attendance_rate.short_description = 'Attendance Rate'
    
    def days_until(self, obj):
        """Calculate days until webinar."""
        if obj.status == 'SCHEDULED':
            delta = obj.scheduled_at - timezone.now()
            days = delta.days
            if days > 0:
                return f"In {days} days"
            elif delta.total_seconds() > 0:
                hours = int(delta.total_seconds() // 3600)
                return f"In {hours} hours"
            else:
                return "Started"
        return "N/A"
    days_until.short_description = 'Days Until'
    
    def meeting_info(self, obj):
        """Display meeting information with clickable links."""
        info = []
        if obj.meeting_url:
            info.append(format_html(
                '<strong>Meeting URL:</strong> <a href="{}" target="_blank">{}</a>',
                obj.meeting_url, "Join Meeting"
            ))
        if obj.join_url:
            info.append(format_html(
                '<strong>Join URL:</strong> <a href="{}" target="_blank">{}</a>',
                obj.join_url, "Join as Participant"
            ))
        if obj.host_url:
            info.append(format_html(
                '<strong>Host URL:</strong> <a href="{}" target="_blank">{}</a>',
                obj.host_url, "Join as Host"
            ))
        if obj.password:
            info.append(format_html(
                '<strong>Password:</strong> <code>{}</code>',
                obj.password
            ))
        
        if info:
            return mark_safe('<br>'.join(info))
        return "No meeting information"
    meeting_info.short_description = 'Meeting Information'
    
    def registration_stats(self, obj):
        """Display registration statistics."""
        total = obj.max_participants
        registered = obj.registered_count
        available = total - registered
        fill_rate = (registered / total) * 100 if total > 0 else 0
        
        return format_html(
            '''
            <div style="padding: 10px; background: #f8f9fa; border-radius: 5px;">
                <strong>Registration Statistics:</strong><br>
                Capacity: {} participants<br>
                Registered: {} participants<br>
                Available: {} spots<br>
                Fill Rate: {:.1f}%
                <div style="margin-top: 5px; width: 100%; height: 10px; background: #e0e0e0; border-radius: 5px;">
                    <div style="width: {}%; height: 100%; background: #4CAF50; border-radius: 5px;"></div>
                </div>
            </div>
            ''',
            total, registered, available, fill_rate, fill_rate
        )
    registration_stats.short_description = 'Registration Statistics'
    
    def attendance_stats(self, obj):
        """Display attendance statistics."""
        registrations = obj.registrations.all()
        attended = registrations.filter(status='ATTENDED')
        absent = registrations.filter(status='ABSENT')
        
        return format_html(
            '''
            <div style="padding: 10px; background: #f8f9fa; border-radius: 5px;">
                <strong>Attendance Statistics:</strong><br>
                Total Registered: {}<br>
                Attended: {} ({:.1f}%)<br>
                Absent: {} ({:.1f}%)<br>
                Average Rating: {:.1f}/5
            </div>
            ''',
            registrations.count(),
            attended.count(),
            (attended.count() / registrations.count() * 100) if registrations.count() > 0 else 0,
            absent.count(),
            (absent.count() / registrations.count() * 100) if registrations.count() > 0 else 0,
            obj.average_rating or 0
        )
    attendance_stats.short_description = 'Attendance Statistics'
    
    def start_webinar(self, request, queryset):
        """Admin action to start selected webinars."""
        for webinar in queryset:
            webinar.status = 'LIVE'
            webinar.save()
        
        self.message_user(
            request,
            f'Started {queryset.count()} webinar(s).',
            messages.SUCCESS
        )
    start_webinar.short_description = "Start webinar"
    
    def end_webinar(self, request, queryset):
        """Admin action to end selected webinars."""
        for webinar in queryset:
            webinar.status = 'COMPLETED'
            webinar.save()
        
        self.message_user(
            request,
            f'Ended {queryset.count()} webinar(s).',
            messages.SUCCESS
        )
    end_webinar.short_description = "End webinar"
    
    def send_reminders(self, request, queryset):
        """Admin action to send reminders for upcoming webinars."""
        # This would typically integrate with an email service
        # For now, we'll just log the action
        self.message_user(
            request,
            f'Reminders would be sent for {queryset.count()} webinar(s).',
            messages.INFO
        )
    send_reminders.short_description = "Send reminders"
    
    def save_model(self, request, obj, form, change):
        """Override save to auto-set presenter if not provided."""
        if not obj.presenter and request.user.is_authenticated:
            obj.presenter = request.user
        super().save_model(request, obj, form, change)
    
    def get_queryset(self, request):
        """Optimize queryset with select_related and prefetch_related."""
        queryset = super().get_queryset(request)
        queryset = queryset.select_related('presenter', 'learning_path')
        return queryset


@admin.register(WebinarRegistration)
class WebinarRegistrationAdmin(admin.ModelAdmin, ExportCSVMixin):
    """Admin interface for WebinarRegistration model with attendance tracking."""
    
    actions = ['export_as_csv', 'mark_as_attended', 'mark_as_absent', 'send_checkin_reminder']
    list_display = [
        'registration_id', 'user', 'webinar', 'status', 'registered_at', 
        'checked_in', 'checkin_at', 'rating', 'attendance_duration'
    ]
    list_filter = ['status', 'checked_in', 'source', 'registered_at']
    search_fields = [
        'user__email', 'webinar__title', 'registration_id', 'checkin_code'
    ]
    readonly_fields = [
        'registration_id', 'registered_at', 'joined_at', 'left_at',
        'checkin_at', 'feedback_at', 'attendance_details'
    ]
    raw_id_fields = ['user', 'webinar']
    
    fieldsets = (
        ('Registration Information', {
            'fields': ('registration_id', 'user', 'webinar', 'status', 'source')
        }),
        ('Attendance Tracking', {
            'fields': ('checked_in', 'checkin_code', 'checkin_at', 
                      'joined_at', 'left_at', 'attendance_duration')
        }),
        ('Feedback', {
            'fields': ('rating', 'feedback', 'feedback_at')
        }),
        ('Notifications', {
            'fields': ('reminder_sent', 'followup_sent'),
            'classes': ('collapse',)
        }),
        ('Additional Information', {
            'fields': ('timezone', 'notes', 'attendance_details'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('registered_at',),
            'classes': ('collapse',)
        })
    )
    
    def attendance_details(self, obj):
        """Display detailed attendance information."""
        if not obj.joined_at:
            return "No attendance recorded"
        
        duration = obj.attendance_duration or 0
        hours = duration // 60
        minutes = duration % 60
        
        return format_html(
            '''
            <div style="padding: 10px; background: #f8f9fa; border-radius: 5px;">
                <strong>Attendance Details:</strong><br>
                Joined: {}<br>
                Left: {}<br>
                Duration: {} hours {} minutes<br>
                Check-in Code: <code>{}</code>
            </div>
            ''',
            obj.joined_at.strftime('%Y-%m-%d %H:%M:%S') if obj.joined_at else "N/A",
            obj.left_at.strftime('%Y-%m-%d %H:%M:%S') if obj.left_at else "N/A",
            hours, minutes,
            obj.checkin_code or "N/A"
        )
    attendance_details.short_description = 'Attendance Details'
    
    def mark_as_attended(self, request, queryset):
        """Admin action to mark registrations as attended."""
        for registration in queryset:
            registration.mark_attended()
        
        self.message_user(
            request,
            f'Marked {queryset.count()} registration(s) as attended.',
            messages.SUCCESS
        )
    mark_as_attended.short_description = "Mark as attended"
    
    def mark_as_absent(self, request, queryset):
        """Admin action to mark registrations as absent."""
        updated = queryset.update(status='ABSENT')
        self.message_user(
            request,
            f'Marked {updated} registration(s) as absent.',
            messages.SUCCESS
        )
    mark_as_absent.short_description = "Mark as absent"
    
    def send_checkin_reminder(self, request, queryset):
        """Admin action to send check-in reminders."""
        # This would typically integrate with an email/SMS service
        self.message_user(
            request,
            f'Check-in reminders would be sent for {queryset.count()} registration(s).',
            messages.INFO
        )
    send_checkin_reminder.short_description = "Send check-in reminder"


@admin.register(Achievement)
class AchievementAdmin(admin.ModelAdmin, ExportCSVMixin):
    """Admin interface for Achievement model with unlock tracking."""
    
    actions = ['export_as_csv', 'activate_selected', 'deactivate_selected']
    list_display = [
        'title', 'achievement_type', 'rarity', 'points_value', 
        'unlock_count', 'is_active', 'created_at'
    ]
    list_filter = ['achievement_type', 'rarity', 'is_active', 'created_at']
    search_fields = ['title', 'description']
    readonly_fields = ['created_at', 'unlock_stats', 'recent_unlocks']
    
    fieldsets = (
        ('Achievement Information', {
            'fields': ('title', 'description', 'icon_name', 'icon_color')
        }),
        ('Configuration', {
            'fields': ('achievement_type', 'rarity', 'points_value')
        }),
        ('Unlock Criteria', {
            'fields': ('criteria_type', 'criteria_value'),
            'classes': ('collapse',)
        }),
        ('Settings', {
            'fields': ('is_active',)
        }),
        ('Statistics', {
            'fields': ('unlock_stats', 'recent_unlocks'),
            'classes': ('collapse',)
        }),
        ('Timestamp', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        })
    )
    
    def unlock_count(self, obj):
        """Count how many users have unlocked this achievement."""
        return obj.user_achievements.filter(is_unlocked=True).count()
    unlock_count.short_description = 'Unlocks'
    
    def unlock_stats(self, obj):
        """Display unlock statistics."""
        total_users = User.objects.count()
        unlocked = obj.user_achievements.filter(is_unlocked=True).count()
        unlock_rate = (unlocked / total_users * 100) if total_users > 0 else 0
        
        return format_html(
            '''
            <div style="padding: 10px; background: #f8f9fa; border-radius: 5px;">
                <strong>Unlock Statistics:</strong><br>
                Total Users: {}<br>
                Unlocked: {} users<br>
                Unlock Rate: {:.1f}%<br>
                Rarity: {}
            </div>
            ''',
            total_users, unlocked, unlock_rate, obj.get_rarity_display()
        )
    unlock_stats.short_description = 'Unlock Statistics'
    
    def recent_unlocks(self, obj):
        """Display recent achievement unlocks."""
        recent = obj.user_achievements.filter(is_unlocked=True).order_by('-earned_at')[:5]
        
        if not recent.exists():
            return "No unlocks yet"
        
        html = '''
        <div style="padding: 10px; background: #f8f9fa; border-radius: 5px;">
            <strong>Recent Unlocks:</strong><br>
            <ul style="margin: 5px 0; padding-left: 20px;">
        '''
        
        for user_achievement in recent:
            html += format_html(
                '<li>{} - {}</li>',
                user_achievement.user.get_full_name(),
                user_achievement.earned_at.strftime('%Y-%m-%d %H:%M')
            )
        
        html += '</ul></div>'
        return mark_safe(html)
    recent_unlocks.short_description = 'Recent Unlocks'
    
    def activate_selected(self, request, queryset):
        """Admin action to activate selected achievements."""
        updated = queryset.update(is_active=True)
        self.message_user(
            request,
            f'Activated {updated} achievement(s).',
            messages.SUCCESS
        )
    activate_selected.short_description = "Activate achievements"
    
    def deactivate_selected(self, request, queryset):
        """Admin action to deactivate selected achievements."""
        updated = queryset.update(is_active=False)
        self.message_user(
            request,
            f'Deactivated {updated} achievement(s).',
            messages.SUCCESS
        )
    deactivate_selected.short_description = "Deactivate achievements"


# Register remaining models with default admin configurations
# These models have simpler admin interfaces with basic functionality

from django.contrib.auth import get_user_model
User = get_user_model()

@admin.register(UserProgress)
class UserProgressAdmin(admin.ModelAdmin, ExportCSVMixin):
    """Admin interface for UserProgress model."""
    
    list_display = ['user', 'content', 'status', 'progress_percentage', 'started_at', 'completed_at']
    list_filter = ['status', 'bookmarked', 'content__content_type']
    search_fields = ['user__email', 'content__title']
    readonly_fields = ['started_at', 'completed_at']
    raw_id_fields = ['user', 'content']
    
    def get_queryset(self, request):
        """Optimize queryset with select_related."""
        queryset = super().get_queryset(request)
        queryset = queryset.select_related('user', 'content')
        return queryset


@admin.register(ContentCompletion)
class ContentCompletionAdmin(admin.ModelAdmin, ExportCSVMixin):
    """Admin interface for ContentCompletion model."""
    
    list_display = ['enrollment', 'content', 'completed_at', 'quiz_score', 'passed']
    list_filter = ['passed', 'completed_at']
    search_fields = ['enrollment__user__email', 'content__title']
    readonly_fields = ['completed_at']
    raw_id_fields = ['enrollment', 'content']
    
    def get_queryset(self, request):
        """Optimize queryset with select_related."""
        queryset = super().get_queryset(request)
        queryset = queryset.select_related('enrollment__user', 'content')
        return queryset


@admin.register(ChallengeParticipant)
class ChallengeParticipantAdmin(admin.ModelAdmin, ExportCSVMixin):
    """Admin interface for ChallengeParticipant model."""
    
    list_display = ['user', 'challenge', 'current_amount', 'progress_percentage', 'completed', 'joined_at']
    list_filter = ['completed', 'challenge__status']
    search_fields = ['user__email', 'challenge__title']
    readonly_fields = ['joined_at', 'started_at', 'completed_at']
    raw_id_fields = ['user', 'challenge']
    
    def get_queryset(self, request):
        """Optimize queryset with select_related."""
        queryset = super().get_queryset(request)
        queryset = queryset.select_related('user', 'challenge')
        return queryset


@admin.register(WebinarQnA)
class WebinarQnAAdmin(admin.ModelAdmin, ExportCSVMixin):
    """Admin interface for WebinarQnA model."""
    
    list_display = ['question', 'webinar', 'user', 'answered', 'upvotes', 'created_at']
    list_filter = ['is_anonymous', 'answered_at']
    search_fields = ['question', 'webinar__title', 'user__email']
    readonly_fields = ['created_at', 'answered_at']
    raw_id_fields = ['webinar', 'user', 'answered_by']
    
    def answered(self, obj):
        """Check if question has been answered."""
        return bool(obj.answer)
    answered.boolean = True
    answered.short_description = 'Answered'


@admin.register(WebinarPoll)
class WebinarPollAdmin(admin.ModelAdmin, ExportCSVMixin):
    """Admin interface for WebinarPoll model."""
    
    list_display = ['question', 'webinar', 'is_active', 'response_count', 'created_at']
    list_filter = ['is_active', 'is_multiple_choice']
    search_fields = ['question', 'webinar__title']
    readonly_fields = ['created_at']
    raw_id_fields = ['webinar', 'created_by']
    
    def response_count(self, obj):
        """Count responses to the poll."""
        return obj.responses.count()
    response_count.short_description = 'Responses'


@admin.register(WebinarPollResponse)
class WebinarPollResponseAdmin(admin.ModelAdmin, ExportCSVMixin):
    """Admin interface for WebinarPollResponse model."""
    
    list_display = ['poll', 'user', 'submitted_at']
    list_filter = ['submitted_at']
    search_fields = ['poll__question', 'user__email']
    readonly_fields = ['submitted_at']
    raw_id_fields = ['poll', 'user']


@admin.register(UserAchievement)
class UserAchievementAdmin(admin.ModelAdmin, ExportCSVMixin):
    """Admin interface for UserAchievement model."""
    
    list_display = ['user', 'achievement', 'is_unlocked', 'progress', 'earned_at']
    list_filter = ['is_unlocked', 'achievement__achievement_type']
    search_fields = ['user__email', 'achievement__title']
    readonly_fields = ['earned_at']
    raw_id_fields = ['user', 'achievement', 'context_content', 'context_challenge', 'context_webinar']


# Custom admin views and URLs
from django.urls import path

class EducationHubAdminSite(admin.AdminSite):
    """Custom admin site for Education Hub with additional views."""
    
    site_header = "Education Hub Administration"
    site_title = "Education Hub Admin"
    index_title = "Education Hub Management"
    
    def get_urls(self):
        """Add custom URLs to admin site."""
        urls = super().get_urls()
        custom_urls = [
            path('analytics/', self.admin_view(self.analytics_view), name='education_analytics'),
            path('reports/', self.admin_view(self.reports_view), name='education_reports'),
        ]
        return custom_urls + urls
    
    def analytics_view(self, request):
        """Custom analytics view for education hub."""
        from django.shortcuts import render
        from django.db.models import Count, Sum, Avg
        
        # Get analytics data
        content_stats = EducationalContent.objects.aggregate(
            total=Count('id'),
            published=Count('id', filter=models.Q(is_published=True)),
            featured=Count('id', filter=models.Q(is_featured=True))
        )
        
        learning_path_stats = LearningPath.objects.aggregate(
            total=Count('id'),
            active_enrollments=Sum('enrolled_count'),
            completions=Sum('completed_count')
        )
        
        challenge_stats = SavingsChallenge.objects.aggregate(
            total=Count('id'),
            total_saved=Sum('total_amount_saved'),
            avg_success_rate=Avg('success_rate')
        )
        
        webinar_stats = Webinar.objects.aggregate(
            total=Count('id'),
            upcoming=Count('id', filter=models.Q(status='SCHEDULED')),
            average_rating=Avg('average_rating')
        )
        
        context = {
            **self.each_context(request),
            'content_stats': content_stats,
            'learning_path_stats': learning_path_stats,
            'challenge_stats': challenge_stats,
            'webinar_stats': webinar_stats,
            'title': 'Education Hub Analytics'
        }
        
        return render(request, 'admin/education_hub/analytics.html', context)
    
    def reports_view(self, request):
        """Custom reports view for education hub."""
        from django.shortcuts import render
        
        context = {
            **self.each_context(request),
            'title': 'Education Hub Reports'
        }
        
        return render(request, 'admin/education_hub/reports.html', context)


# Override default admin site if needed
# admin_site = EducationHubAdminSite(name='education_hub_admin')