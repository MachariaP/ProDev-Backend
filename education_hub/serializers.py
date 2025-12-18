"""
Serializers for Education Hub.

This module defines Django REST Framework serializers for all education hub models.
It includes serializers for data validation, transformation, and representation
in API responses, with support for nested relationships and custom field methods.

The serializers are designed to be:
- Efficient: Minimize database queries with select_related and prefetch_related
- Secure: Validate and sanitize all input data
- Flexible: Support different representations for different contexts
- Consistent: Uniform field naming and structure
- Extensible: Easy to add custom fields and methods

Key Serializers:
- EducationalContentSerializer: For educational content with progress tracking
- LearningPathSerializer: For learning paths with enrollment status
- WebinarSerializer: For webinars with registration status
- CertificateSerializer: For certificates with verification
- Dashboard serializers: For analytics and statistics

Additional Features:
- Dynamic field selection based on context
- Nested serialization for related objects
- Custom validation methods
- Progress calculation and statistics
- User-specific data (bookmarks, progress, achievements)
- Pagination support for list views
- Search and filtering integration
"""

from rest_framework import serializers
from rest_framework.validators import UniqueValidator, UniqueTogetherValidator
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.db.models import Count, Sum, Avg, Q, F
from django.core.exceptions import ValidationError
from datetime import timedelta
import json

from .models import (
    EducationalContent, UserProgress, LearningPath, LearningPathContent,
    LearningPathEnrollment, ContentCompletion, Certificate, SavingsChallenge,
    ChallengeParticipant, Webinar, WebinarRegistration, WebinarQnA,
    WebinarPoll, WebinarPollResponse, Achievement, UserAchievement
)


User = get_user_model()


class DynamicFieldsModelSerializer(serializers.ModelSerializer):
    """
    A ModelSerializer that takes an additional `fields` argument that
    controls which fields should be displayed.
    
    Usage:
        serializer = MySerializer(instance, fields=('id', 'name'))
    
    This allows for efficient API responses by only including needed fields.
    """
    
    def __init__(self, *args, **kwargs):
        """
        Initialize serializer with dynamic field selection.
        
        Args:
            fields: List of fields to include (optional)
            exclude: List of fields to exclude (optional)
        """
        # Don't pass the 'fields' arg up to the superclass
        fields = kwargs.pop('fields', None)
        exclude = kwargs.pop('exclude', None)
        
        # Instantiate the superclass normally
        super().__init__(*args, **kwargs)
        
        if fields is not None:
            # Drop any fields that are not specified in the `fields` argument
            allowed = set(fields)
            existing = set(self.fields)
            for field_name in existing - allowed:
                self.fields.pop(field_name)
        
        if exclude is not None:
            # Drop any fields that are specified in the `exclude` argument
            excluded = set(exclude)
            for field_name in excluded:
                self.fields.pop(field_name, None)


class TimestampSerializerMixin:
    """
    Mixin to add standardized timestamp fields to serializers.
    
    Provides:
    - created_at: Creation timestamp
    - updated_at: Last update timestamp
    - human_readable_timestamps: Formatted timestamps for display
    """
    
    created_at = serializers.DateTimeField(read_only=True, format='%Y-%m-%d %H:%M:%S')
    updated_at = serializers.DateTimeField(read_only=True, format='%Y-%m-%d %H:%M:%S')
    
    def get_human_readable_timestamps(self, obj):
        """
        Get human-readable timestamp representations.
        
        Returns:
            dict: Formatted timestamps for display
        """
        from django.utils.timesince import timesince
        
        now = timezone.now()
        
        return {
            'created_at': {
                'iso': obj.created_at.isoformat() if obj.created_at else None,
                'human': timesince(obj.created_at, now) + ' ago' if obj.created_at else None,
                'date': obj.created_at.strftime('%B %d, %Y') if obj.created_at else None,
                'time': obj.created_at.strftime('%I:%M %p') if obj.created_at else None,
            },
            'updated_at': {
                'iso': obj.updated_at.isoformat() if obj.updated_at else None,
                'human': timesince(obj.updated_at, now) + ' ago' if obj.updated_at else None,
                'date': obj.updated_at.strftime('%B %d, %Y') if obj.updated_at else None,
                'time': obj.updated_at.strftime('%I:%M %p') if obj.updated_at else None,
            }
        }


class UserSimpleSerializer(DynamicFieldsModelSerializer):
    """
    Simplified serializer for User model with basic information.
    
    Used for nested representations in education hub serializers.
    Includes only essential user information to minimize response size.
    
    Fields:
        id: User ID
        email: User email address
        first_name: User first name
        last_name: User last name
        full_name: Combined first and last name
        profile_picture: URL to profile picture
        initials: User initials for avatar display
    """
    
    full_name = serializers.SerializerMethodField()
    initials = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'profile_picture', 'full_name', 'initials']
        read_only_fields = ['id', 'email', 'full_name', 'initials']
    
    def get_full_name(self, obj):
        """Get user's full name."""
        return obj.get_full_name() or obj.email
    
    def get_initials(self, obj):
        """Get user initials for avatar display."""
        if obj.first_name and obj.last_name:
            return f"{obj.first_name[0]}{obj.last_name[0]}".upper()
        elif obj.first_name:
            return obj.first_name[0].upper()
        elif obj.last_name:
            return obj.last_name[0].upper()
        elif obj.email:
            return obj.email[0].upper()
        return "??"


# Educational Content Serializers

class EducationalContentBaseSerializer(DynamicFieldsModelSerializer, TimestampSerializerMixin):
    """
    Base serializer for EducationalContent model with common functionality.
    
    Provides:
    - Basic content information
    - Timestamps
    - Validation
    - Field customization
    """
    
    class Meta:
        model = EducationalContent
        fields = [
            'id', 'title', 'slug', 'content_type', 'category', 'difficulty',
            'description', 'thumbnail_url', 'duration_minutes', 'points_reward',
            'certificate_available', 'is_published', 'is_featured',
            'created_at', 'updated_at', 'published_at'
        ]
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at', 'published_at']
        extra_kwargs = {
            'title': {'required': True, 'allow_blank': False},
            'description': {'required': True, 'allow_blank': False},
        }
    
    def validate(self, data):
        """
        Validate educational content data.
        
        Checks:
        - Video content must have video_url
        - Quiz content must have quiz_questions and passing_score
        - Published content must have all required fields
        - Thumbnail URL format if provided
        - Duration must be positive
        - Points reward must be non-negative
        """
        # Call parent validation
        data = super().validate(data)
        
        content_type = data.get('content_type', getattr(self.instance, 'content_type', None))
        
        # Validate video content
        if content_type == 'VIDEO' and not data.get('video_url'):
            raise serializers.ValidationError({
                'video_url': 'Video content must have a video URL.'
            })
        
        # Validate quiz content
        if content_type == 'QUIZ':
            if not data.get('quiz_questions'):
                raise serializers.ValidationError({
                    'quiz_questions': 'Quiz content must have quiz questions.'
                })
            if not data.get('passing_score'):
                raise serializers.ValidationError({
                    'passing_score': 'Quiz content must have a passing score.'
                })
        
        # Validate published content
        if data.get('is_published', False):
            required_fields = ['title', 'description', 'content_type', 'category', 'difficulty']
            missing_fields = []
            
            for field in required_fields:
                if not data.get(field):
                    missing_fields.append(field)
            
            if missing_fields:
                raise serializers.ValidationError({
                    'is_published': f'Cannot publish content without: {", ".join(missing_fields)}'
                })
        
        # Validate thumbnail URL format
        thumbnail_url = data.get('thumbnail_url')
        if thumbnail_url and not (thumbnail_url.startswith('http://') or thumbnail_url.startswith('https://')):
            raise serializers.ValidationError({
                'thumbnail_url': 'Thumbnail URL must be a valid HTTP/HTTPS URL.'
            })
        
        # Validate video URL format
        video_url = data.get('video_url')
        if video_url and not (video_url.startswith('http://') or video_url.startswith('https://')):
            raise serializers.ValidationError({
                'video_url': 'Video URL must be a valid HTTP/HTTPS URL.'
            })
        
        # Validate duration
        duration = data.get('duration_minutes')
        if duration is not None and duration <= 0:
            raise serializers.ValidationError({
                'duration_minutes': 'Duration must be a positive number.'
            })
        
        # Validate points
        points = data.get('points_reward')
        if points is not None and points < 0:
            raise serializers.ValidationError({
                'points_reward': 'Points reward cannot be negative.'
            })
        
        return data
    
    def create(self, validated_data):
        """Create educational content with author auto-assignment."""
        # Auto-set author from request user
        if 'author' not in validated_data and self.context.get('request'):
            validated_data['author'] = self.context['request'].user
        
        return super().create(validated_data)


