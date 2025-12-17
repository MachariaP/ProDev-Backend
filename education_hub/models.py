from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
import uuid
from django.contrib.postgres.fields import ArrayField
from django.core.validators import MinValueValidator, MaxValueValidator


class EducationalContent(models.Model):
    """Financial education content."""
    
    CONTENT_TYPE_CHOICES = [
        ('ARTICLE', 'Article'),
        ('VIDEO', 'Video'),
        ('TUTORIAL', 'Tutorial'),
        ('QUIZ', 'Quiz'),
        ('WEBINAR', 'Webinar'),
        ('COURSE', 'Course'),
        ('EBOOK', 'E-Book'),
    ]
    
    CATEGORY_CHOICES = [
        ('SAVINGS', 'Savings'),
        ('INVESTMENTS', 'Investments'),
        ('LOANS', 'Loans'),
        ('BUDGETING', 'Budgeting'),
        ('FINANCIAL_PLANNING', 'Financial Planning'),
        ('CREDIT_SCORE', 'Credit Score'),
        ('TAXES', 'Taxes'),
        ('RETIREMENT', 'Retirement'),
        ('INSURANCE', 'Insurance'),
        ('ENTREPRENEURSHIP', 'Entrepreneurship'),
    ]
    
    DIFFICULTY_CHOICES = [
        ('BEGINNER', 'Beginner'),
        ('INTERMEDIATE', 'Intermediate'),
        ('ADVANCED', 'Advanced'),
        ('EXPERT', 'Expert'),
    ]
    
    title = models.CharField(_('title'), max_length=200)
    slug = models.SlugField(_('slug'), unique=True)
    content_type = models.CharField(_('content type'), max_length=20, choices=CONTENT_TYPE_CHOICES)
    category = models.CharField(_('category'), max_length=30, choices=CATEGORY_CHOICES)
    difficulty = models.CharField(_('difficulty'), max_length=20, choices=DIFFICULTY_CHOICES)
    
    description = models.TextField(_('description'))
    content = models.TextField(_('content'), blank=True)
    video_url = models.URLField(_('video URL'), blank=True)
    thumbnail_url = models.URLField(_('thumbnail URL'), blank=True)
    
    # New fields for structured learning
    prerequisites = models.ManyToManyField('self', symmetrical=False, blank=True, 
                                         related_name='preparation_for')
    learning_objectives = ArrayField(
        models.CharField(max_length=200),
        default=list,
        blank=True,
        help_text=_('List of learning objectives')
    )
    tags = ArrayField(
        models.CharField(max_length=50),
        default=list,
        blank=True,
        help_text=_('Tags for better searchability')
    )
    
    duration_minutes = models.PositiveIntegerField(_('duration (minutes)'), help_text=_('Estimated completion time'))
    points_reward = models.PositiveIntegerField(_('points reward'), default=0)
    certificate_available = models.BooleanField(_('certificate available'), default=False)
    
    # For quizzes
    quiz_questions = models.JSONField(_('quiz questions'), blank=True, null=True,
                                     help_text=_('JSON array of quiz questions with options and correct answers'))
    passing_score = models.PositiveIntegerField(_('passing score'), default=70,
                                               validators=[MinValueValidator(0), MaxValueValidator(100)])
    
    is_published = models.BooleanField(_('is published'), default=False)
    is_featured = models.BooleanField(_('is featured'), default=False)
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    
    views_count = models.PositiveIntegerField(_('views count'), default=0)
    likes_count = models.PositiveIntegerField(_('likes count'), default=0)
    share_count = models.PositiveIntegerField(_('share count'), default=0)
    
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    published_at = models.DateTimeField(_('published at'), null=True, blank=True)
    
    class Meta:
        verbose_name = _('educational content')
        verbose_name_plural = _('educational content')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['category', 'difficulty']),
            models.Index(fields=['is_published', 'is_featured']),
            models.Index(fields=['views_count']),
        ]
    
    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        if self.is_published and not self.published_at:
            from django.utils import timezone
            self.published_at = timezone.now()
        super().save(*args, **kwargs)


