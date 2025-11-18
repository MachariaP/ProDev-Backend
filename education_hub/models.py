from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _


class EducationalContent(models.Model):
    """Financial education content."""
    
    CONTENT_TYPE_CHOICES = [
        ('ARTICLE', 'Article'),
        ('VIDEO', 'Video'),
        ('TUTORIAL', 'Tutorial'),
        ('QUIZ', 'Quiz'),
        ('WEBINAR', 'Webinar'),
    ]
    
    CATEGORY_CHOICES = [
        ('SAVINGS', 'Savings'),
        ('INVESTMENTS', 'Investments'),
        ('LOANS', 'Loans'),
        ('BUDGETING', 'Budgeting'),
        ('FINANCIAL_PLANNING', 'Financial Planning'),
    ]
    
    DIFFICULTY_CHOICES = [
        ('BEGINNER', 'Beginner'),
        ('INTERMEDIATE', 'Intermediate'),
        ('ADVANCED', 'Advanced'),
    ]
    
    title = models.CharField(_('title'), max_length=200)
    slug = models.SlugField(_('slug'), unique=True)
    content_type = models.CharField(_('content type'), max_length=20, choices=CONTENT_TYPE_CHOICES)
    category = models.CharField(_('category'), max_length=30, choices=CATEGORY_CHOICES)
    difficulty = models.CharField(_('difficulty'), max_length=20, choices=DIFFICULTY_CHOICES)
    
    description = models.TextField(_('description'))
    content = models.TextField(_('content'), blank=True)
    video_url = models.URLField(_('video URL'), blank=True)
    
    duration_minutes = models.PositiveIntegerField(_('duration (minutes)'), help_text=_('Estimated completion time'))
    points_reward = models.PositiveIntegerField(_('points reward'), default=0)
    
    is_published = models.BooleanField(_('is published'), default=False)
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    
    views_count = models.PositiveIntegerField(_('views count'), default=0)
    
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    
    class Meta:
        verbose_name = _('educational content')
        verbose_name_plural = _('educational content')
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title


class UserProgress(models.Model):
    """Track user progress on educational content."""
    
    STATUS_CHOICES = [
        ('NOT_STARTED', 'Not Started'),
        ('IN_PROGRESS', 'In Progress'),
        ('COMPLETED', 'Completed'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='learning_progress')
    content = models.ForeignKey(EducationalContent, on_delete=models.CASCADE, related_name='user_progress')
    
    status = models.CharField(_('status'), max_length=20, choices=STATUS_CHOICES, default='NOT_STARTED')
    progress_percentage = models.PositiveIntegerField(_('progress percentage'), default=0)
    
    started_at = models.DateTimeField(_('started at'), blank=True, null=True)
    completed_at = models.DateTimeField(_('completed at'), blank=True, null=True)
    time_spent_minutes = models.PositiveIntegerField(_('time spent (minutes)'), default=0)
    
    quiz_score = models.DecimalField(_('quiz score'), max_digits=5, decimal_places=2, blank=True, null=True)
    
    class Meta:
        verbose_name = _('user progress')
        verbose_name_plural = _('user progress')
        unique_together = ['user', 'content']
        ordering = ['-started_at']
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.content.title} - {self.progress_percentage}%"


class SavingsChallenge(models.Model):
    """Savings challenges for members."""
    
    STATUS_CHOICES = [
        ('UPCOMING', 'Upcoming'),
        ('ACTIVE', 'Active'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
    ]
    
    title = models.CharField(_('title'), max_length=200)
    description = models.TextField(_('description'))
    target_amount = models.DecimalField(_('target amount'), max_digits=12, decimal_places=2)
    duration_days = models.PositiveIntegerField(_('duration (days)'))
    
    start_date = models.DateField(_('start date'))
    end_date = models.DateField(_('end date'))
    status = models.CharField(_('status'), max_length=20, choices=STATUS_CHOICES, default='UPCOMING')
    
    reward_points = models.PositiveIntegerField(_('reward points'), default=0)
    participants_count = models.PositiveIntegerField(_('participants count'), default=0)
    
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    
    class Meta:
        verbose_name = _('savings challenge')
        verbose_name_plural = _('savings challenges')
        ordering = ['-start_date']
    
    def __str__(self):
        return self.title


class ChallengeParticipant(models.Model):
    """Track challenge participation."""
    
    challenge = models.ForeignKey(SavingsChallenge, on_delete=models.CASCADE, related_name='participants')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='challenge_participations')
    
    current_amount = models.DecimalField(_('current amount'), max_digits=12, decimal_places=2, default=0)
    completed = models.BooleanField(_('completed'), default=False)
    
    joined_at = models.DateTimeField(_('joined at'), auto_now_add=True)
    completed_at = models.DateTimeField(_('completed at'), blank=True, null=True)
    
    class Meta:
        verbose_name = _('challenge participant')
        verbose_name_plural = _('challenge participants')
        unique_together = ['challenge', 'user']
        ordering = ['-current_amount']
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.challenge.title}"


class Webinar(models.Model):
    """Webinar management."""
    
    STATUS_CHOICES = [
        ('SCHEDULED', 'Scheduled'),
        ('LIVE', 'Live'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
    ]
    
    title = models.CharField(_('title'), max_length=200)
    description = models.TextField(_('description'))
    presenter = models.CharField(_('presenter'), max_length=200)
    
    scheduled_at = models.DateTimeField(_('scheduled at'))
    duration_minutes = models.PositiveIntegerField(_('duration (minutes)'))
    
    meeting_url = models.URLField(_('meeting URL'), blank=True)
    recording_url = models.URLField(_('recording URL'), blank=True)
    
    status = models.CharField(_('status'), max_length=20, choices=STATUS_CHOICES, default='SCHEDULED')
    max_participants = models.PositiveIntegerField(_('max participants'), default=100)
    registered_count = models.PositiveIntegerField(_('registered count'), default=0)
    
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    
    class Meta:
        verbose_name = _('webinar')
        verbose_name_plural = _('webinars')
        ordering = ['-scheduled_at']
    
    def __str__(self):
        return f"{self.title} - {self.scheduled_at}"