class EducationalContentSerializer(EducationalContentBaseSerializer):
    """
    Comprehensive serializer for EducationalContent model with related data.
    
    Includes:
    - Author information
    - Prerequisites list
    - User progress and completion status
    - Statistics (views, likes, shares)
    - Related content recommendations
    - Learning objectives and tags
    - Quiz details (if applicable)
    
    This serializer is optimized for content display pages.
    """
    
    author = UserSimpleSerializer(read_only=True)
    prerequisites = serializers.SerializerMethodField()
    is_completed = serializers.SerializerMethodField()
    user_progress = serializers.SerializerMethodField()
    completion_stats = serializers.SerializerMethodField()
    related_content = serializers.SerializerMethodField()
    can_access = serializers.SerializerMethodField()
    access_reason = serializers.SerializerMethodField()
    
    class Meta(EducationalContentBaseSerializer.Meta):
        fields = EducationalContentBaseSerializer.Meta.fields + [
            'author', 'content', 'video_url', 'learning_objectives', 'tags',
            'prerequisites', 'quiz_questions', 'passing_score',
            'views_count', 'likes_count', 'share_count',
            'is_completed', 'user_progress', 'completion_stats',
            'related_content', 'can_access', 'access_reason'
        ]
        read_only_fields = EducationalContentBaseSerializer.Meta.read_only_fields + [
            'author', 'views_count', 'likes_count', 'share_count',
            'is_completed', 'user_progress', 'completion_stats',
            'related_content', 'can_access', 'access_reason'
        ]
    
    def get_prerequisites(self, obj):
        """Get prerequisites as simplified objects."""
        from .serializers import EducationalContentBaseSerializer
        return EducationalContentBaseSerializer(
            obj.prerequisites.all(),
            many=True,
            fields=['id', 'title', 'slug', 'content_type', 'difficulty', 'duration_minutes']
        ).data
    
    def get_is_completed(self, obj):
        """Check if current user has completed this content."""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.user_progress.filter(
                user=request.user,
                status='COMPLETED'
            ).exists()
        return False
    
    def get_user_progress(self, obj):
        """Get current user's progress for this content."""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            try:
                progress = obj.user_progress.get(user=request.user)
                return UserProgressSerializer(progress, context=self.context).data
            except UserProgress.DoesNotExist:
                return None
        return None
    
    def get_completion_stats(self, obj):
        """Get completion statistics for this content."""
        total = obj.user_progress.count()
        completed = obj.user_progress.filter(status='COMPLETED').count()
        in_progress = obj.user_progress.filter(status='IN_PROGRESS').count()
        
        avg_score = obj.user_progress.filter(
            quiz_score__isnull=False
        ).aggregate(avg=Avg('quiz_score'))['avg'] or 0
        
        return {
            'total_users': total,
            'completed': completed,
            'in_progress': in_progress,
            'completion_rate': (completed / total * 100) if total > 0 else 0,
            'average_score': float(avg_score),
            'popularity_rank': obj.views_count,  # Simplified ranking
        }
    
    def get_related_content(self, obj):
        """Get related content based on category and tags."""
        request = self.context.get('request')
        related = obj.get_related_content(limit=5)
        
        return EducationalContentBaseSerializer(
            related,
            many=True,
            context=self.context,
            fields=['id', 'title', 'slug', 'content_type', 'category', 'difficulty', 'thumbnail_url']
        ).data
    
    def get_can_access(self, obj):
        """Check if current user can access this content."""
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return obj.is_published and not obj.prerequisites.exists()
        
        can_access, _ = obj.can_user_access(request.user)
        return can_access
    
    def get_access_reason(self, obj):
        """Get reason if user cannot access content."""
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            if not obj.is_published:
                return "Content is not published"
            if obj.prerequisites.exists():
                return "Prerequisites required"
            return ""
        
        _, reason = obj.can_user_access(request.user)
        return reason
    
    def to_representation(self, instance):
        """Custom representation with conditional field inclusion."""
        representation = super().to_representation(instance)
        
        # Remove sensitive fields for non-authors
        request = self.context.get('request')
        if request and request.user != instance.author and not request.user.is_staff:
            representation.pop('quiz_questions', None)
            representation.pop('quiz_answers', None)
        
        # Include quiz questions only if user has access
        if 'quiz_questions' in representation:
            user_progress = representation.get('user_progress')
            if user_progress and user_progress.get('status') == 'COMPLETED':
                # Don't show quiz questions after completion
                representation.pop('quiz_questions', None)
        
        return representation


class EducationalContentCreateSerializer(EducationalContentBaseSerializer):
    """
    Serializer for creating/updating EducationalContent (write-only fields).
    
    Includes all fields needed for content creation and editing.
    Validates data integrity and business rules.
    
    Differences from display serializer:
    - Includes all fields (including quiz_questions, etc.)
    - No read-only fields
    - More stringent validation
    - Author auto-assignment
    """
    
    class Meta(EducationalContentBaseSerializer.Meta):
        fields = '__all__'
        read_only_fields = [
            'id', 'slug', 'author', 'views_count', 'likes_count', 'share_count',
            'created_at', 'updated_at', 'published_at'
        ]
    
    def validate_title(self, value):
        """Validate title uniqueness and length."""
        # Check uniqueness (case-insensitive, excluding current instance)
        instance = getattr(self, 'instance', None)
        queryset = EducationalContent.objects.filter(title__iexact=value)
        
        if instance:
            queryset = queryset.exclude(pk=instance.pk)
        
        if queryset.exists():
            raise serializers.ValidationError(
                'An educational content with this title already exists.'
            )
        
        # Check length
        if len(value) < 5:
            raise serializers.ValidationError('Title must be at least 5 characters long.')
        if len(value) > 200:
            raise serializers.ValidationError('Title cannot exceed 200 characters.')
        
        return value
    
    def validate_quiz_questions(self, value):
        """Validate quiz questions structure."""
        if not value:
            return value
        
        if not isinstance(value, list):
            raise serializers.ValidationError('Quiz questions must be a list.')
        
        for i, question in enumerate(value):
            if not isinstance(question, dict):
                raise serializers.ValidationError(f'Question {i+1} must be an object.')
            
            required_fields = ['question', 'options', 'correct_answer']
            for field in required_fields:
                if field not in question:
                    raise serializers.ValidationError(
                        f'Question {i+1} missing required field: {field}'
                    )
            
            if not isinstance(question['options'], list) or len(question['options']) < 2:
                raise serializers.ValidationError(
                    f'Question {i+1} must have at least 2 options.'
                )
            
            if question['correct_answer'] not in question['options']:
                raise serializers.ValidationError(
                    f'Question {i+1}: Correct answer must be one of the options.'
                )
        
        return value


class EducationalContentProgressSerializer(DynamicFieldsModelSerializer):
    """
    Serializer for educational content with detailed progress information.
    
    Used for learning path progress tracking and user dashboards.
    Includes progress percentage, time spent, quiz scores, and next steps.
    """
    
    content = EducationalContentBaseSerializer(read_only=True)
    next_content = serializers.SerializerMethodField()
    prerequisites_completed = serializers.SerializerMethodField()
    estimated_time_remaining = serializers.SerializerMethodField()
    
    class Meta:
        model = UserProgress
        fields = [
            'content', 'status', 'progress_percentage', 'started_at', 'completed_at',
            'time_spent_minutes', 'quiz_score', 'bookmarked', 'last_position',
            'next_content', 'prerequisites_completed', 'estimated_time_remaining'
        ]
    
    def get_next_content(self, obj):
        """Get next content in sequence (for learning paths)."""
        # This would be implemented based on learning path structure
        return None
    
    def get_prerequisites_completed(self, obj):
        """Check if all prerequisites are completed."""
        if not obj.content.prerequisites.exists():
            return True
        
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        
        completed_count = UserProgress.objects.filter(
            user=request.user,
            content__in=obj.content.prerequisites.all(),
            status='COMPLETED'
        ).count()
        
        return completed_count == obj.content.prerequisites.count()
    
    def get_estimated_time_remaining(self, obj):
        """Calculate estimated time remaining to complete content."""
        if obj.status == 'COMPLETED':
            return 0
        
        # Estimate based on content duration and progress
        content_duration = obj.content.duration_minutes or 30
        if obj.progress_percentage > 0:
            remaining = content_duration * (1 - (obj.progress_percentage / 100))
        else:
            remaining = content_duration
        
        return max(1, int(remaining))  # At least 1 minute


# User Progress Serializers

class UserProgressSerializer(DynamicFieldsModelSerializer, TimestampSerializerMixin):
    """
    Serializer for UserProgress model with content details.
    
    Tracks user progress through educational content including:
    - Progress percentage and status
    - Time spent and completion timestamps
    - Quiz scores and answers
    - Bookmark status and last position
    - Content details and statistics
    """
    
    content = EducationalContentBaseSerializer(read_only=True)
    user = UserSimpleSerializer(read_only=True)
    time_spent_formatted = serializers.SerializerMethodField()
    score_percentage = serializers.SerializerMethodField()
    is_passing_score = serializers.SerializerMethodField()
    
    class Meta:
        model = UserProgress
        fields = '__all__'
        read_only_fields = [
            'id', 'user', 'content', 'started_at', 'completed_at',
            'time_spent_formatted', 'score_percentage', 'is_passing_score'
        ]
    
    def get_time_spent_formatted(self, obj):
        """Format time spent in human-readable format."""
        minutes = obj.time_spent_minutes
        if minutes < 60:
            return f"{minutes}m"
        else:
            hours = minutes // 60
            remaining_minutes = minutes % 60
            return f"{hours}h {remaining_minutes}m"
    
    def get_score_percentage(self, obj):
        """Get quiz score as percentage."""
        if obj.quiz_score is None:
            return None
        return float(obj.quiz_score)
    
    def get_is_passing_score(self, obj):
        """Check if quiz score meets passing requirement."""
        if obj.quiz_score is None or obj.content.passing_score is None:
            return None
        
        return obj.quiz_score >= obj.content.passing_score
    
    def validate(self, data):
        """Validate progress data."""
        # Ensure progress percentage is between 0 and 100
        progress = data.get('progress_percentage')
        if progress is not None and (progress < 0 or progress > 100):
            raise serializers.ValidationError({
                'progress_percentage': 'Progress percentage must be between 0 and 100.'
            })
        
        # Ensure quiz score is between 0 and 100
        quiz_score = data.get('quiz_score')
        if quiz_score is not None and (quiz_score < 0 or quiz_score > 100):
            raise serializers.ValidationError({
                'quiz_score': 'Quiz score must be between 0 and 100.'
            })
        
        return data


class UserProgressCreateSerializer(DynamicFieldsModelSerializer):
    """
    Serializer for creating/updating UserProgress.
    
    Used when users update their progress through content.
    Includes validation for progress updates and quiz submissions.
    """
    
    class Meta:
        model = UserProgress
        fields = [
            'content', 'progress_percentage', 'quiz_score', 'quiz_answers',
            'bookmarked', 'last_position', 'time_spent_minutes'
        ]
    
    def create(self, validated_data):
        """Create user progress with auto-set user and started_at."""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['user'] = request.user
        
        # Set started_at if this is new progress
        if 'started_at' not in validated_data:
            validated_data['started_at'] = timezone.now()
        
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        """Update user progress with completion handling."""
        # Check if progress is being marked as completed
        progress = validated_data.get('progress_percentage', instance.progress_percentage)
        if progress == 100 and instance.progress_percentage < 100:
            validated_data['status'] = 'COMPLETED'
            validated_data['completed_at'] = timezone.now()
        
        return super().update(instance, validated_data)