class LearningPath(models.Model):
    """Structured learning paths for different financial goals."""
    
    PATH_TYPE_CHOICES = [
        ('BEGINNER_FINANCIAL_LITERACY', 'Beginner Financial Literacy'),
        ('INVESTMENT_MASTERY', 'Investment Mastery'),
        ('DEBT_MANAGEMENT', 'Debt Management'),
        ('BUSINESS_FINANCE', 'Business Finance'),
        ('RETIREMENT_PLANNING', 'Retirement Planning'),
        ('WEALTH_BUILDING', 'Wealth Building'),
    ]
    
    title = models.CharField(_('title'), max_length=200)
    slug = models.SlugField(_('slug'), unique=True)
    description = models.TextField(_('description'))
    short_description = models.CharField(_('short description'), max_length=300, blank=True)
    
    path_type = models.CharField(_('path type'), max_length=50, choices=PATH_TYPE_CHOICES)
    icon_name = models.CharField(_('icon name'), max_length=50, blank=True)
    color_code = models.CharField(_('color code'), max_length=7, default='#3B82F6')
    
    learning_path_contents = models.ManyToManyField(
        EducationalContent,
        through='LearningPathContent',
        related_name='learning_paths'
    )
    
    total_duration_hours = models.PositiveIntegerField(_('total duration (hours)'), default=0)
    total_points = models.PositiveIntegerField(_('total points'), default=0)
    contents_count = models.PositiveIntegerField(_('contents count'), default=0)
    
    is_published = models.BooleanField(_('is published'), default=False)
    is_featured = models.BooleanField(_('is featured'), default=False)
    difficulty = models.CharField(_('difficulty'), max_length=20, choices=EducationalContent.DIFFICULTY_CHOICES)
    
    completion_badge = models.CharField(_('completion badge'), max_length=100, blank=True)
    completion_certificate = models.BooleanField(_('completion certificate'), default=True)
    
    enrolled_count = models.PositiveIntegerField(_('enrolled count'), default=0)
    completed_count = models.PositiveIntegerField(_('completed count'), default=0)
    
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    
    class Meta:
        verbose_name = _('learning path')
        verbose_name_plural = _('learning paths')
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title
    
    def update_counts(self):
        """Update content counts and totals."""
        self.contents_count = self.learning_path_contents.count()
        self.total_duration_hours = sum(
            content.duration_minutes for content in self.learning_path_contents.all()
        ) // 60
        self.total_points = sum(
            content.points_reward for content in self.learning_path_contents.all()
        )
        self.save()


class LearningPathContent(models.Model):
    """Ordered contents within a learning path."""
    
    learning_path = models.ForeignKey(LearningPath, on_delete=models.CASCADE, related_name='path_contents')
    content = models.ForeignKey(EducationalContent, on_delete=models.CASCADE, related_name='path_assignments')
    order = models.PositiveIntegerField(_('order'), default=0)
    is_required = models.BooleanField(_('is required'), default=True)
    
    class Meta:
        verbose_name = _('learning path content')
        verbose_name_plural = _('learning path contents')
        ordering = ['order']
        unique_together = ['learning_path', 'content']
    
    def __str__(self):
        return f"{self.learning_path.title} - {self.content.title}"


