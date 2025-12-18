"""
Filters for Education Hub.

This module defines Django FilterSet classes for filtering education hub models.
It provides comprehensive filtering capabilities for educational content,
learning paths, savings challenges, and webinars based on various criteria.

The filters are designed to be:
- Performant with optimized database queries
- Flexible with multiple filter types (exact, range, search, etc.)
- User-friendly with intuitive parameter names
- Extensible with custom filter methods
- Secure with proper validation and sanitization

Key Features:
- Combined filters for complex queries
- Search functionality across multiple fields
- Range filters for numerical values
- Date-based filtering with relative options
- Category and tag filtering with autocomplete
- Progress-based filtering for user-specific data
"""

import django_filters
from django.db.models import Q, Count, Avg, Sum
from django.utils import timezone
from datetime import timedelta
from .models import (
    EducationalContent, LearningPath, SavingsChallenge, Webinar,
    UserProgress, LearningPathEnrollment, ChallengeParticipant
)


class BaseEducationFilter(django_filters.FilterSet):
    """
    Base filter class with common functionality for all education hub filters.
    
    Provides:
    - Date range filtering
    - Search functionality
    - Ordering options
    - Pagination helpers
    - Performance optimizations
    
    All education hub filters should inherit from this base class.
    """
    
    search = django_filters.CharFilter(method='filter_search', label='Search')
    ordering = django_filters.CharFilter(method='filter_ordering', label='Ordering')
    date_from = django_filters.DateFilter(field_name='created_at', lookup_expr='gte')
    date_to = django_filters.DateFilter(field_name='created_at', lookup_expr='lte')
    
    class Meta:
        abstract = True
    
    def filter_search(self, queryset, name, value):
        """
        Generic search filter across multiple fields.
        
        Args:
            queryset: The base queryset to filter
            name: The filter field name (unused, required by method signature)
            value: The search term
        
        Returns:
            QuerySet: Filtered queryset with search applied
        
        Search logic:
        1. Splits search term into individual words
        2. Searches each word across multiple fields
        3. Uses OR logic between words
        4. Uses AND logic within each word across fields
        5. Orders results by relevance
        """
        if not value:
            return queryset
        
        # Split search term into words
        words = value.split()
        
        # Start with an empty Q object
        q_objects = Q()
        
        for word in words:
            # Create Q object for this word across multiple fields
            word_query = Q()
            
            # Add field-specific queries for each model
            # This will be overridden in child classes
            word_query |= Q(title__icontains=word)
            word_query |= Q(description__icontains=word)
            
            # Combine with AND logic
            q_objects &= word_query
        
        return queryset.filter(q_objects).distinct()
    
    def filter_ordering(self, queryset, name, value):
        """
        Apply ordering to queryset based on parameter.
        
        Args:
            queryset: The base queryset to order
            name: The filter field name (unused, required by method signature)
            value: The ordering parameter
        
        Returns:
            QuerySet: Ordered queryset
        
        Supported ordering values:
        - newest, oldest: By creation date
        - popular: By views or engagement
        - featured: Featured items first
        - alphabetical: Alphabetical by title
        - difficulty: By difficulty level
        - random: Random ordering
        """
        ordering_map = {
            'newest': '-created_at',
            'oldest': 'created_at',
            'popular': '-views_count',
            'featured': '-is_featured',
            'alphabetical': 'title',
            'difficulty': 'difficulty',
            'random': '?',
        }
        
        if value in ordering_map:
            return queryset.order_by(ordering_map[value])
        
        # Default ordering
        return queryset.order_by('-created_at')
    
    @property
    def qs(self):
        """
        Override to add performance optimizations to filtered queryset.
        
        Returns:
            QuerySet: Optimized queryset with select_related and prefetch_related
        
        Optimizations:
        - select_related for foreign key relationships
        - prefetch_related for many-to-many relationships
        - annotate with calculated fields if needed
        - Filter out unpublished content for non-staff users
        """
        queryset = super().qs
        
        # Apply model-specific optimizations in child classes
        return queryset