# Learning Paths Serializers

class LearningPathBaseSerializer(DynamicFieldsModelSerializer, TimestampSerializerMixin):
    """
    Base serializer for LearningPath model with common functionality.
    
    Provides:
    - Basic learning path information
    - Timestamps
    - Validation
    - Field customization
    """
    
    class Meta:
        model = LearningPath
        fields = [
            'id', 'title', 'slug', 'description', 'short_description',
            'path_type', 'icon_name', 'color_code', 'difficulty',
            'total_duration_hours', 'total_points', 'contents_count',
            'is_published', 'is_featured', 'completion_certificate',
            'completion_badge', 'enrolled_count', 'completed_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'slug', 'total_duration_hours', 'total_points', 'contents_count',
            'enrolled_count', 'completed_count', 'created_at', 'updated_at'
        ]
    
    def validate(self, data):
        """Validate learning path data."""
        # Check that featured paths are also published
        if data.get('is_featured', False) and not data.get('is_published', True):
            raise serializers.ValidationError({
                'is_featured': 'Featured learning paths must be published.'
            })
        
        return data


class LearningPathContentSerializer(DynamicFieldsModelSerializer):
    """
    Serializer for LearningPathContent model (ordered contents).
    
    Represents the relationship between learning paths and educational content
    with ordering and requirement information.
    """
    
    content = EducationalContentBaseSerializer(read_only=True)
    content_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = LearningPathContent
        fields = ['id', 'content', 'content_id', 'order', 'is_required']
        read_only_fields = ['id', 'content']
    
    def validate(self, data):
        """Validate learning path content data."""
        # Ensure content exists
        content_id = data.get('content_id')
        if content_id:
            try:
                EducationalContent.objects.get(id=content_id)
            except EducationalContent.DoesNotExist:
                raise serializers.ValidationError({
                    'content_id': 'Educational content does not exist.'
                })
        
        return data


class LearningPathSerializer(LearningPathBaseSerializer):
    """
    Comprehensive serializer for LearningPath model with related data.
    
    Includes:
    - Ordered contents with progression information
    - User enrollment status and progress
    - Completion statistics and analytics
    - Prerequisite checking
    - Recommended next steps
    """
    
    contents = serializers.SerializerMethodField()
    path_contents = LearningPathContentSerializer(many=True, read_only=True)
    is_enrolled = serializers.SerializerMethodField()
    user_enrollment = serializers.SerializerMethodField()
    completion_rate = serializers.SerializerMethodField()
    average_progress = serializers.SerializerMethodField()
    recommended_prerequisites = serializers.SerializerMethodField()
    
    class Meta(LearningPathBaseSerializer.Meta):
        fields = LearningPathBaseSerializer.Meta.fields + [
            'contents', 'path_contents', 'is_enrolled', 'user_enrollment',
            'completion_rate', 'average_progress', 'recommended_prerequisites'
        ]
    
    def get_contents(self, obj):
        """Get ordered contents for the learning path."""
        return LearningPathContentSerializer(
            obj.path_contents.order_by('order'),
            many=True,
            context=self.context
        ).data
    
    def get_is_enrolled(self, obj):
        """Check if current user is enrolled in this learning path."""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.enrollments.filter(user=request.user).exists()
        return False
    
    def get_user_enrollment(self, obj):
        """Get current user's enrollment for this learning path."""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            enrollment = obj.enrollments.filter(user=request.user).first()
            if enrollment:
                return LearningPathEnrollmentSerializer(enrollment, context=self.context).data
        return None
    
    def get_completion_rate(self, obj):
        """Calculate completion rate for this learning path."""
        if obj.enrolled_count > 0:
            rate = (obj.completed_count / obj.enrolled_count) * 100
            return f"{rate:.1f}%"
        return "0%"
    
    def get_average_progress(self, obj):
        """Calculate average progress among enrolled users."""
        enrollments = obj.enrollments.all()
        if enrollments.exists():
            avg = enrollments.aggregate(avg=Avg('progress_percentage'))['avg']
            return f"{avg:.1f}%"
        return "0%"
    
    def get_recommended_prerequisites(self, obj):
        """Get recommended prerequisites for this learning path."""
        # This would analyze content prerequisites and recommend preparation
        return []


class LearningPathCreateSerializer(LearningPathBaseSerializer):
    """
    Serializer for creating/updating LearningPath.
    
    Includes write-only fields for content management and validation.
    Handles the creation of learning path contents through nested serializers.
    """
    
    contents = LearningPathContentSerializer(many=True, write_only=True, required=False)
    
    class Meta(LearningPathBaseSerializer.Meta):
        fields = LearningPathBaseSerializer.Meta.fields + ['contents']
    
    def create(self, validated_data):
        """Create learning path with associated contents."""
        contents_data = validated_data.pop('contents', [])
        learning_path = LearningPath.objects.create(**validated_data)
        
        # Create learning path contents
        for content_data in contents_data:
            LearningPathContent.objects.create(
                learning_path=learning_path,
                content_id=content_data['content_id'],
                order=content_data.get('order', 0),
                is_required=content_data.get('is_required', True)
            )
        
        # Update counts
        learning_path.update_counts()
        
        return learning_path
    
    def update(self, instance, validated_data):
        """Update learning path and its contents."""
        contents_data = validated_data.pop('contents', None)
        
        # Update learning path
        instance = super().update(instance, validated_data)
        
        # Update contents if provided
        if contents_data is not None:
            # Clear existing contents
            instance.path_contents.all().delete()
            
            # Create new contents
            for content_data in contents_data:
                LearningPathContent.objects.create(
                    learning_path=instance,
                    content_id=content_data['content_id'],
                    order=content_data.get('order', 0),
                    is_required=content_data.get('is_required', True)
                )
            
            # Update counts
            instance.update_counts()
        
        return instance


# Learning Path Enrollment Serializers

class ContentCompletionSerializer(DynamicFieldsModelSerializer, TimestampSerializerMixin):
    """
    Serializer for ContentCompletion model.
    
    Tracks completion of individual content within learning paths.
    Includes time spent, quiz scores, and completion details.
    """
    
    content = EducationalContentBaseSerializer(read_only=True)
    
    class Meta:
        model = ContentCompletion
        fields = '__all__'
        read_only_fields = ['id', 'completed_at']
    
    def validate(self, data):
        """Validate completion data."""
        # Ensure time spent is reasonable (max 24 hours)
        time_spent = data.get('time_spent_minutes', 0)
        if time_spent > 24 * 60:  # 24 hours in minutes
            raise serializers.ValidationError({
                'time_spent_minutes': 'Time spent cannot exceed 24 hours.'
            })
        
        return data


class LearningPathEnrollmentSerializer(DynamicFieldsModelSerializer, TimestampSerializerMixin):
    """
    Serializer for LearningPathEnrollment model.
    
    Tracks user enrollment in learning paths with progress information.
    Includes completion tracking, time spent, and earned points.
    """
    
    learning_path = LearningPathBaseSerializer(read_only=True)
    user = UserSimpleSerializer(read_only=True)
    current_content = EducationalContentBaseSerializer(read_only=True)
    completions = ContentCompletionSerializer(many=True, read_only=True)
    time_spent_formatted = serializers.SerializerMethodField()
    estimated_completion_date = serializers.SerializerMethodField()
    daily_progress_needed = serializers.SerializerMethodField()
    
    class Meta:
        model = LearningPathEnrollment
        fields = '__all__'
        read_only_fields = [
            'id', 'enrollment_id', 'user', 'learning_path', 'enrolled_at',
            'started_at', 'completed_at', 'last_accessed_at',
            'time_spent_formatted', 'estimated_completion_date', 'daily_progress_needed'
        ]
    
    def get_time_spent_formatted(self, obj):
        """Format total time spent in human-readable format."""
        minutes = obj.total_time_spent_minutes
        if minutes < 60:
            return f"{minutes}m"
        else:
            hours = minutes // 60
            remaining_minutes = minutes % 60
            if hours < 24:
                return f"{hours}h {remaining_minutes}m"
            else:
                days = hours // 24
                remaining_hours = hours % 24
                return f"{days}d {remaining_hours}h"
    
    def get_estimated_completion_date(self, obj):
        """Calculate estimated completion date based on progress rate."""
        if obj.progress_percentage == 100 or obj.status == 'COMPLETED':
            return obj.completed_at
        
        if obj.progress_percentage == 0:
            return None
        
        # Calculate average progress per day
        days_enrolled = (timezone.now() - obj.enrolled_at).days
        if days_enrolled > 0:
            progress_per_day = obj.progress_percentage / days_enrolled
            remaining_progress = 100 - obj.progress_percentage
            days_remaining = remaining_progress / progress_per_day
            
            return timezone.now() + timedelta(days=days_remaining)
        
        return None
    
    def get_daily_progress_needed(self, obj):
        """Calculate daily progress needed to complete in target time."""
        if obj.progress_percentage == 100:
            return 0
        
        # Default target: complete in 30 days from enrollment
        target_days = 30
        days_since_enrollment = (timezone.now() - obj.enrolled_at).days
        days_remaining = max(1, target_days - days_since_enrollment)
        
        remaining_progress = 100 - obj.progress_percentage
        return remaining_progress / days_remaining


class LearningPathEnrollmentCreateSerializer(DynamicFieldsModelSerializer):
    """
    Serializer for creating LearningPathEnrollment.
    
    Used when users enroll in learning paths.
    Includes validation for enrollment eligibility.
    """
    
    class Meta:
        model = LearningPathEnrollment
        fields = ['learning_path', 'notes']
    
    def validate(self, data):
        """Validate enrollment data."""
        request = self.context.get('request')
        learning_path = data.get('learning_path')
        
        if not request or not request.user.is_authenticated:
            raise serializers.ValidationError('User must be authenticated to enroll.')
        
        if not learning_path.is_published:
            raise serializers.ValidationError('Cannot enroll in unpublished learning path.')
        
        # Check if already enrolled
        if LearningPathEnrollment.objects.filter(
            user=request.user,
            learning_path=learning_path
        ).exists():
            raise serializers.ValidationError('Already enrolled in this learning path.')
        
        return data
    
    def create(self, validated_data):
        """Create enrollment with auto-set user and timestamps."""
        request = self.context.get('request')
        validated_data['user'] = request.user
        validated_data['enrolled_at'] = timezone.now()
        
        return super().create(validated_data)


