"""
Enhanced Serializers for Education Hub with Comprehensive Data Representation.

This module provides advanced serializers with improved performance,
nested relationships, calculated fields, and optimized database queries.
Includes serializers for analytics, dashboard data, and real-time updates.
"""

from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.db.models import Avg, Count, Sum, F
from django.utils import timezone
from .models import (
    EducationalContent, UserProgress, LearningPath, LearningPathContent,
    LearningPathEnrollment, ContentCompletion, Certificate, SavingsChallenge,
    ChallengeParticipant, Webinar, WebinarRegistration, WebinarQnA,
    WebinarPoll, WebinarPollResponse, Achievement, UserAchievement
)

User = get_user_model()


class UserSimpleSerializer(serializers.ModelSerializer):
    """Enhanced User serializer with additional computed fields."""
    
    full_name = serializers.SerializerMethodField()
    initials = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'full_name', 'initials', 'profile_picture']
        read_only_fields = fields
    
    def get_full_name(self, obj):
        """Get user's full name."""
        return obj.get_full_name()
    
    def get_initials(self, obj):
        """Get user's initials for avatar display."""
        first = obj.first_name[0] if obj.first_name else ''
        last = obj.last_name[0] if obj.last_name else ''
        return f"{first}{last}".upper()


# Educational Content Serializers
class EducationalContentListSerializer(serializers.ModelSerializer):
    """Serializer for educational content list view with optimized fields."""
    
    author = UserSimpleSerializer(read_only=True)
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    content_type_display = serializers.CharField(source='get_content_type_display', read_only=True)
    difficulty_display = serializers.CharField(source='get_difficulty_display', read_only=True)
    is_completed = serializers.SerializerMethodField()
    is_bookmarked = serializers.SerializerMethodField()
    completion_rate = serializers.SerializerMethodField()
    avg_rating = serializers.SerializerMethodField()
    
    class Meta:
        model = EducationalContent
        fields = [
            'id', 'title', 'slug', 'description', 'content_type', 'content_type_display',
            'category', 'category_display', 'difficulty', 'difficulty_display',
            'thumbnail_url', 'duration_minutes', 'points_reward', 'views_count',
            'likes_count', 'share_count', 'author', 'is_published', 'is_featured',
            'created_at', 'updated_at', 'is_completed', 'is_bookmarked',
            'completion_rate', 'avg_rating'
        ]
    
    def get_is_completed(self, obj):
        """Check if current user has completed this content."""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.user_progress.filter(
                user=request.user, 
                status='COMPLETED'
            ).exists()
        return False
    
    def get_is_bookmarked(self, obj):
        """Check if current user has bookmarked this content."""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            progress = obj.user_progress.filter(user=request.user).first()
            return progress.bookmarked if progress else False
        return False
    
    def get_completion_rate(self, obj):
        """Calculate completion rate for this content."""
        total_started = obj.user_progress.filter(status__in=['IN_PROGRESS', 'COMPLETED']).count()
        total_completed = obj.user_progress.filter(status='COMPLETED').count()
        return (total_completed / total_started * 100) if total_started > 0 else 0
    
    def get_avg_rating(self, obj):
        """Calculate average rating from user progress."""
        avg = obj.user_progress.filter(
            quiz_score__isnull=False
        ).aggregate(avg_score=Avg('quiz_score'))
        return avg['avg_score'] or 0


class EducationalContentDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for educational content with all related data."""
    
    author = UserSimpleSerializer(read_only=True)
    prerequisites = EducationalContentListSerializer(many=True, read_only=True)
    learning_objectives = serializers.JSONField(read_only=True)
    tags = serializers.JSONField(read_only=True)
    user_progress = serializers.SerializerMethodField()
    related_content = serializers.SerializerMethodField()
    completion_stats = serializers.SerializerMethodField()
    
    class Meta:
        model = EducationalContent
        fields = '__all__'
    
    def get_user_progress(self, obj):
        """Get current user's progress for this content."""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            progress = obj.user_progress.filter(user=request.user).first()
            if progress:
                return UserProgressSerializer(progress).data
        return None
    
    def get_related_content(self, obj):
        """Get related content based on category and tags."""
        related = EducationalContent.objects.filter(
            category=obj.category,
            is_published=True
        ).exclude(id=obj.id).order_by('-views_count', '-created_at')[:5]
        return EducationalContentListSerializer(related, many=True).data
    
    def get_completion_stats(self, obj):
        """Get completion statistics for this content."""
        total_started = obj.user_progress.count()
        total_completed = obj.user_progress.filter(status='COMPLETED').count()
        avg_time = obj.user_progress.filter(
            time_spent_minutes__gt=0
        ).aggregate(avg_time=Avg('time_spent_minutes'))
        
        return {
            'total_started': total_started,
            'total_completed': total_completed,
            'completion_rate': (total_completed / total_started * 100) if total_started > 0 else 0,
            'average_time_minutes': avg_time['avg_time'] or 0,
            'total_points_awarded': total_completed * obj.points_reward
        }