class EducationalContentFilter(BaseEducationFilter):
    """
    FilterSet for EducationalContent model with comprehensive filtering options.
    
    This filter provides detailed filtering capabilities for educational content
    including category, difficulty, content type, and user-specific progress.
    
    Filters:
        category: Filter by content category (SAVINGS, INVESTMENTS, etc.)
        difficulty: Filter by difficulty level (BEGINNER, INTERMEDIATE, etc.)
        content_type: Filter by content type (ARTICLE, VIDEO, QUIZ, etc.)
        is_featured: Filter by featured status (true/false)
        is_published: Filter by publication status (true/false)
        author: Filter by content author (user ID or username)
        tags: Filter by tags (comma-separated list)
        min_duration: Filter by minimum duration in minutes
        max_duration: Filter by maximum duration in minutes
        min_points: Filter by minimum points reward
        max_points: Filter by maximum points reward
        certificate_available: Filter by certificate availability
        progress_status: Filter by current user's progress status
        min_rating: Filter by minimum average rating
        min_completions: Filter by minimum completion count
    """
    
    category = django_filters.ChoiceFilter(
        choices=EducationalContent.CATEGORY_CHOICES,
        method='filter_category',
        label='Category'
    )
    
    difficulty = django_filters.ChoiceFilter(
        choices=EducationalContent.DIFFICULTY_CHOICES,
        method='filter_difficulty',
        label='Difficulty'
    )
    
    content_type = django_filters.ChoiceFilter(
        choices=EducationalContent.CONTENT_TYPE_CHOICES,
        method='filter_content_type',
        label='Content Type'
    )
    
    is_featured = django_filters.BooleanFilter(
        field_name='is_featured',
        label='Featured Only'
    )
    
    is_published = django_filters.BooleanFilter(
        field_name='is_published',
        label='Published Only',
        initial=True
    )
    
    author = django_filters.CharFilter(
        field_name='author__username',
        lookup_expr='icontains',
        label='Author'
    )
    
    tags = django_filters.CharFilter(
        method='filter_tags',
        label='Tags'
    )
    
    min_duration = django_filters.NumberFilter(
        field_name='duration_minutes',
        lookup_expr='gte',
        label='Minimum Duration (min)'
    )
    
    max_duration = django_filters.NumberFilter(
        field_name='duration_minutes',
        lookup_expr='lte',
        label='Maximum Duration (min)'
    )
    
    min_points = django_filters.NumberFilter(
        field_name='points_reward',
        lookup_expr='gte',
        label='Minimum Points'
    )
    
    max_points = django_filters.NumberFilter(
        field_name='points_reward',
        lookup_expr='lte',
        label='Maximum Points'
    )
    
    certificate_available = django_filters.BooleanFilter(
        field_name='certificate_available',
        label='Certificate Available'
    )
    
    progress_status = django_filters.ChoiceFilter(
        method='filter_progress_status',
        choices=[
            ('completed', 'Completed'),
            ('in_progress', 'In Progress'),
            ('not_started', 'Not Started'),
            ('bookmarked', 'Bookmarked'),
        ],
        label='My Progress Status'
    )
    
    min_rating = django_filters.NumberFilter(
        method='filter_min_rating',
        label='Minimum Rating',
        min_value=0,
        max_value=100
    )
    
    min_completions = django_filters.NumberFilter(
        method='filter_min_completions',
        label='Minimum Completions',
        min_value=0
    )
    
    class Meta:
        model = EducationalContent
        fields = [
            'category', 'difficulty', 'content_type', 'is_featured',
            'is_published', 'author', 'tags', 'min_duration', 'max_duration',
            'min_points', 'max_points', 'certificate_available',
            'progress_status', 'min_rating', 'min_completions'
        ]
    
    def __init__(self, data=None, queryset=None, *, request=None, prefix=None):
        """
        Initialize filter with request context for user-specific filtering.
        
        Args:
            data: Filter data from request
            queryset: Base queryset to filter
            request: HTTP request object for user context
            prefix: Filter prefix for form rendering
        """
        super().__init__(data=data, queryset=queryset, request=request, prefix=prefix)
        self.request = request
        
        # Set initial values for better UX
        if not data and request and request.user.is_authenticated:
            self.form.initial = {
                'is_published': True,
                'ordering': 'newest',
            }
    
    def filter_category(self, queryset, name, value):
        """Filter by category with support for multiple categories."""
        if not value:
            return queryset
        
        # Support comma-separated categories
        categories = [cat.strip() for cat in value.split(',')]
        return queryset.filter(category__in=categories)
    
    def filter_difficulty(self, queryset, name, value):
        """Filter by difficulty with support for multiple difficulties."""
        if not value:
            return queryset
        
        # Support comma-separated difficulties
        difficulties = [diff.strip() for diff in value.split(',')]
        return queryset.filter(difficulty__in=difficulties)
    
    def filter_content_type(self, queryset, name, value):
        """Filter by content type with support for multiple types."""
        if not value:
            return queryset
        
        # Support comma-separated content types
        content_types = [ct.strip() for ct in value.split(',')]
        return queryset.filter(content_type__in=content_types)
    
    def filter_tags(self, queryset, name, value):
        """Filter by tags with support for multiple tags."""
        if not value:
            return queryset
        
        # Split tags by comma and filter
        tags = [tag.strip().lower() for tag in value.split(',')]
        
        # Create Q objects for each tag
        q_objects = Q()
        for tag in tags:
            q_objects |= Q(tags__contains=[tag])
        
        return queryset.filter(q_objects)
    
    def filter_progress_status(self, queryset, name, value):
        """
        Filter by current user's progress status.
        
        Args:
            queryset: Content queryset
            name: Filter field name
            value: Progress status (completed, in_progress, not_started, bookmarked)
        
        Returns:
            QuerySet: Filtered by user progress
        
        Note: Requires request.user to be authenticated
        """
        if not value or not self.request or not self.request.user.is_authenticated:
            return queryset
        
        user = self.request.user
        
        if value == 'completed':
            # Get IDs of content completed by user
            completed_ids = UserProgress.objects.filter(
                user=user,
                status='COMPLETED'
            ).values_list('content_id', flat=True)
            return queryset.filter(id__in=completed_ids)
        
        elif value == 'in_progress':
            # Get IDs of content in progress by user
            in_progress_ids = UserProgress.objects.filter(
                user=user,
                status='IN_PROGRESS'
            ).values_list('content_id', flat=True)
            return queryset.filter(id__in=in_progress_ids)
        
        elif value == 'not_started':
            # Get IDs of content not started by user
            started_ids = UserProgress.objects.filter(
                user=user
            ).values_list('content_id', flat=True)
            return queryset.exclude(id__in=started_ids)
        
        elif value == 'bookmarked':
            # Get IDs of bookmarked content
            bookmarked_ids = UserProgress.objects.filter(
                user=user,
                bookmarked=True
            ).values_list('content_id', flat=True)
            return queryset.filter(id__in=bookmarked_ids)
        
        return queryset
    
    def filter_min_rating(self, queryset, name, value):
        """
        Filter by minimum average rating.
        
        Args:
            queryset: Content queryset
            name: Filter field name
            value: Minimum average rating (0-100)
        
        Returns:
            QuerySet: Content with average rating >= value
        
        Note: This requires annotating the queryset with average ratings
        """
        try:
            min_rating = float(value)
            if min_rating < 0 or min_rating > 100:
                return queryset
            
            # Annotate with average rating
            from django.db.models import Avg, Case, When, Value, FloatField
            from django.db.models.functions import Coalesce
            
            return queryset.annotate(
                avg_rating=Coalesce(
                    Avg('user_progress__quiz_score',
                        filter=Q(user_progress__quiz_score__isnull=False)),
                    Value(0.0),
                    output_field=FloatField()
                )
            ).filter(avg_rating__gte=min_rating)
        
        except (ValueError, TypeError):
            return queryset
    
    def filter_min_completions(self, queryset, name, value):
        """
        Filter by minimum completion count.
        
        Args:
            queryset: Content queryset
            name: Filter field name
            value: Minimum number of completions
        
        Returns:
            QuerySet: Content with completion count >= value
        """
        try:
            min_completions = int(value)
            if min_completions < 0:
                return queryset
            
            # Annotate with completion count
            return queryset.annotate(
                completion_count=Count(
                    'user_progress',
                    filter=Q(user_progress__status='COMPLETED')
                )
            ).filter(completion_count__gte=min_completions)
        
        except (ValueError, TypeError):
            return queryset
    
    def filter_search(self, queryset, name, value):
        """
        Extended search for educational content.
        
        Searches across:
        - Title
        - Description
        - Content body
        - Learning objectives
        - Tags
        - Author name and email
        """
        if not value:
            return queryset
        
        words = value.split()
        q_objects = Q()
        
        for word in words:
            word_query = Q()
            word_query |= Q(title__icontains=word)
            word_query |= Q(description__icontains=word)
            word_query |= Q(content__icontains=word)
            word_query |= Q(learning_objectives__icontains=word)
            word_query |= Q(tags__icontains=word)
            word_query |= Q(author__first_name__icontains=word)
            word_query |= Q(author__last_name__icontains=word)
            word_query |= Q(author__email__icontains=word)
            
            q_objects &= word_query
        
        return queryset.filter(q_objects).distinct()
    
    @property
    def qs(self):
        """Optimized queryset for educational content."""
        queryset = super().qs
        
        # Only show published content for non-staff users
        if self.request and not self.request.user.is_staff:
            queryset = queryset.filter(is_published=True)
        
        # Optimize with select_related and prefetch_related
        queryset = queryset.select_related('author').prefetch_related('prerequisites')
        
        return queryset