# Certificates Serializers

class CertificateSerializer(DynamicFieldsModelSerializer, TimestampSerializerMixin):
    """
    Serializer for Certificate model with verification features.
    
    Includes:
    - Certificate details and metadata
    - User and achievement information
    - Verification code and public access
    - PDF generation and download URLs
    - Validity period and status
    """
    
    user = UserSimpleSerializer(read_only=True)
    learning_path = LearningPathBaseSerializer(read_only=True)
    content = EducationalContentBaseSerializer(read_only=True)
    verification_url = serializers.SerializerMethodField()
    download_url = serializers.SerializerMethodField()
    is_valid = serializers.SerializerMethodField()
    validity_status = serializers.SerializerMethodField()
    
    class Meta:
        model = Certificate
        fields = '__all__'
        read_only_fields = [
            'id', 'certificate_id', 'user', 'issued_at', 'verification_code',
            'verification_url', 'download_url', 'is_valid', 'validity_status'
        ]
    
    def get_verification_url(self, obj):
        """Generate verification URL for this certificate."""
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(
                f'/api/v1/education/certificates/verify/?code={obj.verification_code}'
            )
        return None
    
    def get_download_url(self, obj):
        """Generate download URL for certificate PDF."""
        if obj.certificate_pdf:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.certificate_pdf.url)
        elif obj.certificate_url:
            return obj.certificate_url
        return None
    
    def get_is_valid(self, obj):
        """Check if certificate is still valid."""
        if obj.valid_until and obj.valid_until < timezone.now().date():
            return False
        return True
    
    def get_validity_status(self, obj):
        """Get human-readable validity status."""
        if not self.get_is_valid(obj):
            return 'Expired'
        
        if obj.valid_until:
            days_remaining = (obj.valid_until - timezone.now().date()).days
            if days_remaining < 0:
                return 'Expired'
            elif days_remaining < 30:
                return f'Expires in {days_remaining} days'
            else:
                return 'Valid'
        
        return 'No expiration'


class CertificateCreateSerializer(DynamicFieldsModelSerializer):
    """
    Serializer for creating certificates.
    
    Used by system to generate certificates for achievements.
    Includes validation for certificate requirements.
    """
    
    class Meta:
        model = Certificate
        fields = [
            'user', 'learning_path', 'content', 'title', 'description',
            'valid_until', 'grade', 'score', 'is_public'
        ]
    
    def validate(self, data):
        """Validate certificate data."""
        # Ensure at least one of learning_path or content is provided
        if not data.get('learning_path') and not data.get('content'):
            raise serializers.ValidationError(
                'Certificate must be associated with either a learning path or content.'
            )
        
        # Validate validity period
        valid_until = data.get('valid_until')
        if valid_until and valid_until < timezone.now().date():
            raise serializers.ValidationError({
                'valid_until': 'Certificate cannot expire in the past.'
            })
        
        return data
    
    def create(self, validated_data):
        """Create certificate with auto-generated verification code."""
        # Verification code is auto-generated in model save()
        return super().create(validated_data)


# Savings Challenges Serializers

class SavingsChallengeBaseSerializer(DynamicFieldsModelSerializer, TimestampSerializerMixin):
    """
    Base serializer for SavingsChallenge model with common functionality.
    
    Provides:
    - Basic challenge information
    - Timestamps
    - Validation
    - Field customization
    """
    
    class Meta:
        model = SavingsChallenge
        fields = [
            'id', 'title', 'slug', 'description', 'short_description',
            'challenge_type', 'target_amount', 'duration_days',
            'start_date', 'end_date', 'status',
            'min_participants', 'max_participants', 'participants_count',
            'reward_points', 'reward_badge', 'total_amount_saved',
            'success_rate', 'created_at'
        ]
        read_only_fields = [
            'id', 'slug', 'participants_count', 'total_amount_saved',
            'success_rate', 'created_at'
        ]
    
    def validate(self, data):
        """Validate savings challenge data."""
        # Check date consistency
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        
        if start_date and end_date and start_date >= end_date:
            raise serializers.ValidationError({
                'end_date': 'End date must be after start date.'
            })
        
        # Check participant limits
        min_participants = data.get('min_participants', 1)
        max_participants = data.get('max_participants', 100)
        
        if min_participants > max_participants:
            raise serializers.ValidationError({
                'min_participants': 'Minimum participants cannot exceed maximum participants.'
            })
        
        if min_participants < 1:
            raise serializers.ValidationError({
                'min_participants': 'Minimum participants must be at least 1.'
            })
        
        # Check target amount
        target_amount = data.get('target_amount')
        if target_amount is not None and target_amount <= 0:
            raise serializers.ValidationError({
                'target_amount': 'Target amount must be positive.'
            })
        
        # Check duration
        duration_days = data.get('duration_days')
        if duration_days is not None and duration_days < 1:
            raise serializers.ValidationError({
                'duration_days': 'Duration must be at least 1 day.'
            })
        
        return data


class SavingsChallengeSerializer(SavingsChallengeBaseSerializer):
    """
    Comprehensive serializer for SavingsChallenge model with participation status.
    
    Includes:
    - Creator information
    - Educational content and learning path
    - User participation status and progress
    - Leaderboard and statistics
    - Time remaining and daily targets
    """
    
    created_by = UserSimpleSerializer(read_only=True)
    learning_path = LearningPathBaseSerializer(read_only=True)
    educational_content = EducationalContentBaseSerializer(many=True, read_only=True)
    is_participating = serializers.SerializerMethodField()
    user_participation = serializers.SerializerMethodField()
    leaderboard = serializers.SerializerMethodField()
    time_remaining = serializers.SerializerMethodField()
    daily_target = serializers.SerializerMethodField()
    progress_summary = serializers.SerializerMethodField()
    
    class Meta(SavingsChallengeBaseSerializer.Meta):
        fields = SavingsChallengeBaseSerializer.Meta.fields + [
            'created_by', 'learning_path', 'educational_content',
            'is_participating', 'user_participation', 'leaderboard',
            'time_remaining', 'daily_target', 'progress_summary'
        ]
    
    def get_is_participating(self, obj):
        """Check if current user is participating in this challenge."""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.participants.filter(user=request.user).exists()
        return False
    
    def get_user_participation(self, obj):
        """Get current user's participation in this challenge."""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            participation = obj.participants.filter(user=request.user).first()
            if participation:
                return ChallengeParticipantSerializer(participation, context=self.context).data
        return None
    
    def get_leaderboard(self, obj):
        """Get challenge leaderboard (top 10 participants)."""
        participants = obj.participants.select_related('user').order_by(
            '-current_amount', 'joined_at'
        )[:10]
        
        return ChallengeParticipantSerializer(
            participants,
            many=True,
            context=self.context,
            fields=['user', 'current_amount', 'progress_percentage', 'streak_days', 'completed']
        ).data
    
    def get_time_remaining(self, obj):
        """Calculate time remaining until challenge ends."""
        if obj.status != 'ACTIVE':
            return "Not active"
        
        days_remaining = (obj.end_date - timezone.now().date()).days
        if days_remaining < 0:
            return "Ended"
        elif days_remaining == 0:
            return "Ends today"
        elif days_remaining == 1:
            return "1 day remaining"
        else:
            return f"{days_remaining} days remaining"
    
    def get_daily_target(self, obj):
        """Calculate daily savings target."""
        if obj.duration_days > 0:
            return obj.target_amount / obj.duration_days
        return obj.target_amount
    
    def get_progress_summary(self, obj):
        """Get progress summary for the challenge."""
        total_target = obj.target_amount * obj.participants_count
        total_saved = obj.total_amount_saved
        
        if total_target > 0:
            percentage = (total_saved / total_target) * 100
        else:
            percentage = 0
        
        return {
            'total_target': total_target,
            'total_saved': total_saved,
            'percentage': percentage,
            'average_per_participant': total_saved / obj.participants_count if obj.participants_count > 0 else 0,
            'participants_completed': obj.participants.filter(completed=True).count(),
        }


class SavingsChallengeCreateSerializer(SavingsChallengeBaseSerializer):
    """
    Serializer for creating/updating SavingsChallenge.
    
    Includes write-only fields for educational content and validation.
    Handles the creation of challenge-participant relationships.
    """
    
    educational_content_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )
    
    class Meta(SavingsChallengeBaseSerializer.Meta):
        fields = SavingsChallengeBaseSerializer.Meta.fields + [
            'created_by', 'learning_path', 'educational_content_ids'
        ]
    
    def create(self, validated_data):
        """Create savings challenge with associated educational content."""
        educational_content_ids = validated_data.pop('educational_content_ids', [])
        
        # Auto-set creator from request user
        if 'created_by' not in validated_data and self.context.get('request'):
            validated_data['created_by'] = self.context['request'].user
        
        challenge = SavingsChallenge.objects.create(**validated_data)
        
        # Add educational content
        if educational_content_ids:
            educational_content = EducationalContent.objects.filter(
                id__in=educational_content_ids
            )
            challenge.educational_content.set(educational_content)
        
        return challenge
    
    def update(self, instance, validated_data):
        """Update savings challenge and its educational content."""
        educational_content_ids = validated_data.pop('educational_content_ids', None)
        
        # Update challenge
        instance = super().update(instance, validated_data)
        
        # Update educational content if provided
        if educational_content_ids is not None:
            educational_content = EducationalContent.objects.filter(
                id__in=educational_content_ids
            )
            instance.educational_content.set(educational_content)
        
        return instance


# Challenge Participants Serializers