class LearningPathEnrollment(models.Model):
    """Track user enrollment in learning paths."""
    
    STATUS_CHOICES = [
        ('ENROLLED', 'Enrolled'),
        ('IN_PROGRESS', 'In Progress'),
        ('COMPLETED', 'Completed'),
        ('DROPPED', 'Dropped'),
        ('PAUSED', 'Paused'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='path_enrollments')
    learning_path = models.ForeignKey(LearningPath, on_delete=models.CASCADE, related_name='enrollments')
    
    enrollment_id = models.UUIDField(_('enrollment ID'), default=uuid.uuid4, editable=False, unique=True)
    status = models.CharField(_('status'), max_length=20, choices=STATUS_CHOICES, default='ENROLLED')
    
    current_content = models.ForeignKey(EducationalContent, on_delete=models.SET_NULL, 
                                       null=True, blank=True, related_name='current_enrollments')
    completed_contents = models.ManyToManyField(EducationalContent, through='ContentCompletion',
                                               related_name='completed_by')
    
    progress_percentage = models.PositiveIntegerField(_('progress percentage'), default=0)
    
    enrolled_at = models.DateTimeField(_('enrolled at'), auto_now_add=True)
    started_at = models.DateTimeField(_('started at'), null=True, blank=True)
    completed_at = models.DateTimeField(_('completed at'), null=True, blank=True)
    last_accessed_at = models.DateTimeField(_('last accessed at'), auto_now=True)
    
    total_time_spent_minutes = models.PositiveIntegerField(_('total time spent (minutes)'), default=0)
    earned_points = models.PositiveIntegerField(_('earned points'), default=0)
    
    notes = models.TextField(_('notes'), blank=True)
    
    class Meta:
        verbose_name = _('learning path enrollment')
        verbose_name_plural = _('learning path enrollments')
        unique_together = ['user', 'learning_path']
        ordering = ['-enrolled_at']
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.learning_path.title} ({self.progress_percentage}%)"
    
    def update_progress(self):
        """Update progress percentage and status."""
        total_contents = self.learning_path.contents_count
        if total_contents == 0:
            return
        
        completed_count = self.completed_contents.count()
        self.progress_percentage = int((completed_count / total_contents) * 100)
        
        if self.progress_percentage == 0:
            self.status = 'ENROLLED'
        elif self.progress_percentage == 100:
            self.status = 'COMPLETED'
            if not self.completed_at:
                from django.utils import timezone
                self.completed_at = timezone.now()
        elif self.progress_percentage > 0:
            self.status = 'IN_PROGRESS'
        
        self.save()


class ContentCompletion(models.Model):
    """Track completion of individual content within a learning path."""
    
    enrollment = models.ForeignKey(LearningPathEnrollment, on_delete=models.CASCADE, related_name='completions')
    content = models.ForeignKey(EducationalContent, on_delete=models.CASCADE, related_name='completion_records')
    
    completed_at = models.DateTimeField(_('completed at'), auto_now_add=True)
    time_spent_minutes = models.PositiveIntegerField(_('time spent (minutes)'), default=0)
    quiz_score = models.DecimalField(_('quiz score'), max_digits=5, decimal_places=2, null=True, blank=True)
    passed = models.BooleanField(_('passed'), default=False)
    
    notes = models.TextField(_('notes'), blank=True)
    
    class Meta:
        verbose_name = _('content completion')
        verbose_name_plural = _('content completions')
        unique_together = ['enrollment', 'content']
    
    def __str__(self):
        return f"{self.enrollment.user.get_full_name()} completed {self.content.title}"


class UserProgress(models.Model):
    """Track user progress on educational content (legacy and standalone)."""
    
    STATUS_CHOICES = [
        ('NOT_STARTED', 'Not Started'),
        ('IN_PROGRESS', 'In Progress'),
        ('COMPLETED', 'Completed'),
        ('REVIEWING', 'Reviewing'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='learning_progress')
    content = models.ForeignKey(EducationalContent, on_delete=models.CASCADE, related_name='user_progress')
    
    status = models.CharField(_('status'), max_length=20, choices=STATUS_CHOICES, default='NOT_STARTED')
    progress_percentage = models.PositiveIntegerField(_('progress percentage'), default=0)
    
    started_at = models.DateTimeField(_('started at'), blank=True, null=True)
    completed_at = models.DateTimeField(_('completed at'), blank=True, null=True)
    time_spent_minutes = models.PositiveIntegerField(_('time spent (minutes)'), default=0)
    
    quiz_score = models.DecimalField(_('quiz score'), max_digits=5, decimal_places=2, blank=True, null=True)
    quiz_answers = models.JSONField(_('quiz answers'), blank=True, null=True,
                                   help_text=_('User answers for quiz'))
    
    bookmarked = models.BooleanField(_('bookmarked'), default=False)
    last_position = models.PositiveIntegerField(_('last position'), default=0,
                                               help_text=_('Last position in video/article'))
    
    class Meta:
        verbose_name = _('user progress')
        verbose_name_plural = _('user progress')
        unique_together = ['user', 'content']
        ordering = ['-started_at']
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.content.title} - {self.progress_percentage}%"
    
    def mark_completed(self, quiz_score=None, quiz_answers=None):
        """Mark content as completed with optional quiz results."""
        from django.utils import timezone
        
        self.status = 'COMPLETED'
        self.progress_percentage = 100
        self.completed_at = timezone.now()
        
        if quiz_score is not None:
            self.quiz_score = quiz_score
            self.quiz_answers = quiz_answers
        
        self.save()