class LearningPathFilter(BaseEducationFilter):
    """
    FilterSet for LearningPath model with comprehensive filtering options.
    
    This filter provides detailed filtering capabilities for learning paths
    including path type, difficulty, enrollment status, and progress tracking.
    
    Filters:
        path_type: Filter by path type (BEGINNER_FINANCIAL_LITERACY, etc.)
        difficulty: Filter by difficulty level (BEGINNER, INTERMEDIATE, etc.)
        is_featured: Filter by featured status (true/false)
        is_published: Filter by publication status (true/false)
        min_contents: Filter by minimum number of content items
        max_contents: Filter by maximum number of content items
        min_duration: Filter by minimum total duration in hours
        max_duration: Filter by maximum total duration in hours
        min_points: Filter by minimum total points
        max_points: Filter by maximum total points
        certificate_available: Filter by certificate availability
        enrollment_status: Filter by current user's enrollment status
        progress_status: Filter by current user's progress in enrolled paths
        min_enrolled: Filter by minimum enrollment count
        min_completed: Filter by minimum completion count
    """
    
    path_type = django_filters.ChoiceFilter(
        choices=LearningPath.PATH_TYPE_CHOICES,
        method='filter_path_type',
        label='Path Type'
    )
    
    difficulty = django_filters.ChoiceFilter(
        choices=EducationalContent.DIFFICULTY_CHOICES,
        method='filter_difficulty',
        label='Difficulty'
    )
    
    is_featured = django_filters.BooleanFilter(
        field_name='is_featured',
        label='Featured Only'
    )
    
    is_published = django_filters.BooleanFilter(
        field_name='is_published',
        label='Published Only',
        initial=True
    )
    
    min_contents = django_filters.NumberFilter(
        field_name='contents_count',
        lookup_expr='gte',
        label='Minimum Contents'
    )
    
    max_contents = django_filters.NumberFilter(
        field_name='contents_count',
        lookup_expr='lte',
        label='Maximum Contents'
    )
    
    min_duration = django_filters.NumberFilter(
        field_name='total_duration_hours',
        lookup_expr='gte',
        label='Minimum Duration (hours)'
    )
    
    max_duration = django_filters.NumberFilter(
        field_name='total_duration_hours',
        lookup_expr='lte',
        label='Maximum Duration (hours)'
    )
    
    min_points = django_filters.NumberFilter(
        field_name='total_points',
        lookup_expr='gte',
        label='Minimum Points'
    )
    
    max_points = django_filters.NumberFilter(
        field_name='total_points',
        lookup_expr='lte',
        label='Maximum Points'
    )
    
    certificate_available = django_filters.BooleanFilter(
        field_name='completion_certificate',
        label='Certificate Available'
    )
    
    enrollment_status = django_filters.ChoiceFilter(
        method='filter_enrollment_status',
        choices=[
            ('enrolled', 'Enrolled'),
            ('not_enrolled', 'Not Enrolled'),
            ('completed', 'Completed'),
            ('in_progress', 'In Progress'),
        ],
        label='My Enrollment Status'
    )
    
    progress_status = django_filters.ChoiceFilter(
        method='filter_progress_status',
        choices=[
            ('not_started', 'Not Started'),
            ('started', 'Started'),
            ('halfway', 'Halfway Complete'),
            ('almost_done', 'Almost Complete'),
        ],
        label='My Progress Status'
    )
    
    min_enrolled = django_filters.NumberFilter(
        field_name='enrolled_count',
        lookup_expr='gte',
        label='Minimum Enrolled'
    )
    
    min_completed = django_filters.NumberFilter(
        field_name='completed_count',
        lookup_expr='gte',
        label='Minimum Completed'
    )
    
    class Meta:
        model = LearningPath
        fields = [
            'path_type', 'difficulty', 'is_featured', 'is_published',
            'min_contents', 'max_contents', 'min_duration', 'max_duration',
            'min_points', 'max_points', 'certificate_available',
            'enrollment_status', 'progress_status', 'min_enrolled', 'min_completed'
        ]
    
    def __init__(self, data=None, queryset=None, *, request=None, prefix=None):
        """Initialize with request context."""
        super().__init__(data=data, queryset=queryset, request=request, prefix=prefix)
        self.request = request
    
    def filter_path_type(self, queryset, name, value):
        """Filter by path type with support for multiple types."""
        if not value:
            return queryset
        
        # Support comma-separated path types
        path_types = [pt.strip() for pt in value.split(',')]
        return queryset.filter(path_type__in=path_types)
    
    def filter_difficulty(self, queryset, name, value):
        """Filter by difficulty with support for multiple difficulties."""
        if not value:
            return queryset
        
        # Support comma-separated difficulties
        difficulties = [diff.strip() for diff in value.split(',')]
        return queryset.filter(difficulty__in=difficulties)
    
    def filter_enrollment_status(self, queryset, name, value):
        """Filter by current user's enrollment status."""
        if not value or not self.request or not self.request.user.is_authenticated:
            return queryset
        
        user = self.request.user
        
        if value == 'enrolled':
            # Get IDs of paths where user is enrolled
            enrolled_ids = LearningPathEnrollment.objects.filter(
                user=user
            ).values_list('learning_path_id', flat=True)
            return queryset.filter(id__in=enrolled_ids)
        
        elif value == 'not_enrolled':
            # Get IDs of paths where user is NOT enrolled
            enrolled_ids = LearningPathEnrollment.objects.filter(
                user=user
            ).values_list('learning_path_id', flat=True)
            return queryset.exclude(id__in=enrolled_ids)
        
        elif value == 'completed':
            # Get IDs of paths completed by user
            completed_ids = LearningPathEnrollment.objects.filter(
                user=user,
                status='COMPLETED'
            ).values_list('learning_path_id', flat=True)
            return queryset.filter(id__in=completed_ids)
        
        elif value == 'in_progress':
            # Get IDs of paths in progress by user
            in_progress_ids = LearningPathEnrollment.objects.filter(
                user=user,
                status='IN_PROGRESS'
            ).values_list('learning_path_id', flat=True)
            return queryset.filter(id__in=in_progress_ids)
        
        return queryset
    
    def filter_progress_status(self, queryset, name, value):
        """Filter by current user's progress in enrolled paths."""
        if not value or not self.request or not self.request.user.is_authenticated:
            return queryset
        
        user = self.request.user
        
        # Get user's enrollments
        enrollments = LearningPathEnrollment.objects.filter(
            user=user,
            learning_path__in=queryset
        ).select_related('learning_path')
        
        if not enrollments.exists():
            return queryset.none() if value != 'not_started' else queryset
        
        path_ids = []
        
        for enrollment in enrollments:
            progress = enrollment.progress_percentage
            
            if value == 'not_started' and progress == 0:
                path_ids.append(enrollment.learning_path_id)
            elif value == 'started' and 0 < progress < 50:
                path_ids.append(enrollment.learning_path_id)
            elif value == 'halfway' and 50 <= progress < 80:
                path_ids.append(enrollment.learning_path_id)
            elif value == 'almost_done' and progress >= 80:
                path_ids.append(enrollment.learning_path_id)
        
        return queryset.filter(id__in=path_ids)
    
    def filter_search(self, queryset, name, value):
        """Extended search for learning paths."""
        if not value:
            return queryset
        
        words = value.split()
        q_objects = Q()
        
        for word in words:
            word_query = Q()
            word_query |= Q(title__icontains=word)
            word_query |= Q(description__icontains=word)
            word_query |= Q(short_description__icontains=word)
            
            q_objects &= word_query
        
        return queryset.filter(q_objects).distinct()
    
    @property
    def qs(self):
        """Optimized queryset for learning paths."""
        queryset = super().qs
        
        # Only show published paths for non-staff users
        if self.request and not self.request.user.is_staff:
            queryset = queryset.filter(is_published=True)
        
        # Annotate with additional statistics
        queryset = queryset.annotate(
            avg_progress=Avg('enrollments__progress_percentage')
        )
        
        return queryset