class ChallengeParticipantSerializer(DynamicFieldsModelSerializer, TimestampSerializerMixin):
    """
    Serializer for ChallengeParticipant model.
    
    Tracks user participation in savings challenges with progress details.
    Includes savings amounts, progress percentages, and learning progress.
    """
    
    challenge = SavingsChallengeBaseSerializer(read_only=True)
    user = UserSimpleSerializer(read_only=True)
    completed_lessons = EducationalContentBaseSerializer(many=True, read_only=True)
    daily_progress = serializers.SerializerMethodField()
    weekly_progress = serializers.SerializerMethodField()
    streak_status = serializers.SerializerMethodField()
    estimated_completion_date = serializers.SerializerMethodField()
    
    class Meta:
        model = ChallengeParticipant
        fields = '__all__'
        read_only_fields = [
            'id', 'joined_at', 'started_at', 'completed_at', 'last_activity_at',
            'daily_progress', 'weekly_progress', 'streak_status', 'estimated_completion_date'
        ]
    
    def get_daily_progress(self, obj):
        """Calculate daily progress towards target."""
        if not obj.daily_target or obj.daily_target <= 0:
            return None
        
        return {
            'target': obj.daily_target,
            'current': obj.current_amount - (getattr(obj, '_previous_amount', 0)),
            'remaining': max(0, obj.daily_target - (obj.current_amount - getattr(obj, '_previous_amount', 0))),
            'met': (obj.current_amount - getattr(obj, '_previous_amount', 0)) >= obj.daily_target
        }
    
    def get_weekly_progress(self, obj):
        """Calculate weekly progress towards target."""
        if not obj.weekly_target or obj.weekly_target <= 0:
            return None
        
        # This would calculate progress for the current week
        # For now, return placeholder
        return {
            'target': obj.weekly_target,
            'current': 0,  # Would calculate from daily progress
            'remaining': obj.weekly_target,
            'met': False
        }
    
    def get_streak_status(self, obj):
        """Get streak information."""
        return {
            'current_streak': obj.streak_days,
            'longest_streak': obj.streak_days,  # Would track separately
            'broken': False,  # Would check last activity
            'next_milestone': self.get_next_streak_milestone(obj.streak_days)
        }
    
    def get_next_streak_milestone(self, current_streak):
        """Get next streak milestone."""
        milestones = [3, 7, 14, 30, 60, 90, 180, 365]
        for milestone in milestones:
            if current_streak < milestone:
                return milestone
        return None
    
    def get_estimated_completion_date(self, obj):
        """Estimate completion date based on current progress rate."""
        if obj.completed:
            return obj.completed_at
        
        if not obj.target_amount or obj.target_amount <= 0:
            return None
        
        # Calculate average daily savings
        days_participated = (timezone.now() - obj.joined_at).days
        if days_participated > 0:
            avg_daily_savings = obj.current_amount / days_participated
            remaining_amount = obj.target_amount - obj.current_amount
            
            if avg_daily_savings > 0:
                days_remaining = remaining_amount / avg_daily_savings
                return timezone.now() + timedelta(days=days_remaining)
        
        return None


class ChallengeParticipantCreateSerializer(DynamicFieldsModelSerializer):
    """
    Serializer for creating ChallengeParticipant.
    
    Used when users join savings challenges.
    Includes validation for joining eligibility.
    """
    
    class Meta:
        model = ChallengeParticipant
        fields = ['challenge', 'daily_target', 'weekly_target', 'notes']
    
    def validate(self, data):
        """Validate participant data."""
        request = self.context.get('request')
        challenge = data.get('challenge')
        
        if not request or not request.user.is_authenticated:
            raise serializers.ValidationError('User must be authenticated to join challenge.')
        
        if not challenge or challenge.status not in ['UPCOMING', 'ACTIVE']:
            raise serializers.ValidationError('Cannot join inactive or completed challenge.')
        
        # Check if already participating
        if ChallengeParticipant.objects.filter(
            user=request.user,
            challenge=challenge
        ).exists():
            raise serializers.ValidationError('Already participating in this challenge.')
        
        # Check participant limit
        if challenge.participants_count >= challenge.max_participants:
            raise serializers.ValidationError('Challenge has reached maximum participants.')
        
        return data
    
    def create(self, validated_data):
        """Create participant with auto-set user and timestamps."""
        request = self.context.get('request')
        validated_data['user'] = request.user
        validated_data['joined_at'] = timezone.now()
        validated_data['started_at'] = timezone.now()
        validated_data['target_amount'] = validated_data['challenge'].target_amount
        
        return super().create(validated_data)


# Webinars Serializers

class WebinarBaseSerializer(DynamicFieldsModelSerializer, TimestampSerializerMixin):
    """
    Base serializer for Webinar model with common functionality.
    
    Provides:
    - Basic webinar information
    - Timestamps
    - Validation
    - Field customization
    """
    
    class Meta:
        model = Webinar
        fields = [
            'id', 'title', 'slug', 'description', 'short_description',
            'scheduled_at', 'duration_minutes', 'timezone', 'platform',
            'status', 'category', 'difficulty', 'max_participants',
            'registered_count', 'attended_count', 'views_count',
            'average_rating', 'points_reward', 'certificate_available',
            'qna_enabled', 'poll_enabled', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'slug', 'registered_count', 'attended_count', 'views_count',
            'average_rating', 'created_at', 'updated_at'
        ]
    
    def validate(self, data):
        """Validate webinar data."""
        # Check scheduled date is in future
        scheduled_at = data.get('scheduled_at')
        if scheduled_at and scheduled_at <= timezone.now():
            raise serializers.ValidationError({
                'scheduled_at': 'Webinar must be scheduled in the future.'
            })
        
        # Check duration is reasonable
        duration = data.get('duration_minutes')
        if duration is not None and (duration < 15 or duration > 480):  # 15 min to 8 hours
            raise serializers.ValidationError({
                'duration_minutes': 'Duration must be between 15 minutes and 8 hours.'
            })
        
        # Check max participants
        max_participants = data.get('max_participants')
        if max_participants is not None and max_participants < 1:
            raise serializers.ValidationError({
                'max_participants': 'Maximum participants must be at least 1.'
            })
        
        return data


class WebinarSerializer(WebinarBaseSerializer):
    """
    Comprehensive serializer for Webinar model with registration status.
    
    Includes:
    - Presenter and co-presenter information
    - Platform integration details
    - User registration status and details
    - Attendance tracking and statistics
    - Resources and recording information
    - Q&A and poll features
    """
    
    presenter = UserSimpleSerializer(read_only=True)
    co_presenters = UserSimpleSerializer(many=True, read_only=True)
    learning_path = LearningPathBaseSerializer(read_only=True)
    related_content = EducationalContentBaseSerializer(many=True, read_only=True)
    
    is_registered = serializers.SerializerMethodField()
    user_registration = serializers.SerializerMethodField()
    can_register = serializers.SerializerMethodField()
    time_until_start = serializers.SerializerMethodField()
    attendance_stats = serializers.SerializerMethodField()
    platform_info = serializers.SerializerMethodField()
    
    class Meta(WebinarBaseSerializer.Meta):
        fields = WebinarBaseSerializer.Meta.fields + [
            'presenter', 'co_presenters', 'learning_path', 'related_content',
            'meeting_id', 'meeting_url', 'join_url', 'host_url', 'password',
            'recording_url', 'recording_password', 'recording_available_at',
            'slides_url', 'resources_url',
            'is_registered', 'user_registration', 'can_register',
            'time_until_start', 'attendance_stats', 'platform_info'
        ]
    
    def get_is_registered(self, obj):
        """Check if current user is registered for this webinar."""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.registrations.filter(
                user=request.user,
                status__in=['REGISTERED', 'ATTENDED']
            ).exists()
        return False
    
    def get_user_registration(self, obj):
        """Get current user's registration for this webinar."""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            registration = obj.registrations.filter(user=request.user).first()
            if registration:
                return WebinarRegistrationSerializer(registration, context=self.context).data
        return None
    
    def get_can_register(self, obj):
        """Check if current user can register for this webinar."""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            # Check if already registered
            if obj.registrations.filter(user=request.user).exists():
                return False
            
            # Check if webinar is full
            if obj.registered_count >= obj.max_participants:
                return False
            
            # Check if webinar is in the future and scheduled
            return (
                obj.scheduled_at > timezone.now() and
                obj.status == 'SCHEDULED'
            )
        return False
    
    def get_time_until_start(self, obj):
        """Calculate time until webinar starts."""
        return obj.get_time_until_start()
    
    def get_attendance_stats(self, obj):
        """Get attendance statistics."""
        return obj.get_attendance_summary()
    
    def get_platform_info(self, obj):
        """Get platform-specific information."""
        if obj.platform == 'ZOOM':
            return {
                'name': 'Zoom',
                'icon': 'video',
                'join_instructions': 'Click the join URL to enter the webinar',
                'requires_app': False,
                'mobile_app_url': 'https://zoom.us/download',
            }
        elif obj.platform == 'TEAMS':
            return {
                'name': 'Microsoft Teams',
                'icon': 'teams',
                'join_instructions': 'Join via Teams app or web browser',
                'requires_app': True,
                'mobile_app_url': 'https://www.microsoft.com/en-us/microsoft-teams/download-app',
            }
        elif obj.platform == 'GOOGLE_MEET':
            return {
                'name': 'Google Meet',
                'icon': 'video',
                'join_instructions': 'Join via Google Meet link',
                'requires_app': False,
                'mobile_app_url': 'https://meet.google.com/download',
            }
        else:
            return {
                'name': obj.platform,
                'icon': 'video',
                'join_instructions': 'Follow the provided link',
                'requires_app': False,
                'mobile_app_url': None,
            }