class Certificate(models.Model):
    """Certificates awarded for completing learning paths or significant content."""
    
    certificate_id = models.UUIDField(_('certificate ID'), default=uuid.uuid4, editable=False, unique=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='certificates')
    
    # Either learning path or content
    learning_path = models.ForeignKey(LearningPath, on_delete=models.CASCADE, null=True, blank=True,
                                     related_name='certificates_awarded')
    content = models.ForeignKey(EducationalContent, on_delete=models.CASCADE, null=True, blank=True,
                               related_name='certificates_awarded')
    
    title = models.CharField(_('title'), max_length=200)
    description = models.TextField(_('description'), blank=True)
    
    issued_at = models.DateTimeField(_('issued at'), auto_now_add=True)
    valid_until = models.DateField(_('valid until'), null=True, blank=True)
    
    grade = models.CharField(_('grade'), max_length=20, blank=True,
                            choices=[('PASS', 'Pass'), ('MERIT', 'Merit'), ('DISTINCTION', 'Distinction')])
    score = models.DecimalField(_('score'), max_digits=5, decimal_places=2, null=True, blank=True)
    
    certificate_url = models.URLField(_('certificate URL'), blank=True)
    certificate_pdf = models.FileField(_('certificate PDF'), upload_to='certificates/', null=True, blank=True)
    
    verification_code = models.CharField(_('verification code'), max_length=50, unique=True)
    is_public = models.BooleanField(_('is public'), default=False)
    
    class Meta:
        verbose_name = _('certificate')
        verbose_name_plural = _('certificates')
        ordering = ['-issued_at']
    
    def __str__(self):
        return f"Certificate #{self.certificate_id} - {self.user.get_full_name()}"
    
    def save(self, *args, **kwargs):
        if not self.verification_code:
            import secrets
            self.verification_code = secrets.token_urlsafe(16)
        super().save(*args, **kwargs)