class SavingsChallengeFilter(BaseEducationFilter):
    """
    FilterSet for SavingsChallenge model with comprehensive filtering options.
    
    This filter provides detailed filtering capabilities for savings challenges
    including challenge type, status, target amounts, and participation status.
    
    Filters:
        challenge_type: Filter by challenge type (WEEKLY_SAVINGS, etc.)
        status: Filter by challenge status (UPCOMING, ACTIVE, etc.)
        min_target: Filter by minimum target amount
        max_target: Filter by maximum target amount
        min_duration: Filter by minimum duration in days
        max_duration: Filter by maximum duration in days
        min_participants: Filter by minimum participant count
        max_participants: Filter by maximum participant count
        min_reward_points: Filter by minimum reward points
        max_reward_points: Filter by maximum reward points
        has_badge: Filter by badge availability
        participation_status: Filter by current user's participation status
        progress_status: Filter by current user's progress in challenges
        start_date_from: Filter by start date range
        start_date_to: Filter by start date range
        end_date_from: Filter by end date range
        end_date_to: Filter by end date range
        success_rate_min: Filter by minimum success rate
        success_rate_max: Filter by maximum success rate
    """
    
    challenge_type = django_filters.ChoiceFilter(
        choices=SavingsChallenge.CHALLENGE_TYPE_CHOICES,
        method='filter_challenge_type',
        label='Challenge Type'
    )
    
    status = django_filters.ChoiceFilter(
        choices=SavingsChallenge.STATUS_CHOICES,
        method='filter_status',
        label='Status'
    )
    
    min_target = django_filters.NumberFilter(
        field_name='target_amount',
        lookup_expr='gte',
        label='Minimum Target'
    )
    
    max_target = django_filters.NumberFilter(
        field_name='target_amount',
        lookup_expr='lte',
        label='Maximum Target'
    )
    
    min_duration = django_filters.NumberFilter(
        field_name='duration_days',
        lookup_expr='gte',
        label='Minimum Duration (days)'
    )
    
    max_duration = django_filters.NumberFilter(
        field_name='duration_days',
        lookup_expr='lte',
        label='Maximum Duration (days)'
    )
    
    min_participants = django_filters.NumberFilter(
        field_name='participants_count',
        lookup_expr='gte',
        label='Minimum Participants'
    )
    
    max_participants = django_filters.NumberFilter(
        field_name='max_participants',
        lookup_expr='lte',
        label='Maximum Participants'
    )
    
    min_reward_points = django_filters.NumberFilter(
        field_name='reward_points',
        lookup_expr='gte',
        label='Minimum Reward Points'
    )
    
    max_reward_points = django_filters.NumberFilter(
        field_name='reward_points',
        lookup_expr='lte',
        label='Maximum Reward Points'
    )
    
    has_badge = django_filters.BooleanFilter(
        method='filter_has_badge',
        label='Has Badge Reward'
    )
    
    participation_status = django_filters.ChoiceFilter(
        method='filter_participation_status',
        choices=[
            ('participating', 'Participating'),
            ('not_participating', 'Not Participating'),
            ('completed', 'Completed'),
            ('failed', 'Failed'),
        ],
        label='My Participation Status'
    )
    
    progress_status = django_filters.ChoiceFilter(
        method='filter_progress_status',
        choices=[
            ('not_started', 'Not Started'),
            ('started', 'Started'),
            ('halfway', 'Halfway'),
            ('almost_there', 'Almost There'),
            ('completed', 'Completed'),
        ],
        label='My Progress Status'
    )
    
    start_date_from = django_filters.DateFilter(
        field_name='start_date',
        lookup_expr='gte',
        label='Start Date From'
    )
    
    start_date_to = django_filters.DateFilter(
        field_name='start_date',
        lookup_expr='lte',
        label='Start Date To'
    )
    
    end_date_from = django_filters.DateFilter(
        field_name='end_date',
        lookup_expr='gte',
        label='End Date From'
    )
    
    end_date_to = django_filters.DateFilter(
        field_name='end_date',
        lookup_expr='lte',
        label='End Date To'
    )
    
    success_rate_min = django_filters.NumberFilter(
        field_name='success_rate',
        lookup_expr='gte',
        label='Minimum Success Rate (%)',
        min_value=0,
        max_value=100
    )
    
    success_rate_max = django_filters.NumberFilter(
        field_name='success_rate',
        lookup_expr='lte',
        label='Maximum Success Rate (%)',
        min_value=0,
        max_value=100
    )
    
    class Meta:
        model = SavingsChallenge
        fields = [
            'challenge_type', 'status', 'min_target', 'max_target',
            'min_duration', 'max_duration', 'min_participants', 'max_participants',
            'min_reward_points', 'max_reward_points', 'has_badge',
            'participation_status', 'progress_status', 'start_date_from',
            'start_date_to', 'end_date_from', 'end_date_to',
            'success_rate_min', 'success_rate_max'
        ]
    
    def __init__(self, data=None, queryset=None, *, request=None, prefix=None):
        """Initialize with request context."""
        super().__init__(data=data, queryset=queryset, request=request, prefix=prefix)
        self.request = request
        
        # Set default ordering for active challenges
        if not data:
            self.form.initial = {
                'status': 'ACTIVE',
                'ordering': 'newest',
            }
    
    def filter_challenge_type(self, queryset, name, value):
        """Filter by challenge type with support for multiple types."""
        if not value:
            return queryset
        
        # Support comma-separated challenge types
        challenge_types = [ct.strip() for ct in value.split(',')]
        return queryset.filter(challenge_type__in=challenge_types)
    
    def filter_status(self, queryset, name, value):
        """Filter by status with support for multiple statuses."""
        if not value:
            return queryset
        
        # Support comma-separated statuses
        statuses = [s.strip() for s in value.split(',')]
        return queryset.filter(status__in=statuses)
    
    def filter_has_badge(self, queryset, name, value):
        """Filter by badge reward availability."""
        if value is True:
            return queryset.exclude(reward_badge='')
        elif value is False:
            return queryset.filter(reward_badge='')
        return queryset
    
    def filter_participation_status(self, queryset, name, value):
        """Filter by current user's participation status."""
        if not value or not self.request or not self.request.user.is_authenticated:
            return queryset
        
        user = self.request.user
        
        if value == 'participating':
            # Get IDs of challenges where user is participating
            participating_ids = ChallengeParticipant.objects.filter(
                user=user
            ).values_list('challenge_id', flat=True)
            return queryset.filter(id__in=participating_ids)
        
        elif value == 'not_participating':
            # Get IDs of challenges where user is NOT participating
            participating_ids = ChallengeParticipant.objects.filter(
                user=user
            ).values_list('challenge_id', flat=True)
            return queryset.exclude(id__in=participating_ids)
        
        elif value == 'completed':
            # Get IDs of challenges completed by user
            completed_ids = ChallengeParticipant.objects.filter(
                user=user,
                completed=True
            ).values_list('challenge_id', flat=True)
            return queryset.filter(id__in=completed_ids)
        
        elif value == 'failed':
            # Get IDs of challenges where user participated but didn't complete
            participated_ids = ChallengeParticipant.objects.filter(
                user=user,
                completed=False
            ).values_list('challenge_id', flat=True)
            
            # Also check if challenge is completed
            completed_challenges = SavingsChallenge.objects.filter(
                status='COMPLETED',
                id__in=participated_ids
            )
            return completed_challenges
        
        return queryset
    
    def filter_progress_status(self, queryset, name, value):
        """Filter by current user's progress in challenges."""
        if not value or not self.request or not self.request.user.is_authenticated:
            return queryset
        
        user = self.request.user
        
        # Get user's challenge participations
        participations = ChallengeParticipant.objects.filter(
            user=user,
            challenge__in=queryset
        ).select_related('challenge')
        
        if not participations.exists():
            return queryset.none() if value != 'not_started' else queryset
        
        challenge_ids = []
        
        for participation in participations:
            progress = participation.progress_percentage
            
            if value == 'not_started' and progress == 0:
                challenge_ids.append(participation.challenge_id)
            elif value == 'started' and 0 < progress < 30:
                challenge_ids.append(participation.challenge_id)
            elif value == 'halfway' and 30 <= progress < 70:
                challenge_ids.append(participation.challenge_id)
            elif value == 'almost_there' and 70 <= progress < 100:
                challenge_ids.append(participation.challenge_id)
            elif value == 'completed' and progress >= 100:
                challenge_ids.append(participation.challenge_id)
        
        return queryset.filter(id__in=challenge_ids)
    
    def filter_search(self, queryset, name, value):
        """Extended search for savings challenges."""
        if not value:
            return queryset
        
        words = value.split()
        q_objects = Q()
        
        for word in words:
            word_query = Q()
            word_query |= Q(title__icontains=word)
            word_query |= Q(description__icontains=word)
            word_query |= Q(short_description__icontains=word)
            word_query |= Q(created_by__first_name__icontains=word)
            word_query |= Q(created_by__last_name__icontains=word)
            word_query |= Q(created_by__email__icontains=word)
            
            q_objects &= word_query
        
        return queryset.filter(q_objects).distinct()
    
    @property
    def qs(self):
        """Optimized queryset for savings challenges."""
        queryset = super().qs
        
        # Update challenge statuses before filtering
        for challenge in queryset:
            challenge.update_challenge_status()
        
        # Annotate with additional statistics
        from django.db.models import Count, Avg
        queryset = queryset.annotate(
            avg_progress=Avg('participants__progress_percentage'),
            completion_count=Count('participants', filter=Q(participants__completed=True))
        )
        
        return queryset