class WebinarCreateSerializer(WebinarBaseSerializer):
    """
    Serializer for creating/updating Webinar.
    
    Includes write-only fields for presenters and content.
    Handles platform integration and scheduling.
    """
    
    co_presenter_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )
    related_content_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )
    
    class Meta(WebinarBaseSerializer.Meta):
        fields = WebinarBaseSerializer.Meta.fields + [
            'presenter', 'co_presenter_ids', 'learning_path', 'related_content_ids',
            'meeting_id', 'meeting_url', 'join_url', 'host_url', 'password',
            'recording_url', 'recording_password', 'recording_available_at',
            'slides_url', 'resources_url'
        ]
    
    def create(self, validated_data):
        """Create webinar with associated presenters and content."""
        co_presenter_ids = validated_data.pop('co_presenter_ids', [])
        related_content_ids = validated_data.pop('related_content_ids', [])
        
        # Auto-set presenter from request user if not provided
        if 'presenter' not in validated_data and self.context.get('request'):
            validated_data['presenter'] = self.context['request'].user
        
        webinar = Webinar.objects.create(**validated_data)
        
        # Add co-presenters
        if co_presenter_ids:
            co_presenters = User.objects.filter(id__in=co_presenter_ids)
            webinar.co_presenters.set(co_presenters)
        
        # Add related content
        if related_content_ids:
            related_content = EducationalContent.objects.filter(id__in=related_content_ids)
            webinar.related_content.set(related_content)
        
        return webinar
    
    def update(self, instance, validated_data):
        """Update webinar and its associations."""
        co_presenter_ids = validated_data.pop('co_presenter_ids', None)
        related_content_ids = validated_data.pop('related_content_ids', None)
        
        # Update webinar
        instance = super().update(instance, validated_data)
        
        # Update co-presenters if provided
        if co_presenter_ids is not None:
            co_presenters = User.objects.filter(id__in=co_presenter_ids)
            instance.co_presenters.set(co_presenters)
        
        # Update related content if provided
        if related_content_ids is not None:
            related_content = EducationalContent.objects.filter(id__in=related_content_ids)
            instance.related_content.set(related_content)
        
        return instance


# Webinar Registrations Serializers

class WebinarRegistrationSerializer(DynamicFieldsModelSerializer, TimestampSerializerMixin):
    """
    Serializer for WebinarRegistration model.
    
    Tracks user registration for webinars with attendance details.
    Includes check-in status, attendance duration, and feedback.
    """
    
    webinar = WebinarBaseSerializer(read_only=True)
    user = UserSimpleSerializer(read_only=True)
    attendance_formatted = serializers.SerializerMethodField()
    feedback_summary = serializers.SerializerMethodField()
    checkin_status = serializers.SerializerMethodField()
    
    class Meta:
        model = WebinarRegistration
        fields = '__all__'
        read_only_fields = [
            'id', 'registration_id', 'user', 'webinar', 'registered_at',
            'joined_at', 'left_at', 'checkin_at', 'feedback_at',
            'attendance_formatted', 'feedback_summary', 'checkin_status'
        ]
    
    def get_attendance_formatted(self, obj):
        """Format attendance duration in human-readable format."""
        if not obj.attendance_duration:
            return "No attendance recorded"
        
        minutes = obj.attendance_duration
        if minutes < 60:
            return f"{minutes}m"
        else:
            hours = minutes // 60
            remaining_minutes = minutes % 60
            return f"{hours}h {remaining_minutes}m"
    
    def get_feedback_summary(self, obj):
        """Get feedback summary."""
        if not obj.feedback:
            return None
        
        # Simple feedback analysis (could be more sophisticated)
        feedback = obj.feedback.lower()
        
        summary = {
            'length': len(obj.feedback),
            'has_questions': '?' in obj.feedback,
            'word_count': len(feedback.split()),
        }
        
        # Check for common sentiment words
        positive_words = ['good', 'great', 'excellent', 'helpful', 'thanks', 'thank you']
        negative_words = ['bad', 'poor', 'terrible', 'waste', 'boring']
        
        summary['positive_words'] = sum(1 for word in positive_words if word in feedback)
        summary['negative_words'] = sum(1 for word in negative_words if word in feedback)
        
        return summary
    
    def get_checkin_status(self, obj):
        """Get check-in status information."""
        if obj.checked_in:
            return {
                'status': 'checked_in',
                'time': obj.checkin_at,
                'code': obj.checkin_code,
            }
        else:
            return {
                'status': 'not_checked_in',
                'can_checkin': self.can_checkin(obj),
                'checkin_code': obj.checkin_code,
            }
    
    def can_checkin(self, obj):
        """Check if user can still check in."""
        if obj.checked_in:
            return False
        
        webinar = obj.webinar
        now = timezone.now()
        
        # Check if within check-in window (30 min before to end of webinar)
        checkin_start = webinar.scheduled_at - timedelta(minutes=30)
        checkin_end = webinar.scheduled_at + timedelta(minutes=webinar.duration_minutes)
        
        return checkin_start <= now <= checkin_end


class WebinarRegistrationCreateSerializer(DynamicFieldsModelSerializer):
    """
    Serializer for creating WebinarRegistration.
    
    Used when users register for webinars.
    Includes validation for registration eligibility.
    """
    
    class Meta:
        model = WebinarRegistration
        fields = ['webinar', 'timezone', 'notes']
    
    def validate(self, data):
        """Validate registration data."""
        request = self.context.get('request')
        webinar = data.get('webinar')
        
        if not request or not request.user.is_authenticated:
            raise serializers.ValidationError('User must be authenticated to register.')
        
        if not webinar or webinar.status != 'SCHEDULED':
            raise serializers.ValidationError('Cannot register for inactive or completed webinar.')
        
        # Check if already registered
        if WebinarRegistration.objects.filter(
            user=request.user,
            webinar=webinar
        ).exists():
            raise serializers.ValidationError('Already registered for this webinar.')
        
        # Check if webinar is full
        if webinar.registered_count >= webinar.max_participants:
            raise serializers.ValidationError('Webinar has reached maximum participants.')
        
        return data
    
    def create(self, validated_data):
        """Create registration with auto-set user and check-in code."""
        import random
        import string
        
        request = self.context.get('request')
        validated_data['user'] = request.user
        validated_data['registered_at'] = timezone.now()
        
        # Generate check-in code
        validated_data['checkin_code'] = ''.join(random.choices(string.digits, k=6))
        
        return super().create(validated_data)


# Webinar Q&A Serializers

class WebinarQnASerializer(DynamicFieldsModelSerializer, TimestampSerializerMixin):
    """
    Serializer for WebinarQnA model.
    
    Manages questions and answers during webinars.
    Includes upvoting, anonymity, and answer tracking.
    """
    
    user = UserSimpleSerializer(read_only=True)
    answered_by = UserSimpleSerializer(read_only=True)
    is_answered = serializers.SerializerMethodField()
    answer_time = serializers.SerializerMethodField()
    user_can_upvote = serializers.SerializerMethodField()
    
    class Meta:
        model = WebinarQnA
        fields = '__all__'
        read_only_fields = [
            'id', 'created_at', 'answered_at', 'is_answered', 'answer_time', 'user_can_upvote'
        ]
    
    def get_is_answered(self, obj):
        """Check if question has been answered."""
        return bool(obj.answer and obj.answered_by)
    
    def get_answer_time(self, obj):
        """Get time taken to answer question."""
        if not obj.answered_at or not obj.created_at:
            return None
        
        seconds = (obj.answered_at - obj.created_at).total_seconds()
        if seconds < 60:
            return f"{int(seconds)}s"
        elif seconds < 3600:
            return f"{int(seconds // 60)}m"
        else:
            return f"{int(seconds // 3600)}h"
    
    def get_user_can_upvote(self, obj):
        """Check if current user can upvote this question."""
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        
        # User cannot upvote their own question
        return obj.user != request.user
    
    def validate(self, data):
        """Validate Q&A data."""
        # Check question length
        question = data.get('question', '')
        if len(question) < 10:
            raise serializers.ValidationError({
                'question': 'Question must be at least 10 characters long.'
            })
        
        if len(question) > 1000:
            raise serializers.ValidationError({
                'question': 'Question cannot exceed 1000 characters.'
            })
        
        return data


class WebinarQnACreateSerializer(DynamicFieldsModelSerializer):
    """
    Serializer for creating WebinarQnA.
    
    Used when users ask questions during webinars.
    """
    
    class Meta:
        model = WebinarQnA
        fields = ['webinar', 'question', 'is_anonymous']
    
    def create(self, validated_data):
        """Create Q&A with auto-set user."""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['user'] = request.user
        
        return super().create(validated_data)


# Webinar Polls Serializers

class WebinarPollSerializer(DynamicFieldsModelSerializer, TimestampSerializerMixin):
    """
    Serializer for WebinarPoll model.
    
    Manages polls during webinars with options and responses.
    Includes response tracking and results calculation.
    """
    
    created_by = UserSimpleSerializer(read_only=True)
    response_count = serializers.SerializerMethodField()
    has_responded = serializers.SerializerMethodField()
    results = serializers.SerializerMethodField()
    time_remaining = serializers.SerializerMethodField()
    
    class Meta:
        model = WebinarPoll
        fields = '__all__'
        read_only_fields = [
            'id', 'created_at', 'response_count', 'has_responded', 'results', 'time_remaining'
        ]
    
    def get_response_count(self, obj):
        """Get total number of responses."""
        return obj.responses.count()
    
    def get_has_responded(self, obj):
        """Check if current user has responded to this poll."""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.responses.filter(user=request.user).exists()
        return False
    
    def get_results(self, obj):
        """Calculate poll results."""
        responses = obj.responses.all()
        if not responses.exists():
            return None
        
        # Count responses for each option
        option_counts = {}
        total_responses = 0
        
        for response in responses:
            for option_index in response.selected_options:
                option_counts[option_index] = option_counts.get(option_index, 0) + 1
                total_responses += 1
        
        # Calculate percentages
        results = []
        for i, option in enumerate(obj.options):
            count = option_counts.get(i, 0)
            percentage = (count / total_responses * 100) if total_responses > 0 else 0
            
            results.append({
                'option': option,
                'index': i,
                'count': count,
                'percentage': percentage,
                'is_most_popular': count == max(option_counts.values()) if option_counts else False
            })
        
        return {
            'total_responses': total_responses,
            'options': results,
            'multiple_choice': obj.is_multiple_choice,
        }
    
    def get_time_remaining(self, obj):
        """Get time remaining for poll."""
        if not obj.ends_at:
            return None
        
        now = timezone.now()
        if now >= obj.ends_at:
            return "Ended"
        
        seconds = (obj.ends_at - now).total_seconds()
        if seconds < 60:
            return f"{int(seconds)}s"
        elif seconds < 3600:
            return f"{int(seconds // 60)}m"
        else:
            return f"{int(seconds // 3600)}h"