class SavingsChallenge(models.Model):
    """Savings challenges for members."""
    
    STATUS_CHOICES = [
        ('UPCOMING', 'Upcoming'),
        ('ACTIVE', 'Active'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
        ('ARCHIVED', 'Archived'),
    ]
    
    CHALLENGE_TYPE_CHOICES = [
        ('WEEKLY_SAVINGS', 'Weekly Savings'),
        ('MONTHLY_SAVINGS', 'Monthly Savings'),
        ('SPECIAL_EVENT', 'Special Event'),
        ('EMERGENCY_FUND', 'Emergency Fund'),
        ('INVESTMENT_CHALLENGE', 'Investment Challenge'),
    ]
    
    title = models.CharField(_('title'), max_length=200)
    slug = models.SlugField(_('slug'), unique=True)
    description = models.TextField(_('description'))
    short_description = models.CharField(_('short description'), max_length=300)
    
    challenge_type = models.CharField(_('challenge type'), max_length=30, choices=CHALLENGE_TYPE_CHOICES)
    target_amount = models.DecimalField(_('target amount'), max_digits=12, decimal_places=2)
    duration_days = models.PositiveIntegerField(_('duration (days)'))
    
    start_date = models.DateField(_('start date'))
    end_date = models.DateField(_('end date'))
    status = models.CharField(_('status'), max_length=20, choices=STATUS_CHOICES, default='UPCOMING')
    
    # Challenge details
    min_participants = models.PositiveIntegerField(_('min participants'), default=1)
    max_participants = models.PositiveIntegerField(_('max participants'), default=100)
    participants_count = models.PositiveIntegerField(_('participants count'), default=0)
    
    reward_points = models.PositiveIntegerField(_('reward points'), default=0)
    reward_badge = models.CharField(_('reward badge'), max_length=100, blank=True)
    
    # Educational content linked to challenge
    learning_path = models.ForeignKey(LearningPath, on_delete=models.SET_NULL, null=True, blank=True,
                                     related_name='challenges')
    educational_content = models.ManyToManyField(EducationalContent, blank=True, related_name='challenges')
    
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='created_challenges')
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    
    # Progress tracking
    total_amount_saved = models.DecimalField(_('total amount saved'), max_digits=12, decimal_places=2, default=0)
    success_rate = models.DecimalField(_('success rate'), max_digits=5, decimal_places=2, default=0)
    
    class Meta:
        verbose_name = _('savings challenge')
        verbose_name_plural = _('savings challenges')
        ordering = ['-start_date']
    
    def __str__(self):
        return self.title
    
    def update_challenge_status(self):
        """Update challenge status based on dates."""
        from django.utils import timezone
        today = timezone.now().date()
        
        if self.end_date < today and self.status == 'ACTIVE':
            self.status = 'COMPLETED'
            self.save()
        elif self.start_date <= today <= self.end_date and self.status == 'UPCOMING':
            self.status = 'ACTIVE'
            self.save()
    
    def calculate_success_rate(self):
        """Calculate success rate of challenge participants."""
        completed = self.participants.filter(completed=True).count()
        total = self.participants.count()
        
        if total > 0:
            self.success_rate = (completed / total) * 100
            self.save()


class ChallengeParticipant(models.Model):
    """Track challenge participation."""
    
    challenge = models.ForeignKey(SavingsChallenge, on_delete=models.CASCADE, related_name='participants')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='challenge_participations')
    
    current_amount = models.DecimalField(_('current amount'), max_digits=12, decimal_places=2, default=0)
    target_amount = models.DecimalField(_('target amount'), max_digits=12, decimal_places=2, null=True, blank=True)
    
    progress_percentage = models.PositiveIntegerField(_('progress percentage'), default=0)
    completed = models.BooleanField(_('completed'), default=False)
    streak_days = models.PositiveIntegerField(_('streak days'), default=0)
    
    joined_at = models.DateTimeField(_('joined at'), auto_now_add=True)
    started_at = models.DateTimeField(_('started at'), null=True, blank=True)
    completed_at = models.DateTimeField(_('completed at'), blank=True, null=True)
    last_activity_at = models.DateTimeField(_('last activity at'), auto_now=True)
    
    # Learning progress
    completed_lessons = models.ManyToManyField(EducationalContent, blank=True, related_name='challenge_completions')
    learning_progress = models.PositiveIntegerField(_('learning progress'), default=0)
    
    # Custom savings plan
    daily_target = models.DecimalField(_('daily target'), max_digits=10, decimal_places=2, null=True, blank=True)
    weekly_target = models.DecimalField(_('weekly target'), max_digits=10, decimal_places=2, null=True, blank=True)
    
    notes = models.TextField(_('notes'), blank=True)
    
    class Meta:
        verbose_name = _('challenge participant')
        verbose_name_plural = _('challenge participants')
        unique_together = ['challenge', 'user']
        ordering = ['-current_amount']
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.challenge.title}"
    
    def update_progress(self):
        """Update progress percentage."""
        if self.target_amount and self.target_amount > 0:
            self.progress_percentage = int((self.current_amount / self.target_amount) * 100)
            if self.progress_percentage >= 100:
                self.completed = True
                if not self.completed_at:
                    from django.utils import timezone
                    self.completed_at = timezone.now()
            self.save()