# Dashboard and Analytics Serializers
class LearningAnalyticsSerializer(serializers.Serializer):
    """Serializer for learning analytics data."""
    
    total_contents_completed = serializers.IntegerField()
    total_points_earned = serializers.IntegerField()
    total_time_spent_minutes = serializers.IntegerField()
    active_enrollments = serializers.IntegerField()
    certificates_earned = serializers.IntegerField()
    achievements_unlocked = serializers.IntegerField()
    current_streak_days = serializers.IntegerField()
    weekly_goal_progress = serializers.DictField()
    
    # Time-based analytics
    daily_completions = serializers.ListField(child=serializers.DictField())
    weekly_completions = serializers.ListField(child=serializers.DictField())
    monthly_completions = serializers.ListField(child=serializers.DictField())
    
    # Category breakdown
    category_breakdown = serializers.ListField(child=serializers.DictField())
    difficulty_breakdown = serializers.ListField(child=serializers.DictField())
    content_type_breakdown = serializers.ListField(child=serializers.DictField())
    
    # Progress tracking
    completion_rate = serializers.FloatField()
    average_daily_learning = serializers.FloatField()
    preferred_learning_time = serializers.ListField(child=serializers.DictField())
    
    # Recent activity
    recent_completions = serializers.ListField(child=serializers.DictField())
    upcoming_deadlines = serializers.ListField(child=serializers.DictField())
    recommended_content = serializers.ListField(child=serializers.DictField())


class UserEngagementSerializer(serializers.Serializer):
    """Serializer for user engagement analytics."""
    
    total_sessions = serializers.IntegerField()
    average_session_duration = serializers.FloatField()
    most_active_day = serializers.CharField()
    most_active_hour = serializers.IntegerField()
    
    # Engagement patterns
    daily_engagement = serializers.ListField(child=serializers.DictField())
    weekly_engagement = serializers.ListField(child=serializers.DictField())
    monthly_engagement = serializers.ListField(child=serializers.DictField())
    
    # Interaction metrics
    content_interactions = serializers.DictField()
    quiz_participation = serializers.DictField()
    discussion_participation = serializers.DictField()
    
    # Progress indicators
    learning_momentum = serializers.FloatField()
    consistency_score = serializers.FloatField()
    engagement_score = serializers.FloatField()


class AchievementProgressSerializer(serializers.ModelSerializer):
    """Serializer for achievement progress tracking."""
    
    achievement = AchievementSerializer(read_only=True)
    progress_percentage = serializers.SerializerMethodField()
    remaining_criteria = serializers.SerializerMethodField()
    estimated_completion = serializers.SerializerMethodField()
    
    class Meta:
        model = UserAchievement
        fields = [
            'id', 'achievement', 'progress', 'is_unlocked', 'earned_at',
            'progress_percentage', 'remaining_criteria', 'estimated_completion'
        ]
    
    def get_progress_percentage(self, obj):
        """Calculate progress percentage towards achievement."""
        return min(100, (obj.progress / obj.achievement.criteria_value.get('target', 100)) * 100)
    
    def get_remaining_criteria(self, obj):
        """Get remaining criteria to unlock achievement."""
        remaining = obj.achievement.criteria_value.get('target', 100) - obj.progress
        return max(0, remaining)
    
    def get_estimated_completion(self, obj):
        """Estimate completion date based on current pace."""
        if obj.progress_percentage >= 100 or obj.is_unlocked:
            return None
        
        # Calculate average daily progress
        # This would require historical progress data
        return None


# Enhanced serializers for other models...