class WebinarPollResponseSerializer(DynamicFieldsModelSerializer, TimestampSerializerMixin):
    """
    Serializer for WebinarPollResponse model.
    
    Tracks user responses to webinar polls.
    """
    
    poll = WebinarPollSerializer(read_only=True)
    user = UserSimpleSerializer(read_only=True)
    
    class Meta:
        model = WebinarPollResponse
        fields = '__all__'
        read_only_fields = ['id', 'submitted_at']
    
    def validate(self, data):
        """Validate poll response data."""
        poll = data.get('poll')
        selected_options = data.get('selected_options', [])
        
        if not poll or not poll.is_active:
            raise serializers.ValidationError('Cannot respond to inactive poll.')
        
        # Check if poll has ended
        if poll.ends_at and poll.ends_at < timezone.now():
            raise serializers.ValidationError('Poll has ended.')
        
        # Validate selected options
        if not isinstance(selected_options, list):
            raise serializers.ValidationError('Selected options must be a list.')
        
        if not selected_options:
            raise serializers.ValidationError('Must select at least one option.')
        
        if not poll.is_multiple_choice and len(selected_options) > 1:
            raise serializers.ValidationError('Single-choice poll allows only one selection.')
        
        # Validate option indices
        for index in selected_options:
            if not isinstance(index, int) or index < 0 or index >= len(poll.options):
                raise serializers.ValidationError(f'Invalid option index: {index}')
        
        return data
    
    def create(self, validated_data):
        """Create poll response with auto-set user."""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['user'] = request.user
        
        return super().create(validated_data)


# Achievements Serializers

class AchievementSerializer(DynamicFieldsModelSerializer, TimestampSerializerMixin):
    """
    Serializer for Achievement model with user progress.
    
    Includes:
    - Achievement details and requirements
    - User unlock status and progress
    - Statistics and rarity information
    - Context and unlocking conditions
    """
    
    is_unlocked = serializers.SerializerMethodField()
    user_progress = serializers.SerializerMethodField()
    unlock_stats = serializers.SerializerMethodField()
    rarity_info = serializers.SerializerMethodField()
    next_milestone = serializers.SerializerMethodField()
    
    class Meta:
        model = Achievement
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'is_unlocked', 'user_progress', 'unlock_stats', 'rarity_info', 'next_milestone']
    
    def get_is_unlocked(self, obj):
        """Check if current user has unlocked this achievement."""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.user_achievements.filter(
                user=request.user,
                is_unlocked=True
            ).exists()
        return False
    
    def get_user_progress(self, obj):
        """Get current user's progress for this achievement."""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            user_achievement = obj.user_achievements.filter(user=request.user).first()
            if user_achievement:
                return UserAchievementSerializer(user_achievement, context=self.context).data
        return None
    
    def get_unlock_stats(self, obj):
        """Get unlock statistics for this achievement."""
        total_users = User.objects.count()
        unlocked = obj.user_achievements.filter(is_unlocked=True).count()
        
        return {
            'total_users': total_users,
            'unlocked': unlocked,
            'unlock_rate': (unlocked / total_users * 100) if total_users > 0 else 0,
            'rarity': self.get_rarity_level(unlocked, total_users),
        }
    
    def get_rarity_level(self, unlocked, total_users):
        """Calculate rarity level based on unlock rate."""
        if total_users == 0:
            return 'UNKNOWN'
        
        unlock_rate = (unlocked / total_users) * 100
        
        if unlock_rate < 1:
            return 'LEGENDARY'
        elif unlock_rate < 5:
            return 'EPIC'
        elif unlock_rate < 20:
            return 'RARE'
        else:
            return 'COMMON'
    
    def get_rarity_info(self, obj):
        """Get rarity information."""
        rarity_map = {
            'COMMON': {
                'name': 'Common',
                'color': '#6B7280',
                'description': 'Earned by many users',
                'icon': 'trophy',
            },
            'RARE': {
                'name': 'Rare',
                'color': '#3B82F6',
                'description': 'Earned by few users',
                'icon': 'trophy',
            },
            'EPIC': {
                'name': 'Epic',
                'color': '#8B5CF6',
                'description': 'Very difficult to earn',
                'icon': 'crown',
            },
            'LEGENDARY': {
                'name': 'Legendary',
                'color': '#F59E0B',
                'description': 'Extremely rare achievement',
                'icon': 'star',
            },
        }
        
        return rarity_map.get(obj.rarity, rarity_map['COMMON'])
    
    def get_next_milestone(self, obj):
        """Get next milestone for this achievement."""
        # This would analyze criteria and suggest next steps
        return {
            'description': 'Continue learning to unlock this achievement',
            'progress_needed': 100,  # Would calculate based on user progress
            'estimated_time': 'Unknown',
        }


class UserAchievementSerializer(DynamicFieldsModelSerializer, TimestampSerializerMixin):
    """
    Serializer for UserAchievement model.
    
    Tracks which achievements users have earned and their progress.
    Includes context information and unlock details.
    """
    
    achievement = AchievementSerializer(read_only=True)
    user = UserSimpleSerializer(read_only=True)
    context_content = EducationalContentBaseSerializer(read_only=True)
    context_challenge = SavingsChallengeBaseSerializer(read_only=True)
    context_webinar = WebinarBaseSerializer(read_only=True)
    time_since_unlock = serializers.SerializerMethodField()
    shareable_message = serializers.SerializerMethodField()
    
    class Meta:
        model = UserAchievement
        fields = '__all__'
        read_only_fields = ['id', 'earned_at', 'time_since_unlock', 'shareable_message']
    
    def get_time_since_unlock(self, obj):
        """Get time since achievement was unlocked."""
        if not obj.is_unlocked or not obj.earned_at:
            return None
        
        from django.utils.timesince import timesince
        return timesince(obj.earned_at, timezone.now()) + ' ago'
    
    def get_shareable_message(self, obj):
        """Generate shareable message for this achievement."""
        if not obj.is_unlocked:
            return None
        
        achievement = obj.achievement
        context = []
        
        if obj.context_content:
            context.append(f"by completing '{obj.context_content.title}'")
        elif obj.context_challenge:
            context.append(f"by completing the '{obj.context_challenge.title}' challenge")
        elif obj.context_webinar:
            context.append(f"by attending '{obj.context_webinar.title}'")
        
        context_str = ' '.join(context) if context else ''
        
        return f"I just unlocked the '{achievement.title}' achievement {context_str} on ChamaHub! 🎉 #ChamaHub #Achievement"


# Dashboard and Analytics Serializers

class LearningStatsSerializer(serializers.Serializer):
    """
    Serializer for learning statistics.
    
    Provides comprehensive learning analytics for users including:
    - Completion counts and rates
    - Time spent and points earned
    - Progress trends and patterns
    - Category distribution and recommendations
    """
    
    # Basic stats
    total_contents_completed = serializers.IntegerField()
    total_points_earned = serializers.IntegerField()
    total_time_spent_minutes = serializers.IntegerField()
    active_enrollments = serializers.IntegerField()
    certificates_earned = serializers.IntegerField()
    achievements_unlocked = serializers.IntegerField()
    
    # Time-based stats
    daily_completions = serializers.IntegerField()
    weekly_completions = serializers.IntegerField()
    monthly_completions = serializers.IntegerField()
    
    # Progress trends
    weekly_progress = serializers.ListField(child=serializers.DictField())
    monthly_progress = serializers.ListField(child=serializers.DictField())
    
    # Category breakdown
    category_breakdown = serializers.ListField(child=serializers.DictField())
    difficulty_breakdown = serializers.ListField(child=serializers.DictField())
    
    # Activity patterns
    learning_streak = serializers.IntegerField()
    preferred_learning_times = serializers.ListField(child=serializers.DictField())
    average_session_length = serializers.IntegerField()
    
    # Recommendations
    recommended_content = serializers.ListField(child=serializers.DictField())
    next_achievements = serializers.ListField(child=serializers.DictField())
    
    # Comparisons
    rank_percentile = serializers.FloatField()
    community_averages = serializers.DictField()
    
    class Meta:
        fields = '__all__'
    
    def to_representation(self, instance):
        """Format statistics for display."""
        representation = super().to_representation(instance)
        
        # Format time spent
        minutes = representation.get('total_time_spent_minutes', 0)
        if minutes >= 60:
            hours = minutes // 60
            remaining_minutes = minutes % 60
            representation['total_time_spent_formatted'] = f"{hours}h {remaining_minutes}m"
        else:
            representation['total_time_spent_formatted'] = f"{minutes}m"
        
        # Format session length
        session_minutes = representation.get('average_session_length', 0)
        representation['average_session_length_formatted'] = f"{session_minutes}m"
        
        # Calculate completion rate
        total_contents = representation.get('total_contents_completed', 0) + representation.get('active_enrollments', 0)
        if total_contents > 0:
            completion_rate = (representation.get('total_contents_completed', 0) / total_contents) * 100
            representation['completion_rate'] = f"{completion_rate:.1f}%"
        else:
            representation['completion_rate'] = "0%"
        
        # Format rank percentile
        percentile = representation.get('rank_percentile', 0)
        representation['rank_percentile_formatted'] = f"Top {100 - percentile:.0f}%"
        
        return representation