class Webinar(models.Model):
    """Webinar management with Zoom/Teams integration."""
    
    STATUS_CHOICES = [
        ('SCHEDULED', 'Scheduled'),
        ('LIVE', 'Live'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
        ('RECORDING_AVAILABLE', 'Recording Available'),
    ]
    
    PLATFORM_CHOICES = [
        ('ZOOM', 'Zoom'),
        ('TEAMS', 'Microsoft Teams'),
        ('GOOGLE_MEET', 'Google Meet'),
        ('JITSI', 'Jitsi'),
        ('CUSTOM', 'Custom Platform'),
    ]
    
    title = models.CharField(_('title'), max_length=200)
    slug = models.SlugField(_('slug'), unique=True)
    description = models.TextField(_('description'))
    short_description = models.CharField(_('short description'), max_length=300, blank=True)
    
    presenter = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, 
                                 related_name='presented_webinars')
    co_presenters = models.ManyToManyField(settings.AUTH_USER_MODEL, blank=True, related_name='co_presented_webinars')
    
    scheduled_at = models.DateTimeField(_('scheduled at'))
    duration_minutes = models.PositiveIntegerField(_('duration (minutes)'))
    timezone = models.CharField(_('timezone'), max_length=50, default='UTC')
    
    # Platform integration
    platform = models.CharField(_('platform'), max_length=20, choices=PLATFORM_CHOICES, default='ZOOM')
    meeting_id = models.CharField(_('meeting ID'), max_length=100, blank=True)
    meeting_url = models.URLField(_('meeting URL'), blank=True)
    join_url = models.URLField(_('join URL'), blank=True)
    host_url = models.URLField(_('host URL'), blank=True)
    password = models.CharField(_('password'), max_length=100, blank=True)
    
    # Recording
    recording_url = models.URLField(_('recording URL'), blank=True)
    recording_password = models.CharField(_('recording password'), max_length=100, blank=True)
    recording_available_at = models.DateTimeField(_('recording available at'), null=True, blank=True)
    
    # Webinar details
    status = models.CharField(_('status'), max_length=20, choices=STATUS_CHOICES, default='SCHEDULED')
    category = models.CharField(_('category'), max_length=30, choices=EducationalContent.CATEGORY_CHOICES)
    difficulty = models.CharField(_('difficulty'), max_length=20, choices=EducationalContent.DIFFICULTY_CHOICES)
    
    max_participants = models.PositiveIntegerField(_('max participants'), default=100)
    registered_count = models.PositiveIntegerField(_('registered count'), default=0)
    attended_count = models.PositiveIntegerField(_('attended count'), default=0)
    
    # Educational content
    learning_path = models.ForeignKey(LearningPath, on_delete=models.SET_NULL, null=True, blank=True,
                                     related_name='webinars')
    related_content = models.ManyToManyField(EducationalContent, blank=True, related_name='webinars')
    
    # Resources
    slides_url = models.URLField(_('slides URL'), blank=True)
    resources_url = models.URLField(_('resources URL'), blank=True)
    qna_enabled = models.BooleanField(_('Q&A enabled'), default=True)
    poll_enabled = models.BooleanField(_('poll enabled'), default=False)
    
    # Points and rewards
    points_reward = models.PositiveIntegerField(_('points reward'), default=10)
    certificate_available = models.BooleanField(_('certificate available'), default=True)
    
    # Analytics
    views_count = models.PositiveIntegerField(_('views count'), default=0)
    average_rating = models.DecimalField(_('average rating'), max_digits=3, decimal_places=2, default=0)
    
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    
    class Meta:
        verbose_name = _('webinar')
        verbose_name_plural = _('webinars')
        ordering = ['-scheduled_at']
    
    def __str__(self):
        return f"{self.title} - {self.scheduled_at}"
    
    def update_status(self):
        """Update webinar status based on current time."""
        from django.utils import timezone
        now = timezone.now()
        
        if self.status == 'CANCELLED':
            return
        
        if now < self.scheduled_at:
            self.status = 'SCHEDULED'
        elif self.scheduled_at <= now <= self.scheduled_at + timezone.timedelta(minutes=self.duration_minutes):
            self.status = 'LIVE'
        elif now > self.scheduled_at + timezone.timedelta(minutes=self.duration_minutes):
            if self.recording_url:
                self.status = 'RECORDING_AVAILABLE'
            else:
                self.status = 'COMPLETED'
        
        self.save()