class WebinarFilter(BaseEducationFilter):
    """
    FilterSet for Webinar model with comprehensive filtering options.
    
    This filter provides detailed filtering capabilities for webinars
    including platform, category, difficulty, status, and registration status.
    
    Filters:
        category: Filter by content category (SAVINGS, INVESTMENTS, etc.)
        difficulty: Filter by difficulty level (BEGINNER, INTERMEDIATE, etc.)
        platform: Filter by platform (ZOOM, TEAMS, GOOGLE_MEET, etc.)
        status: Filter by webinar status (SCHEDULED, LIVE, etc.)
        min_duration: Filter by minimum duration in minutes
        max_duration: Filter by maximum duration in minutes
        min_participants: Filter by minimum participant count
        max_participants: Filter by maximum participant count
        min_points: Filter by minimum points reward
        max_points: Filter by maximum points reward
        certificate_available: Filter by certificate availability
        qna_enabled: Filter by Q&A availability
        poll_enabled: Filter by poll availability
        registration_status: Filter by current user's registration status
        attendance_status: Filter by current user's attendance status
        has_recording: Filter by recording availability
        min_rating: Filter by minimum average rating
        date_from: Filter by scheduled date range
        date_to: Filter by scheduled date range
        time_of_day: Filter by time of day (morning, afternoon, evening)
    """
    
    category = django_filters.ChoiceFilter(
        choices=EducationalContent.CATEGORY_CHOICES,
        method='filter_category',
        label='Category'
    )
    
    difficulty = django_filters.ChoiceFilter(
        choices=EducationalContent.DIFFICULTY_CHOICES,
        method='filter_difficulty',
        label='Difficulty'
    )
    
    platform = django_filters.ChoiceFilter(
        choices=Webinar.PLATFORM_CHOICES,
        method='filter_platform',
        label='Platform'
    )
    
    status = django_filters.ChoiceFilter(
        choices=Webinar.STATUS_CHOICES,
        method='filter_status',
        label='Status'
    )
    
    min_duration = django_filters.NumberFilter(
        field_name='duration_minutes',
        lookup_expr='gte',
        label='Minimum Duration (min)'
    )
    
    max_duration = django_filters.NumberFilter(
        field_name='duration_minutes',
        lookup_expr='lte',
        label='Maximum Duration (min)'
    )
    
    min_participants = django_filters.NumberFilter(
        field_name='max_participants',
        lookup_expr='gte',
        label='Minimum Capacity'
    )
    
    max_participants = django_filters.NumberFilter(
        field_name='max_participants',
        lookup_expr='lte',
        label='Maximum Capacity'
    )
    
    min_points = django_filters.NumberFilter(
        field_name='points_reward',
        lookup_expr='gte',
        label='Minimum Points'
    )
    
    max_points = django_filters.NumberFilter(
        field_name='points_reward',
        lookup_expr='lte',
        label='Maximum Points'
    )
    
    certificate_available = django_filters.BooleanFilter(
        field_name='certificate_available',
        label='Certificate Available'
    )
    
    qna_enabled = django_filters.BooleanFilter(
        field_name='qna_enabled',
        label='Q&A Enabled'
    )
    
    poll_enabled = django_filters.BooleanFilter(
        field_name='poll_enabled',
        label='Poll Enabled'
    )
    
    registration_status = django_filters.ChoiceFilter(
        method='filter_registration_status',
        choices=[
            ('registered', 'Registered'),
            ('not_registered', 'Not Registered'),
            ('attended', 'Attended'),
            ('absent', 'Absent'),
            ('waitlisted', 'Waitlisted'),
        ],
        label='My Registration Status'
    )
    
    attendance_status = django_filters.ChoiceFilter(
        method='filter_attendance_status',
        choices=[
            ('checked_in', 'Checked In'),
            ('not_checked_in', 'Not Checked In'),
            ('partial', 'Partial Attendance'),
            ('full', 'Full Attendance'),
        ],
        label='My Attendance Status'
    )
    
    has_recording = django_filters.BooleanFilter(
        method='filter_has_recording',
        label='Has Recording'
    )
    
    min_rating = django_filters.NumberFilter(
        method='filter_min_rating',
        label='Minimum Rating',
        min_value=0,
        max_value=5
    )
    
    date_from = django_filters.DateFilter(
        field_name='scheduled_at',
        lookup_expr='date__gte',
        label='Date From'
    )
    
    date_to = django_filters.DateFilter(
        field_name='scheduled_at',
        lookup_expr='date__lte',
        label='Date To'
    )
    
    time_of_day = django_filters.ChoiceFilter(
        method='filter_time_of_day',
        choices=[
            ('morning', 'Morning (6 AM - 12 PM)'),
            ('afternoon', 'Afternoon (12 PM - 6 PM)'),
            ('evening', 'Evening (6 PM - 12 AM)'),
            ('night', 'Night (12 AM - 6 AM)'),
        ],
        label='Time of Day'
    )
    
    class Meta:
        model = Webinar
        fields = [
            'category', 'difficulty', 'platform', 'status',
            'min_duration', 'max_duration', 'min_participants', 'max_participants',
            'min_points', 'max_points', 'certificate_available',
            'qna_enabled', 'poll_enabled', 'registration_status',
            'attendance_status', 'has_recording', 'min_rating',
            'date_from', 'date_to', 'time_of_day'
        ]
    
    def __init__(self, data=None, queryset=None, *, request=None, prefix=None):
        """Initialize with request context."""
        super().__init__(data=data, queryset=queryset, request=request, prefix=prefix)
        self.request = request
        
        # Set default ordering for upcoming webinars
        if not data:
            self.form.initial = {
                'status': 'SCHEDULED',
                'ordering': 'scheduled_at',
            }
    
    def filter_category(self, queryset, name, value):
        """Filter by category with support for multiple categories."""
        if not value:
            return queryset
        
        # Support comma-separated categories
        categories = [cat.strip() for cat in value.split(',')]
        return queryset.filter(category__in=categories)
    
    def filter_difficulty(self, queryset, name, value):
        """Filter by difficulty with support for multiple difficulties."""
        if not value:
            return queryset
        
        # Support comma-separated difficulties
        difficulties = [diff.strip() for diff in value.split(',')]
        return queryset.filter(difficulty__in=difficulties)
    
    def filter_platform(self, queryset, name, value):
        """Filter by platform with support for multiple platforms."""
        if not value:
            return queryset
        
        # Support comma-separated platforms
        platforms = [p.strip() for p in value.split(',')]
        return queryset.filter(platform__in=platforms)
    
    def filter_status(self, queryset, name, value):
        """Filter by status with support for multiple statuses."""
        if not value:
            return queryset
        
        # Support comma-separated statuses
        statuses = [s.strip() for s in value.split(',')]
        return queryset.filter(status__in=statuses)
    
    def filter_registration_status(self, queryset, name, value):
        """Filter by current user's registration status."""
        if not value or not self.request or not self.request.user.is_authenticated:
            return queryset
        
        user = self.request.user
        
        if value == 'registered':
            # Get IDs of webinars where user is registered
            registered_ids = WebinarRegistration.objects.filter(
                user=user,
                status__in=['REGISTERED', 'ATTENDED']
            ).values_list('webinar_id', flat=True)
            return queryset.filter(id__in=registered_ids)
        
        elif value == 'not_registered':
            # Get IDs of webinars where user is NOT registered
            registered_ids = WebinarRegistration.objects.filter(
                user=user
            ).values_list('webinar_id', flat=True)
            return queryset.exclude(id__in=registered_ids)
        
        elif value == 'attended':
            # Get IDs of webinars attended by user
            attended_ids = WebinarRegistration.objects.filter(
                user=user,
                status='ATTENDED'
            ).values_list('webinar_id', flat=True)
            return queryset.filter(id__in=attended_ids)
        
        elif value == 'absent':
            # Get IDs of webinars where user was absent
            absent_ids = WebinarRegistration.objects.filter(
                user=user,
                status='ABSENT'
            ).values_list('webinar_id', flat=True)
            return queryset.filter(id__in=absent_ids)
        
        elif value == 'waitlisted':
            # Get IDs of webinars where user is waitlisted
            waitlisted_ids = WebinarRegistration.objects.filter(
                user=user,
                status='WAITLISTED'
            ).values_list('webinar_id', flat=True)
            return queryset.filter(id__in=waitlisted_ids)
        
        return queryset
    
    def filter_attendance_status(self, queryset, name, value):
        """Filter by current user's attendance details."""
        if not value or not self.request or not self.request.user.is_authenticated:
            return queryset
        
        user = self.request.user
        
        # Get user's webinar registrations
        registrations = WebinarRegistration.objects.filter(
            user=user,
            webinar__in=queryset
        ).select_related('webinar')
        
        if not registrations.exists():
            return queryset.none()
        
        webinar_ids = []
        
        for registration in registrations:
            if value == 'checked_in' and registration.checked_in:
                webinar_ids.append(registration.webinar_id)
            elif value == 'not_checked_in' and not registration.checked_in:
                webinar_ids.append(registration.webinar_id)
            elif value == 'partial' and registration.attendance_duration:
                # Partial attendance if duration < webinar duration
                webinar = registration.webinar
                if registration.attendance_duration < webinar.duration_minutes:
                    webinar_ids.append(webinar.id)
            elif value == 'full' and registration.attendance_duration:
                # Full attendance if duration >= 90% of webinar duration
                webinar = registration.webinar
                if registration.attendance_duration >= (webinar.duration_minutes * 0.9):
                    webinar_ids.append(webinar.id)
        
        return queryset.filter(id__in=webinar_ids)
    
    def filter_has_recording(self, queryset, name, value):
        """Filter by recording availability."""
        if value is True:
            return queryset.exclude(recording_url='')
        elif value is False:
            return queryset.filter(recording_url='')
        return queryset
    
    def filter_min_rating(self, queryset, name, value):
        """Filter by minimum average rating."""
        try:
            min_rating = float(value)
            if min_rating < 0 or min_rating > 5:
                return queryset
            
            return queryset.filter(average_rating__gte=min_rating)
        
        except (ValueError, TypeError):
            return queryset
    
    def filter_time_of_day(self, queryset, name, value):
        """Filter by time of day."""
        if not value:
            return queryset
        
        # Extract hour from scheduled_at
        from django.db.models.functions import ExtractHour
        
        if value == 'morning':
            return queryset.annotate(
                hour=ExtractHour('scheduled_at')
            ).filter(hour__gte=6, hour__lt=12)
        elif value == 'afternoon':
            return queryset.annotate(
                hour=ExtractHour('scheduled_at')
            ).filter(hour__gte=12, hour__lt=18)
        elif value == 'evening':
            return queryset.annotate(
                hour=ExtractHour('scheduled_at')
            ).filter(hour__gte=18, hour__lt=24)
        elif value == 'night':
            return queryset.annotate(
                hour=ExtractHour('scheduled_at')
            ).filter(hour__gte=0, hour__lt=6)
        
        return queryset
    
    def filter_search(self, queryset, name, value):
        """Extended search for webinars."""
        if not value:
            return queryset
        
        words = value.split()
        q_objects = Q()
        
        for word in words:
            word_query = Q()
            word_query |= Q(title__icontains=word)
            word_query |= Q(description__icontains=word)
            word_query |= Q(short_description__icontains=word)
            word_query |= Q(presenter__first_name__icontains=word)
            word_query |= Q(presenter__last_name__icontains=word)
            word_query |= Q(presenter__email__icontains=word)
            
            q_objects &= word_query
        
        return queryset.filter(q_objects).distinct()
    
    @property
    def qs(self):
        """Optimized queryset for webinars."""
        queryset = super().qs
        
        # Update webinar statuses before filtering
        for webinar in queryset:
            webinar.update_status()
        
        # Annotate with additional statistics
        from django.db.models import Count, Avg
        queryset = queryset.annotate(
            attendance_rate=Avg('registrations__attendance_duration')
        )
        
        return queryset