class WebinarStatsSerializer(serializers.Serializer):
    """
    Serializer for webinar statistics.
    
    Provides comprehensive webinar analytics including:
    - Attendance rates and patterns
    - Registration trends and capacity
    - Feedback and rating analysis
    - Presenter performance metrics
    """
    
    # Basic stats
    total_webinars_attended = serializers.IntegerField()
    total_webinars_registered = serializers.IntegerField()
    average_attendance_rate = serializers.FloatField()
    total_webinar_hours = serializers.IntegerField()
    average_rating_given = serializers.FloatField()
    
    # Time-based stats
    upcoming_webinars = serializers.ListField(child=serializers.DictField())
    recent_webinars = serializers.ListField(child=serializers.DictField())
    
    # Platform breakdown
    platform_breakdown = serializers.ListField(child=serializers.DictField())
    
    # Category preferences
    category_preferences = serializers.ListField(child=serializers.DictField())
    
    # Engagement metrics
    average_checkin_time = serializers.IntegerField()
    qna_participation_rate = serializers.FloatField()
    poll_participation_rate = serializers.FloatField()
    
    # Presenter stats (if user is a presenter)
    presented_webinars = serializers.IntegerField()
    average_attendance_as_presenter = serializers.FloatField()
    average_rating_as_presenter = serializers.FloatField()
    
    class Meta:
        fields = '__all__'
    
    def to_representation(self, instance):
        """Format webinar statistics for display."""
        representation = super().to_representation(instance)
        
        # Format attendance rate
        attendance_rate = representation.get('average_attendance_rate', 0)
        representation['average_attendance_rate_formatted'] = f"{attendance_rate:.1f}%"
        
        # Format webinar hours
        hours = representation.get('total_webinar_hours', 0)
        if hours >= 24:
            days = hours // 24
            remaining_hours = hours % 24
            representation['total_webinar_hours_formatted'] = f"{days}d {remaining_hours}h"
        else:
            representation['total_webinar_hours_formatted'] = f"{hours}h"
        
        # Format checkin time
        checkin_minutes = representation.get('average_checkin_time', 0)
        representation['average_checkin_time_formatted'] = f"{checkin_minutes}m before start"
        
        # Format participation rates
        qna_rate = representation.get('qna_participation_rate', 0) * 100
        poll_rate = representation.get('poll_participation_rate', 0) * 100
        representation['qna_participation_rate_formatted'] = f"{qna_rate:.1f}%"
        representation['poll_participation_rate_formatted'] = f"{poll_rate:.1f}%"
        
        return representation


class ChallengeStatsSerializer(serializers.Serializer):
    """
    Serializer for challenge statistics.
    
    Provides comprehensive savings challenge analytics including:
    - Savings amounts and progress
    - Participation rates and completion
    - Leaderboard rankings and comparisons
    - Learning integration effectiveness
    """
    
    # Basic stats
    total_challenges_participated = serializers.IntegerField()
    total_amount_saved = serializers.DecimalField(max_digits=12, decimal_places=2)
    challenges_completed = serializers.IntegerField()
    success_rate = serializers.FloatField()
    total_reward_points = serializers.IntegerField()
    
    # Progress stats
    average_progress = serializers.FloatField()
    average_completion_time = serializers.IntegerField()
    streak_days = serializers.IntegerField()
    
    # Challenge types
    challenge_type_breakdown = serializers.ListField(child=serializers.DictField())
    
    # Active challenges
    active_challenges = serializers.ListField(child=serializers.DictField())
    
    # Learning integration
    lessons_completed = serializers.IntegerField()
    learning_progress_rate = serializers.FloatField()
    
    # Rankings
    leaderboard_rank = serializers.IntegerField()
    percentile_rank = serializers.FloatField()
    total_participants_beaten = serializers.IntegerField()
    
    # Savings patterns
    average_daily_savings = serializers.DecimalField(max_digits=10, decimal_places=2)
    preferred_savings_days = serializers.ListField(child=serializers.DictField())
    
    class Meta:
        fields = '__all__'
    
    def to_representation(self, instance):
        """Format challenge statistics for display."""
        representation = super().to_representation(instance)
        
        # Format amounts
        total_saved = representation.get('total_amount_saved', 0)
        representation['total_amount_saved_formatted'] = f"${total_saved:,.2f}"
        
        avg_daily = representation.get('average_daily_savings', 0)
        representation['average_daily_savings_formatted'] = f"${avg_daily:,.2f}"
        
        # Format success rate
        success_rate = representation.get('success_rate', 0)
        representation['success_rate_formatted'] = f"{success_rate:.1f}%"
        
        # Format learning progress
        learning_rate = representation.get('learning_progress_rate', 0) * 100
        representation['learning_progress_rate_formatted'] = f"{learning_rate:.1f}%"
        
        # Format completion time
        completion_days = representation.get('average_completion_time', 0)
        representation['average_completion_time_formatted'] = f"{completion_days} days"
        
        # Format rank
        rank = representation.get('leaderboard_rank', 0)
        representation['leaderboard_rank_formatted'] = f"#{rank}"
        
        percentile = representation.get('percentile_rank', 0)
        representation['percentile_rank_formatted'] = f"Top {100 - percentile:.0f}%"
        
        return representation


class EducationDashboardSerializer(serializers.Serializer):
    """
    Serializer for comprehensive education dashboard.
    
    Combines all education hub statistics into a single dashboard view.
    Provides overview metrics, recent activity, and recommendations.
    """
    
    # Overview metrics
    overview = serializers.DictField()
    
    # Detailed statistics
    learning_stats = LearningStatsSerializer()
    webinar_stats = WebinarStatsSerializer()
    challenge_stats = ChallengeStatsSerializer()
    
    # Recent activity
    recent_completions = serializers.ListField(child=serializers.DictField())
    recent_achievements = serializers.ListField(child=serializers.DictField())
    upcoming_deadlines = serializers.ListField(child=serializers.DictField())
    
    # Recommendations
    content_recommendations = serializers.ListField(child=serializers.DictField())
    path_recommendations = serializers.ListField(child=serializers.DictField())
    challenge_recommendations = serializers.ListField(child=serializers.DictField())
    webinar_recommendations = serializers.ListField(child=serializers.DictField())
    
    # Progress tracking
    current_goals = serializers.ListField(child=serializers.DictField())
    progress_timeline = serializers.ListField(child=serializers.DictField())
    
    # Community comparisons
    community_benchmarks = serializers.DictField()
    friend_activity = serializers.ListField(child=serializers.DictField())
    
    class Meta:
        fields = '__all__'
    
    def to_representation(self, instance):
        """Format dashboard data for display."""
        representation = super().to_representation(instance)
        
        # Add timestamp
        representation['generated_at'] = timezone.now().isoformat()
        representation['generated_at_human'] = timezone.now().strftime('%B %d, %Y at %I:%M %p')
        
        # Calculate overall progress score
        learning_stats = representation.get('learning_stats', {})
        challenge_stats = representation.get('challenge_stats', {})
        webinar_stats = representation.get('webinar_stats', {})
        
        # Simple weighted score (can be more sophisticated)
        content_score = learning_stats.get('completion_rate', '0%').replace('%', '')
        challenge_score = challenge_stats.get('success_rate_formatted', '0%').replace('%', '')
        webinar_score = webinar_stats.get('average_attendance_rate_formatted', '0%').replace('%', '')
        
        try:
            overall_score = (
                float(content_score) * 0.4 +
                float(challenge_score) * 0.3 +
                float(webinar_score) * 0.3
            )
            representation['overall_progress_score'] = f"{overall_score:.1f}%"
        except (ValueError, TypeError):
            representation['overall_progress_score'] = "0%"
        
        return representation


# Quiz Submission Serializer

class QuizSubmissionSerializer(serializers.Serializer):
    """
    Serializer for quiz submission.
    
    Handles quiz answer submission with validation and scoring.
    Includes time tracking and answer storage.
    """
    
    content_id = serializers.IntegerField()
    answers = serializers.JSONField()
    time_spent_minutes = serializers.IntegerField(default=0)
    completed_at = serializers.DateTimeField(default=timezone.now)
    
    class Meta:
        fields = ['content_id', 'answers', 'time_spent_minutes', 'completed_at']
    
    def validate(self, data):
        """
        Validate quiz submission data.
        
        Args:
            data: Submission data
            
        Returns:
            dict: Validated data
            
        Raises:
            serializers.ValidationError: If validation fails
        """
        content_id = data.get('content_id')
        answers = data.get('answers')
        time_spent = data.get('time_spent_minutes', 0)
        
        # Validate content exists and is a quiz
        try:
            content = EducationalContent.objects.get(id=content_id)
            if content.content_type != 'QUIZ':
                raise serializers.ValidationError({
                    'content_id': 'Content is not a quiz'
                })
        except EducationalContent.DoesNotExist:
            raise serializers.ValidationError({
                'content_id': 'Content does not exist'
            })
        
        # Validate answers format
        if not isinstance(answers, dict):
            raise serializers.ValidationError({
                'answers': 'Answers must be a JSON object'
            })
        
        # Validate quiz questions exist
        quiz_questions = content.quiz_questions
        if not quiz_questions or not isinstance(quiz_questions, list):
            raise serializers.ValidationError({
                'content_id': 'Quiz has no questions'
            })
        
        # Validate answer keys match question indices
        for i in range(len(quiz_questions)):
            if str(i) not in answers:
                raise serializers.ValidationError({
                    'answers': f'Missing answer for question {i+1}'
                })
        
        # Validate time spent is reasonable
        if time_spent < 0:
            raise serializers.ValidationError({
                'time_spent_minutes': 'Time spent cannot be negative'
            })
        
        if time_spent > content.duration_minutes * 2:  # Allow up to 2x duration
            raise serializers.ValidationError({
                'time_spent_minutes': f'Time spent exceeds reasonable limit for {content.duration_minutes} minute quiz'
            })
        
        return data
    
    def calculate_score(self, content, answers):
        """
        Calculate quiz score based on answers.
        
        Args:
            content: EducationalContent object
            answers: User answers dictionary
            
        Returns:
            dict: Score results including percentage and details
        """
        quiz_questions = content.quiz_questions
        total_questions = len(quiz_questions)
        correct_answers = 0
        question_details = []
        
        for i, question in enumerate(quiz_questions):
            user_answer = answers.get(str(i))
            correct_answer = question.get('correct_answer')
            
            is_correct = user_answer == correct_answer
            if is_correct:
                correct_answers += 1
            
            question_details.append({
                'question_index': i,
                'question_text': question.get('question', ''),
                'user_answer': user_answer,
                'correct_answer': correct_answer,
                'is_correct': is_correct,
                'options': question.get('options', []),
            })
        
        score_percentage = (correct_answers / total_questions) * 100 if total_questions > 0 else 0
        passed = score_percentage >= content.passing_score
        
        return {
            'score_percentage': score_percentage,
            'raw_score': correct_answers,
            'total_questions': total_questions,
            'passed': passed,
            'passing_score': content.passing_score,
            'question_details': question_details,
        }