class WebinarRegistration(models.Model):
    """Track webinar registrations and attendance."""
    
    STATUS_CHOICES = [
        ('REGISTERED', 'Registered'),
        ('ATTENDED', 'Attended'),
        ('ABSENT', 'Absent'),
        ('CANCELLED', 'Cancelled'),
        ('WAITLISTED', 'Waitlisted'),
    ]
    
    webinar = models.ForeignKey(Webinar, on_delete=models.CASCADE, related_name='registrations')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='webinar_registrations')
    
    registration_id = models.UUIDField(_('registration ID'), default=uuid.uuid4, editable=False, unique=True)
    status = models.CharField(_('status'), max_length=20, choices=STATUS_CHOICES, default='REGISTERED')
    
    registered_at = models.DateTimeField(_('registered at'), auto_now_add=True)
    joined_at = models.DateTimeField(_('joined at'), null=True, blank=True)
    left_at = models.DateTimeField(_('left at'), null=True, blank=True)
    attendance_duration = models.PositiveIntegerField(_('attendance duration (minutes)'), default=0)
    
    # Check-in
    checkin_code = models.CharField(_('check-in code'), max_length=10, blank=True)
    checked_in = models.BooleanField(_('checked in'), default=False)
    checkin_at = models.DateTimeField(_('check-in at'), null=True, blank=True)
    
    # Feedback
    rating = models.PositiveIntegerField(_('rating'), null=True, blank=True,
                                        validators=[MinValueValidator(1), MaxValueValidator(5)])
    feedback = models.TextField(_('feedback'), blank=True)
    feedback_at = models.DateTimeField(_('feedback at'), null=True, blank=True)
    
    # Notifications
    reminder_sent = models.BooleanField(_('reminder sent'), default=False)
    followup_sent = models.BooleanField(_('follow-up sent'), default=False)
    
    # Additional info
    timezone = models.CharField(_('timezone'), max_length=50, default='UTC')
    source = models.CharField(_('source'), max_length=50, default='WEB', 
                             choices=[('WEB', 'Web'), ('MOBILE', 'Mobile'), ('INVITE', 'Invite')])
    
    notes = models.TextField(_('notes'), blank=True)
    
    class Meta:
        verbose_name = _('webinar registration')
        verbose_name_plural = _('webinar registrations')
        unique_together = ['webinar', 'user']
        ordering = ['-registered_at']
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.webinar.title}"
    
    def mark_attended(self):
        """Mark registration as attended."""
        from django.utils import timezone
        
        self.status = 'ATTENDED'
        self.checked_in = True
        self.checkin_at = timezone.now()
        self.joined_at = self.joined_at or timezone.now()
        self.save()


class WebinarQnA(models.Model):
    """Q&A for webinars."""
    
    webinar = models.ForeignKey(Webinar, on_delete=models.CASCADE, related_name='questions')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='webinar_questions')
    
    question = models.TextField(_('question'))
    answer = models.TextField(_('answer'), blank=True)
    answered_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
                                   related_name='answered_questions')
    
    is_anonymous = models.BooleanField(_('is anonymous'), default=False)
    upvotes = models.PositiveIntegerField(_('upvotes'), default=0)
    answered_at = models.DateTimeField(_('answered at'), null=True, blank=True)
    
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    
    class Meta:
        verbose_name = _('webinar Q&A')
        verbose_name_plural = _('webinar Q&A')
        ordering = ['-upvotes', '-created_at']
    
    def __str__(self):
        return f"Q: {self.question[:50]}..."