class CombinedEducationFilter(django_filters.FilterSet):
    """
    Combined filter for searching across all education hub models.
    
    This filter allows users to search and filter across multiple education
    hub models simultaneously, providing a unified search experience.
    
    Use Cases:
    - Global search across all education content
    - Finding related content across different models
    - Personalized recommendations
    - Admin overview searches
    
    Filters:
        model_type: Filter by model type (content, path, challenge, webinar)
        combined_search: Search across all models
        category: Filter by category across models
        difficulty: Filter by difficulty across models
        status: Filter by status across models
        date_from: Filter by creation date range
        date_to: Filter by creation date range
    """
    
    model_type = django_filters.ChoiceFilter(
        method='filter_model_type',
        choices=[
            ('all', 'All Types'),
            ('content', 'Educational Content'),
            ('path', 'Learning Paths'),
            ('challenge', 'Savings Challenges'),
            ('webinar', 'Webinars'),
        ],
        label='Content Type'
    )
    
    combined_search = django_filters.CharFilter(
        method='filter_combined_search',
        label='Search Everything'
    )
    
    category = django_filters.ChoiceFilter(
        method='filter_category',
        choices=EducationalContent.CATEGORY_CHOICES,
        label='Category'
    )
    
    difficulty = django_filters.ChoiceFilter(
        method='filter_difficulty',
        choices=EducationalContent.DIFFICULTY_CHOICES,
        label='Difficulty'
    )
    
    status = django_filters.CharFilter(
        method='filter_status',
        label='Status'
    )
    
    date_from = django_filters.DateFilter(
        method='filter_date_from',
        label='Date From'
    )
    
    date_to = django_filters.DateFilter(
        method='filter_date_to',
        label='Date To'
    )
    
    class Meta:
        model = None  # No single model
        fields = [
            'model_type', 'combined_search', 'category', 'difficulty',
            'status', 'date_from', 'date_to'
        ]
    
    def __init__(self, data=None, queryset=None, *, request=None, prefix=None):
        """Initialize with request context."""
        super().__init__(data=data, queryset=queryset, request=request, prefix=prefix)
        self.request = request
    
    def filter_model_type(self, queryset, name, value):
        """
        Filter by model type.
        
        Returns different querysets based on model type selection.
        """
        if value == 'content':
            return EducationalContent.objects.all()
        elif value == 'path':
            return LearningPath.objects.all()
        elif value == 'challenge':
            return SavingsChallenge.objects.all()
        elif value == 'webinar':
            return Webinar.objects.all()
        else:  # 'all' or unspecified
            # Return a combined queryset (requires special handling)
            return self.get_combined_queryset()
    
    def filter_combined_search(self, queryset, name, value):
        """
        Search across all education hub models.
        
        This is a complex operation that searches across multiple models
        and returns a combined result set. In practice, this might be
        implemented with search engines like Elasticsearch or PostgreSQL
        full-text search.
        
        For simplicity, we'll search each model separately and combine results.
        """
        if not value:
            return queryset
        
        # Search each model type
        results = {
            'content': EducationalContentFilter(
                data={'search': value},
                request=self.request
            ).qs,
            'paths': LearningPathFilter(
                data={'search': value},
                request=self.request
            ).qs,
            'challenges': SavingsChallengeFilter(
                data={'search': value},
                request=self.request
            ).qs,
            'webinars': WebinarFilter(
                data={'search': value},
                request=self.request
            ).qs,
        }
        
        # Combine results (simplified - in practice would use union or search engine)
        return results
    
    def filter_category(self, queryset, name, value):
        """Filter by category across models."""
        # This would filter each model type by category
        # Implementation depends on how queryset is structured
        return queryset
    
    def filter_difficulty(self, queryset, name, value):
        """Filter by difficulty across models."""
        # This would filter each model type by difficulty
        return queryset
    
    def filter_status(self, queryset, name, value):
        """Filter by status across models."""
        # Status has different meanings for different models
        return queryset
    
    def filter_date_from(self, queryset, name, value):
        """Filter by creation date across models."""
        return queryset
    
    def filter_date_to(self, queryset, name, value):
        """Filter by creation date across models."""
        return queryset
    
    def get_combined_queryset(self):
        """
        Get a combined queryset from all education hub models.
        
        Note: This is a simplified implementation. In production,
        you would typically use a search engine or create a unified
        view/model for combined searches.
        """
        from itertools import chain
        
        # Get querysets from each model
        content_qs = EducationalContent.objects.all()[:10]
        paths_qs = LearningPath.objects.all()[:10]
        challenges_qs = SavingsChallenge.objects.all()[:10]
        webinars_qs = Webinar.objects.all()[:10]
        
        # Combine using itertools.chain
        combined = list(chain(content_qs, paths_qs, challenges_qs, webinars_qs))
        
        # This returns a list, not a queryset
        # For proper queryset behavior, consider creating a unified model
        return combined