class WebinarPoll(models.Model):
    """Polls for webinars."""
    
    webinar = models.ForeignKey(Webinar, on_delete=models.CASCADE, related_name='polls')
    question = models.TextField(_('question'))
    options = models.JSONField(_('options'), help_text=_('JSON array of poll options'))
    
    is_active = models.BooleanField(_('is active'), default=True)
    is_multiple_choice = models.BooleanField(_('is multiple choice'), default=False)
    
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    ends_at = models.DateTimeField(_('ends at'), null=True, blank=True)
    
    class Meta:
        verbose_name = _('webinar poll')
        verbose_name_plural = _('webinar polls')
    
    def __str__(self):
        return f"Poll: {self.question[:50]}..."


class WebinarPollResponse(models.Model):
    """Responses to webinar polls."""
    
    poll = models.ForeignKey(WebinarPoll, on_delete=models.CASCADE, related_name='responses')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='poll_responses')
    
    selected_options = models.JSONField(_('selected options'), help_text=_('JSON array of selected option indices'))
    submitted_at = models.DateTimeField(_('submitted at'), auto_now_add=True)
    
    class Meta:
        verbose_name = _('webinar poll response')
        verbose_name_plural = _('webinar poll responses')
        unique_together = ['poll', 'user']
    
    def __str__(self):
        return f"{self.user.get_full_name()}'s response to {self.poll.question[:30]}..."


class Achievement(models.Model):
    """Achievements and badges for users."""
    
    ACHIEVEMENT_TYPE_CHOICES = [
        ('LEARNING', 'Learning'),
        ('SAVINGS', 'Savings'),
        ('COMMUNITY', 'Community'),
        ('EXPERIENCE', 'Experience'),
        ('SPECIAL', 'Special'),
    ]
    
    title = models.CharField(_('title'), max_length=200)
    description = models.TextField(_('description'))
    icon_name = models.CharField(_('icon name'), max_length=50)
    icon_color = models.CharField(_('icon color'), max_length=7, default='#FFD700')
    
    achievement_type = models.CharField(_('achievement type'), max_length=20, choices=ACHIEVEMENT_TYPE_CHOICES)
    rarity = models.CharField(_('rarity'), max_length=20, 
                             choices=[('COMMON', 'Common'), ('RARE', 'Rare'), ('EPIC', 'Epic'), ('LEGENDARY', 'Legendary')])
    
    points_value = models.PositiveIntegerField(_('points value'), default=0)
    
    # Criteria
    criteria_type = models.CharField(_('criteria type'), max_length=50)
    criteria_value = models.JSONField(_('criteria value'), help_text=_('JSON criteria for earning achievement'))
    
    is_active = models.BooleanField(_('is active'), default=True)
    
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    
    class Meta:
        verbose_name = _('achievement')
        verbose_name_plural = _('achievements')
        ordering = ['-points_value']
    
    def __str__(self):
        return self.title


class UserAchievement(models.Model):
    """Track user achievements."""
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='achievements')
    achievement = models.ForeignKey(Achievement, on_delete=models.CASCADE, related_name='user_achievements')
    
    earned_at = models.DateTimeField(_('earned at'), auto_now_add=True)
    progress = models.PositiveIntegerField(_('progress'), default=0)
    is_unlocked = models.BooleanField(_('is unlocked'), default=False)
    
    # Context
    context_content = models.ForeignKey(EducationalContent, on_delete=models.SET_NULL, null=True, blank=True)
    context_challenge = models.ForeignKey(SavingsChallenge, on_delete=models.SET_NULL, null=True, blank=True)
    context_webinar = models.ForeignKey(Webinar, on_delete=models.SET_NULL, null=True, blank=True)
    
    notes = models.TextField(_('notes'), blank=True)
    
    class Meta:
        verbose_name = _('user achievement')
        verbose_name_plural = _('user achievements')
        unique_together = ['user', 'achievement']
        ordering = ['-earned_at']
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.achievement.title}"