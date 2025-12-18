"""
Enhanced Education Hub Views Module with Comprehensive API Endpoints.

This module provides extensive API views for the education hub with improved
performance, pagination, filtering, and analytics. All viewsets include
detailed documentation, proper error handling, and optimized database queries.

Key Improvements:
- Optimized querysets with select_related and prefetch_related
- Comprehensive analytics endpoints
- Enhanced filtering and search capabilities
- Proper permission handling
- Real-time progress tracking
- Integration-ready webhook endpoints
"""

from rest_framework import viewsets, status, filters, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework.pagination import PageNumberPagination
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count, Sum, Avg, F, Value, Case, When, IntegerField
from django.db.models.functions import Coalesce, ExtractWeek, ExtractMonth, ExtractYear
from django.utils import timezone
from datetime import timedelta, datetime
import uuid
import json
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.core.cache import cache
from django.views.decorators.cache import cache_page
from django.utils.decorators import method_decorator

from .models import (
    EducationalContent, UserProgress, LearningPath, LearningPathContent,
    LearningPathEnrollment, ContentCompletion, Certificate, SavingsChallenge,
    ChallengeParticipant, Webinar, WebinarRegistration, WebinarQnA,
    WebinarPoll, WebinarPollResponse, Achievement, UserAchievement
)
from .serializers import (
    EducationalContentSerializer, EducationalContentCreateSerializer,
    UserProgressSerializer, UserProgressCreateSerializer,
    LearningPathSerializer, LearningPathCreateSerializer,
    LearningPathEnrollmentSerializer, LearningPathEnrollmentCreateSerializer,
    ContentCompletionSerializer, CertificateSerializer,
    SavingsChallengeSerializer, SavingsChallengeCreateSerializer,
    ChallengeParticipantSerializer, ChallengeParticipantCreateSerializer,
    WebinarSerializer, WebinarCreateSerializer,
    WebinarRegistrationSerializer, WebinarRegistrationCreateSerializer,
    WebinarQnASerializer, WebinarPollSerializer, WebinarPollResponseSerializer,
    AchievementSerializer, UserAchievementSerializer,
    LearningStatsSerializer, WebinarStatsSerializer, ChallengeStatsSerializer,
    QuizSubmissionSerializer, EducationDashboardSerializer
)
from .filters import (
    EducationalContentFilter, LearningPathFilter,
    SavingsChallengeFilter, WebinarFilter
)
from .permissions import (
    IsContentAuthor, IsLearningPathOwner, IsChallengeCreator,
    IsWebinarPresenter
)


class StandardResultsSetPagination(PageNumberPagination):
    """
    Standard pagination configuration for all education endpoints.
    
    Provides consistent pagination across all API responses with
    configurable page sizes and optimized performance.
    """
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100
    
    def get_paginated_response(self, data):
        """
        Custom paginated response with additional metadata.
        
        Returns:
            Response: Enhanced paginated response with metadata
        """
        response = super().get_paginated_response(data)
        response.data.update({
            'total_pages': self.page.paginator.num_pages,
            'current_page': self.page.number,
            'next_page': self.page.next_page_number() if self.page.has_next() else None,
            'previous_page': self.page.previous_page_number() if self.page.has_previous() else None,
        })
        return response


class EducationalContentViewSet(viewsets.ModelViewSet):
    """
    Comprehensive ViewSet for Educational Content Management.
    
    Provides full CRUD operations with advanced features:
    - Content recommendations based on user behavior
    - Progress tracking and analytics
    - Content categorization and filtering
    - Featured content management
    - User engagement tracking
    - Quiz and assessment handling
    - Bookmarking and sharing capabilities
    
    Optimized with:
    - Database query optimization
    - Caching for frequently accessed content
    - Efficient serialization
    - Real-time view counting
    """
    
    queryset = EducationalContent.objects.select_related('author').prefetch_related('prerequisites', 'learning_paths')
    serializer_class = EducationalContentSerializer
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = EducationalContentFilter
    search_fields = ['title', 'description', 'content', 'tags', 'learning_objectives']
    ordering_fields = ['created_at', 'updated_at', 'published_at', 'views_count', 'points_reward', 'difficulty']
    ordering = ['-created_at']
    
    def get_permissions(self):
        """
        Return appropriate permissions based on action.
        
        Returns:
            list: List of permission classes
        """
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated, IsContentAuthor]
        elif self.action in ['featured', 'recommended', 'popular', 'recent']:
            return [AllowAny]
        return [IsAuthenticated]
    
    def get_queryset(self):
        """
        Optimized queryset with filtering based on user and request parameters.
        
        Returns:
            QuerySet: Filtered and optimized educational content queryset
        """
        queryset = super().get_queryset()
        
        # Filter by publication status for non-admins
        if not self.request.user.is_staff:
            queryset = queryset.filter(is_published=True)
        
        # Apply user-specific filters
        user = self.request.user
        
        if user.is_authenticated:
            # Add progress information for authenticated users
            queryset = queryset.annotate(
                user_progress_status=Coalesce(
                    UserProgress.objects.filter(
                        user=user,
                        content_id=F('id')
                    ).values('status')[:1],
                    Value('NOT_STARTED')
                ),
                user_bookmarked=Coalesce(
                    UserProgress.objects.filter(
                        user=user,
                        content_id=F('id'),
                        bookmarked=True
                    ).values('bookmarked')[:1],
                    Value(False)
                ),
                user_completed=Case(
                    When(
                        user_progress__user=user,
                        user_progress__status='COMPLETED',
                        then=Value(True)
                    ),
                    default=Value(False),
                    output_field=IntegerField()
                )
            )
        
        # Category filter
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category=category)
        
        # Difficulty filter
        difficulty = self.request.query_params.get('difficulty')
        if difficulty:
            queryset = queryset.filter(difficulty=difficulty)
        
        # Content type filter
        content_type = self.request.query_params.get('content_type')
        if content_type:
            queryset = queryset.filter(content_type=content_type)
        
        # Featured content filter
        is_featured = self.request.query_params.get('is_featured')
        if is_featured and is_featured.lower() == 'true':
            queryset = queryset.filter(is_featured=True)
        
        return queryset
    
    def retrieve(self, request, *args, **kwargs):
        """
        Retrieve educational content with view count increment.
        
        Returns:
            Response: Detailed educational content with user progress
        """
        instance = self.get_object()
        
        # Increment view count
        instance.views_count = F('views_count') + 1
        instance.save()
        instance.refresh_from_db()
        
        # Add user progress if authenticated
        if request.user.is_authenticated:
            UserProgress.objects.get_or_create(
                user=request.user,
                content=instance,
                defaults={'status': 'IN_PROGRESS'}
            )
        
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    @method_decorator(cache_page(60 * 15))  # Cache for 15 minutes
    @action(detail=False, methods=['get'])
    def featured(self, request):
        """
        Get featured educational content.
        
        Returns:
            Response: Paginated list of featured educational content
        """
        featured_content = self.get_queryset().filter(
            is_featured=True,
            is_published=True
        ).order_by('-published_at', '-views_count')[:12]
        
        page = self.paginate_queryset(featured_content)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(featured_content, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def recommended(self, request):
        """
        Get personalized content recommendations.
        
        Returns:
            Response: Recommended content based on user's learning history
        """
        user = request.user
        recommendations = []
        
        if user.is_authenticated:
            # Get user's completed categories
            completed_categories = UserProgress.objects.filter(
                user=user,
                status='COMPLETED'
            ).values_list('content__category', flat=True).distinct()
            
            # Get content in same categories but not completed
            recommendations = self.get_queryset().filter(
                category__in=completed_categories,
                is_published=True
            ).exclude(
                user_progress__user=user,
                user_progress__status='COMPLETED'
            ).order_by('-views_count', '-published_at')[:10]
        
        else:
            # For anonymous users, show popular content
            recommendations = self.get_queryset().filter(
                is_published=True
            ).order_by('-views_count', '-published_at')[:10]
        
        serializer = self.get_serializer(recommendations, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def popular(self, request):
        """
        Get popular educational content.
        
        Returns:
            Response: Most viewed educational content
        """
        popular_content = self.get_queryset().filter(
            is_published=True
        ).order_by('-views_count', '-likes_count')[:12]
        
        serializer = self.get_serializer(popular_content, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def recent(self, request):
        """
        Get recently published educational content.
        
        Returns:
            Response: Recently published educational content
        """
        recent_content = self.get_queryset().filter(
            is_published=True,
            published_at__gte=timezone.now() - timedelta(days=30)
        ).order_by('-published_at')[:12]
        
        serializer = self.get_serializer(recent_content, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def start_progress(self, request, pk=None):
        """
        Start or resume progress on educational content.
        
        Returns:
            Response: User progress information
        """
        content = self.get_object()
        user = request.user
        
        with transaction.atomic():
            progress, created = UserProgress.objects.get_or_create(
                user=user,
                content=content,
                defaults={
                    'status': 'IN_PROGRESS',
                    'progress_percentage': 0,
                    'started_at': timezone.now()
                }
            )
            
            if not created and progress.status == 'NOT_STARTED':
                progress.status = 'IN_PROGRESS'
                progress.started_at = timezone.now()
                progress.save()
        
        # Update content view count
        content.views_count = F('views_count') + 1
        content.save()
        
        return Response({
            'message': 'Progress tracking started' if created else 'Progress resumed',
            'progress': UserProgressSerializer(progress).data,
            'content': self.get_serializer(content).data
        }, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'])
    def complete_content(self, request, pk=None):
        """
        Mark educational content as completed.
        
        Returns:
            Response: Completion confirmation and rewards
        """
        content = self.get_object()
        user = request.user
        
        with transaction.atomic():
            # Get or create progress record
            progress, created = UserProgress.objects.get_or_create(
                user=user,
                content=content,
                defaults={
                    'status': 'COMPLETED',
                    'progress_percentage': 100,
                    'started_at': timezone.now(),
                    'completed_at': timezone.now()
                }
            )
            
            # Update progress
            progress.status = 'COMPLETED'
            progress.progress_percentage = 100
            progress.completed_at = timezone.now()
            progress.time_spent_minutes = request.data.get('time_spent_minutes', progress.time_spent_minutes)
            
            # Handle quiz results if provided
            quiz_score = request.data.get('quiz_score')
            quiz_answers = request.data.get('quiz_answers')
            
            if quiz_score is not None:
                progress.quiz_score = quiz_score
                progress.quiz_answers = quiz_answers
            
            progress.save()
            
            # Award points
            if content.points_reward > 0:
                # Add points to user's profile
                user_profile = user.profile if hasattr(user, 'profile') else None
                if user_profile:
                    user_profile.points += content.points_reward
                    user_profile.save()
            
            # Check for achievement unlocks
            self._check_achievements(user, content)
        
        return Response({
            'message': 'Content completed successfully',
            'points_awarded': content.points_reward,
            'progress': UserProgressSerializer(progress).data
        }, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'])
    def bookmark(self, request, pk=None):
        """
        Bookmark or unbookmark educational content.
        
        Returns:
            Response: Bookmark status
        """
        content = self.get_object()
        user = request.user
        
        with transaction.atomic():
            progress, created = UserProgress.objects.get_or_create(
                user=user,
                content=content,
                defaults={'bookmarked': True}
            )
            
            if not created:
                progress.bookmarked = not progress.bookmarked
                progress.save()
        
        return Response({
            'message': 'Content bookmarked' if progress.bookmarked else 'Bookmark removed',
            'bookmarked': progress.bookmarked
        }, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'])
    def like(self, request, pk=None):
        """
        Like educational content.
        
        Returns:
            Response: Like count
        """
        content = self.get_object()
        
        content.likes_count = F('likes_count') + 1
        content.save()
        content.refresh_from_db()
        
        return Response({
            'message': 'Content liked',
            'likes_count': content.likes_count
        }, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'])
    def share(self, request, pk=None):
        """
        Share educational content.
        
        Returns:
            Response: Share count
        """
        content = self.get_object()
        
        content.share_count = F('share_count') + 1
        content.save()
        content.refresh_from_db()
        
        return Response({
            'message': 'Content shared',
            'share_count': content.share_count
        }, status=status.HTTP_200_OK)
    
    def _check_achievements(self, user, content):
        """
        Check and award achievements for content completion.
        
        Args:
            user: User object
            content: EducationalContent object
        """
        # Check for first completion achievement
        completed_count = UserProgress.objects.filter(
            user=user,
            status='COMPLETED'
        ).count()
        
        if completed_count == 1:
            try:
                achievement = Achievement.objects.get(
                    criteria_type='FIRST_CONTENT_COMPLETION',
                    is_active=True
                )
                UserAchievement.objects.get_or_create(
                    user=user,
                    achievement=achievement,
                    defaults={
                        'is_unlocked': True,
                        'earned_at': timezone.now(),
                        'context_content': content
                    }
                )
            except Achievement.DoesNotExist:
                pass
        
        # Check for category completion achievements
        category_completions = UserProgress.objects.filter(
            user=user,
            status='COMPLETED',
            content__category=content.category
        ).count()
        
        if category_completions >= 5:
            try:
                achievement = Achievement.objects.get(
                    criteria_type=f'{content.category}_MASTER',
                    is_active=True
                )
                UserAchievement.objects.get_or_create(
                    user=user,
                    achievement=achievement,
                    defaults={
                        'is_unlocked': True,
                        'earned_at': timezone.now(),
                        'context_content': content
                    }
                )
            except Achievement.DoesNotExist:
                pass


class LearningPathViewSet(viewsets.ModelViewSet):
    """
    Comprehensive ViewSet for Learning Path Management.
    
    Provides structured learning sequences with:
    - Enrollment management
    - Progress tracking
    - Content sequencing
    - Certificate generation
    - Difficulty-based recommendations
    - Community engagement metrics
    """
    
    queryset = LearningPath.objects.select_related().prefetch_related(
        'learning_path_contents', 'path_contents__content'
    )
    serializer_class = LearningPathSerializer
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = LearningPathFilter
    search_fields = ['title', 'description', 'short_description', 'path_type']
    ordering_fields = ['created_at', 'updated_at', 'enrolled_count', 'completed_count', 'difficulty']
    ordering = ['-created_at']
    
    def get_permissions(self):
        """
        Return appropriate permissions based on action.
        
        Returns:
            list: List of permission classes
        """
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated, IsAdminUser]
        elif self.action in ['enroll', 'start', 'progress']:
            return [IsAuthenticated]
        return [IsAuthenticated]
    
    def get_queryset(self):
        """
        Optimized queryset with enrollment status for authenticated users.
        
        Returns:
            QuerySet: Filtered and optimized learning path queryset
        """
        queryset = super().get_queryset()
        
        # Filter by publication status for non-admins
        if not self.request.user.is_staff:
            queryset = queryset.filter(is_published=True)
        
        # Add enrollment status for authenticated users
        if self.request.user.is_authenticated:
            user = self.request.user
            queryset = queryset.annotate(
                is_enrolled=Case(
                    When(
                        enrollments__user=user,
                        then=Value(True)
                    ),
                    default=Value(False),
                    output_field=IntegerField()
                ),
                enrollment_status=Coalesce(
                    LearningPathEnrollment.objects.filter(
                        learning_path_id=F('id'),
                        user=user
                    ).values('status')[:1],
                    Value('NOT_ENROLLED')
                ),
                user_progress=Coalesce(
                    LearningPathEnrollment.objects.filter(
                        learning_path_id=F('id'),
                        user=user
                    ).values('progress_percentage')[:1],
                    Value(0)
                )
            )
        
        return queryset
    
    @action(detail=True, methods=['post'])
    def enroll(self, request, pk=None):
        """
        Enroll user in learning path.
        
        Returns:
            Response: Enrollment confirmation and details
        """
        learning_path = self.get_object()
        user = request.user
        
        # Check if already enrolled
        existing_enrollment = LearningPathEnrollment.objects.filter(
            user=user,
            learning_path=learning_path
        ).first()
        
        if existing_enrollment:
            return Response({
                'message': 'Already enrolled in this learning path',
                'enrollment': LearningPathEnrollmentSerializer(existing_enrollment).data
            }, status=status.HTTP_200_OK)
        
        with transaction.atomic():
            # Create enrollment
            enrollment = LearningPathEnrollment.objects.create(
                user=user,
                learning_path=learning_path,
                status='ENROLLED',
                enrolled_at=timezone.now(),
                notes=request.data.get('notes', '')
            )
            
            # Update learning path enrollment count
            learning_path.enrolled_count = F('enrolled_count') + 1
            learning_path.save()
            learning_path.refresh_from_db()
            
            # Get first content if exists
            first_content = learning_path.path_contents.order_by('order').first()
            if first_content:
                enrollment.current_content = first_content.content
                enrollment.save()
        
        return Response({
            'message': 'Successfully enrolled in learning path',
            'enrollment': LearningPathEnrollmentSerializer(enrollment).data,
            'first_content': EducationalContentSerializer(first_content.content).data if first_content else None
        }, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'])
    def start(self, request, pk=None):
        """
        Start learning path.
        
        Returns:
            Response: Started learning path confirmation
        """
        learning_path = self.get_object()
        user = request.user
        
        # Get enrollment
        enrollment = get_object_or_404(
            LearningPathEnrollment,
            user=user,
            learning_path=learning_path
        )
        
        with transaction.atomic():
            enrollment.status = 'IN_PROGRESS'
            enrollment.started_at = timezone.now()
            enrollment.save()
            
            # Get first content if not already set
            if not enrollment.current_content:
                first_content = learning_path.path_contents.order_by('order').first()
                if first_content:
                    enrollment.current_content = first_content.content
                    enrollment.save()
        
        return Response({
            'message': 'Learning path started',
            'enrollment': LearningPathEnrollmentSerializer(enrollment).data
        }, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['get'])
    def progress(self, request, pk=None):
        """
        Get detailed progress for learning path.
        
        Returns:
            Response: Comprehensive progress information
        """
        learning_path = self.get_object()
        user = request.user
        
        # Get enrollment
        enrollment = get_object_or_404(
            LearningPathEnrollment,
            user=user,
            learning_path=learning_path
        )
        
        # Get completions
        completions = ContentCompletion.objects.filter(
            enrollment=enrollment
        ).select_related('content')
        
        # Calculate time spent
        total_time_spent = completions.aggregate(
            total_time=Sum('time_spent_minutes')
        )['total_time'] or 0
        
        # Get next content
        last_completion = completions.order_by('-completed_at').first()
        next_content = None
        
        if last_completion:
            last_content_order = LearningPathContent.objects.filter(
                learning_path=learning_path,
                content=last_completion.content
            ).first().order
            
            next_path_content = LearningPathContent.objects.filter(
                learning_path=learning_path,
                order__gt=last_content_order
            ).order_by('order').first()
            
            if next_path_content:
                next_content = next_path_content.content
        
        response_data = {
            'enrollment': LearningPathEnrollmentSerializer(enrollment).data,
            'progress_details': {
                'total_contents': learning_path.contents_count,
                'completed_contents': completions.count(),
                'remaining_contents': learning_path.contents_count - completions.count(),
                'progress_percentage': enrollment.progress_percentage,
                'total_time_spent_minutes': total_time_spent,
                'average_time_per_content': completions.count() and total_time_spent / completions.count() or 0,
                'estimated_time_remaining': (learning_path.contents_count - completions.count()) * 30,  # 30 minutes average
                'next_content': EducationalContentSerializer(next_content).data if next_content else None
            },
            'completions': ContentCompletionSerializer(completions, many=True).data,
            'certificate_eligible': enrollment.progress_percentage >= 100 and learning_path.completion_certificate
        }
        
        return Response(response_data, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'])
    def recommended(self, request):
        """
        Get recommended learning paths based on user's progress.
        
        Returns:
            Response: Recommended learning paths
        """
        user = request.user
        recommendations = []
        
        if user.is_authenticated:
            # Get user's completed categories
            completed_categories = EducationalContent.objects.filter(
                user_progress__user=user,
                user_progress__status='COMPLETED'
            ).values_list('category', flat=True).distinct()
            
            # Get learning paths in those categories
            recommendations = self.get_queryset().filter(
                is_published=True,
                difficulty__in=['BEGINNER', 'INTERMEDIATE']
            ).exclude(
                enrollments__user=user
            ).order_by('-enrolled_count', '-created_at')[:6]
        
        else:
            # For anonymous users, show popular learning paths
            recommendations = self.get_queryset().filter(
                is_published=True,
                is_featured=True
            ).order_by('-enrolled_count')[:6]
        
        serializer = self.get_serializer(recommendations, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class UserProgressViewSet(viewsets.ModelViewSet):
    """
    ViewSet for User Progress Management.
    
    Provides CRUD operations for tracking user progress on educational content.
    """
    
    queryset = UserProgress.objects.select_related('user', 'content')
    serializer_class = UserProgressSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['content__title']
    ordering_fields = ['created_at', 'updated_at', 'progress_percentage']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Filter to show only current user's progress."""
        return self.queryset.filter(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def my_progress(self, request):
        """Get all progress for the current user."""
        queryset = self.get_queryset()
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class LearningPathEnrollmentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Learning Path Enrollment Management.
    
    Provides CRUD operations for managing learning path enrollments.
    """
    
    queryset = LearningPathEnrollment.objects.select_related('user', 'learning_path')
    serializer_class = LearningPathEnrollmentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['learning_path__title']
    ordering_fields = ['created_at', 'started_at', 'progress_percentage']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Filter to show only current user's enrollments."""
        return self.queryset.filter(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def my_enrollments(self, request):
        """Get all enrollments for the current user."""
        queryset = self.get_queryset()
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class SavingsChallengeViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Savings Challenge Management.
    
    Provides CRUD operations for managing savings challenges.
    """
    
    queryset = SavingsChallenge.objects.select_related('created_by')
    serializer_class = SavingsChallengeSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = SavingsChallengeFilter
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'start_date', 'end_date', 'participants_count']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return SavingsChallengeCreateSerializer
        return SavingsChallengeSerializer
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get all active savings challenges."""
        active_challenges = self.queryset.filter(
            status='ACTIVE',
            is_published=True
        ).order_by('-created_at')
        page = self.paginate_queryset(active_challenges)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(active_challenges, many=True)
        return Response(serializer.data)


class ChallengeParticipantViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Challenge Participant Management.
    
    Provides CRUD operations for managing challenge participants.
    """
    
    queryset = ChallengeParticipant.objects.select_related('user', 'challenge')
    serializer_class = ChallengeParticipantSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['challenge__title']
    ordering_fields = ['created_at', 'current_amount', 'progress_percentage']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Filter to show only current user's participations."""
        return self.queryset.filter(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def my_challenges(self, request):
        """Get all challenge participations for the current user."""
        queryset = self.get_queryset()
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class WebinarViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Webinar Management.
    
    Provides CRUD operations for managing webinars.
    """
    
    queryset = Webinar.objects.select_related('presenter')
    serializer_class = WebinarSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = WebinarFilter
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'scheduled_at', 'registered_count']
    ordering = ['scheduled_at']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return WebinarCreateSerializer
        return WebinarSerializer
    
    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """Get all upcoming webinars."""
        upcoming_webinars = self.queryset.filter(
            status='SCHEDULED',
            scheduled_at__gte=timezone.now()
        ).order_by('scheduled_at')
        page = self.paginate_queryset(upcoming_webinars)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(upcoming_webinars, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def zoom_webhook(self, request):
        """
        Handle Zoom webhook events.
        
        Note: This is a placeholder. In production, implement proper webhook
        signature validation as per Zoom's webhook security guidelines:
        https://developers.zoom.us/docs/api/rest/webhook-reference/
        """
        # TODO: Implement Zoom webhook signature validation
        # Verify webhook signature using Zoom's secret token
        # signature = request.headers.get('x-zm-signature')
        # if not self._verify_zoom_signature(signature, request.body):
        #     return Response({'error': 'Invalid signature'}, status=status.HTTP_401_UNAUTHORIZED)
        
        return Response(
            {'status': 'received', 'message': 'Webhook endpoint not yet implemented'},
            status=status.HTTP_501_NOT_IMPLEMENTED
        )


class WebinarRegistrationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Webinar Registration Management.
    
    Provides CRUD operations for managing webinar registrations.
    """
    
    queryset = WebinarRegistration.objects.select_related('user', 'webinar')
    serializer_class = WebinarRegistrationSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['webinar__title']
    ordering_fields = ['created_at', 'registered_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Filter to show only current user's registrations."""
        return self.queryset.filter(user=self.request.user)


class CertificateViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Certificate Management.
    
    Provides CRUD operations for managing certificates.
    """
    
    queryset = Certificate.objects.select_related('user', 'learning_path')
    serializer_class = CertificateSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['learning_path__title', 'certificate_id']
    ordering_fields = ['created_at', 'issued_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Filter to show only current user's certificates."""
        return self.queryset.filter(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def my_certificates(self, request):
        """Get all certificates for the current user."""
        queryset = self.get_queryset()
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def certificate_webhook(self, request):
        """
        Handle certificate webhook events.
        
        Note: This is a placeholder. In production, implement proper webhook
        authentication and validation. Consider using:
        - API key authentication
        - HMAC signature verification
        - IP allowlisting
        """
        # TODO: Implement webhook authentication and validation
        # api_key = request.headers.get('X-API-Key')
        # if not self._verify_api_key(api_key):
        #     return Response({'error': 'Invalid API key'}, status=status.HTTP_401_UNAUTHORIZED)
        
        return Response(
            {'status': 'received', 'message': 'Webhook endpoint not yet implemented'},
            status=status.HTTP_501_NOT_IMPLEMENTED
        )


class AchievementViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Achievement Management.
    
    Provides CRUD operations for managing achievements.
    All authenticated users can view available achievements to encourage engagement.
    Only staff users can create, update, or delete achievements.
    """
    
    queryset = Achievement.objects.all()
    serializer_class = AchievementSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['created_at', 'points_reward']
    ordering = ['created_at']
    
    def get_queryset(self):
        """
        Return all active achievements for viewing.
        Users should be able to see all available achievements.
        """
        if self.request.user.is_staff:
            return self.queryset
        return self.queryset.filter(is_active=True)


class UserAchievementViewSet(viewsets.ModelViewSet):
    """
    ViewSet for User Achievement Management.
    
    Provides CRUD operations for managing user achievements.
    """
    
    queryset = UserAchievement.objects.select_related('user', 'achievement')
    serializer_class = UserAchievementSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['achievement__name']
    ordering_fields = ['created_at', 'earned_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Filter to show only current user's achievements."""
        return self.queryset.filter(user=self.request.user)


class ContentCompletionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Content Completion Management.
    
    Provides CRUD operations for tracking content completions.
    """
    
    queryset = ContentCompletion.objects.select_related('user', 'content')
    serializer_class = ContentCompletionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['content__title']
    ordering_fields = ['created_at', 'completed_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Filter to show only current user's completions."""
        return self.queryset.filter(user=self.request.user)


class WebinarQnAViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Webinar Q&A Management.
    
    Provides CRUD operations for managing webinar questions and answers.
    """
    
    queryset = WebinarQnA.objects.select_related('user', 'webinar')
    serializer_class = WebinarQnASerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['question', 'answer']
    ordering_fields = ['created_at', 'answered_at']
    ordering = ['created_at']


class WebinarPollViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Webinar Poll Management.
    
    Provides CRUD operations for managing webinar polls.
    """
    
    queryset = WebinarPoll.objects.select_related('webinar')
    serializer_class = WebinarPollSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['question']
    ordering_fields = ['created_at']
    ordering = ['created_at']


class EducationDashboardViewSet(viewsets.ViewSet):
    """
    Comprehensive Education Dashboard ViewSet.
    
    Provides detailed analytics and insights for:
    - User learning progress
    - Content engagement metrics
    - Achievement tracking
    - Recommendation engine
    - Performance analytics
    - Community engagement
    """
    
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def overview(self, request):
        """
        Get comprehensive education dashboard overview.
        
        Returns:
            Response: Complete dashboard data with analytics
        """
        user = request.user
        cache_key = f'education_dashboard_{user.id}'
        cached_data = cache.get(cache_key)
        
        if cached_data:
            return Response(cached_data, status=status.HTTP_200_OK)
        
        # Calculate all stats
        stats = self._calculate_dashboard_stats(user)
        
        # Cache for 5 minutes
        cache.set(cache_key, stats, 60 * 5)
        
        return Response(stats, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'])
    def learning_stats(self, request):
        """
        Get detailed learning statistics.
        
        Returns:
            Response: Learning statistics and analytics
        """
        user = request.user
        
        # Total completions
        total_completions = UserProgress.objects.filter(
            user=user,
            status='COMPLETED'
        ).count()
        
        # Points earned
        total_points = UserProgress.objects.filter(
            user=user,
            status='COMPLETED'
        ).aggregate(
            total_points=Sum('content__points_reward')
        )['total_points'] or 0
        
        # Time spent
        total_time = UserProgress.objects.filter(
            user=user
        ).aggregate(
            total_time=Sum('time_spent_minutes')
        )['total_time'] or 0
        
        # Category breakdown
        category_breakdown = UserProgress.objects.filter(
            user=user,
            status='COMPLETED'
        ).values('content__category').annotate(
            count=Count('id'),
            total_points=Sum('content__points_reward'),
            total_time=Sum('time_spent_minutes')
        ).order_by('-count')
        
        # Weekly progress
        week_ago = timezone.now() - timedelta(days=7)
        weekly_data = UserProgress.objects.filter(
            user=user,
            completed_at__gte=week_ago
        ).extra({
            'day': "date(completed_at)"
        }).values('day').annotate(
            completions=Count('id'),
            points=Sum('content__points_reward')
        ).order_by('day')
        
        # Streak calculation
        streak = self._calculate_learning_streak(user)
        
        stats = {
            'total_completions': total_completions,
            'total_points': total_points,
            'total_time_minutes': total_time,
            'category_breakdown': list(category_breakdown),
            'weekly_progress': list(weekly_data),
            'current_streak': streak,
            'average_daily_learning': total_time / max(1, (timezone.now() - user.date_joined).days),
            'completion_rate': self._calculate_completion_rate(user)
        }
        
        return Response(stats, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'])
    def user_engagement(self, request):
        """
        Get user engagement metrics.
        
        Returns:
            Response: Engagement statistics
        """
        user = request.user
        
        # Recent activity
        recent_activity = UserProgress.objects.filter(
            user=user
        ).select_related('content').order_by('-completed_at', '-started_at')[:10]
        
        # Learning path progress
        enrollments = LearningPathEnrollment.objects.filter(
            user=user
        ).select_related('learning_path').order_by('-last_accessed_at')
        
        # Challenge participation
        challenges = ChallengeParticipant.objects.filter(
            user=user
        ).select_related('challenge').order_by('-last_activity_at')
        
        engagement_data = {
            'recent_activity': UserProgressSerializer(recent_activity, many=True).data,
            'active_enrollments': LearningPathEnrollmentSerializer(
                enrollments.filter(status='IN_PROGRESS'), many=True
            ).data,
            'challenge_participation': ChallengeParticipantSerializer(challenges, many=True).data,
            'daily_engagement': self._calculate_daily_engagement(user),
            'preferred_learning_time': self._calculate_preferred_learning_time(user),
            'content_preferences': self._calculate_content_preferences(user)
        }
        
        return Response(engagement_data, status=status.HTTP_200_OK)
    
    def _calculate_dashboard_stats(self, user):
        """
        Calculate comprehensive dashboard statistics.
        
        Args:
            user: User object
            
        Returns:
            dict: Dashboard statistics
        """
        # Basic stats
        total_completed = UserProgress.objects.filter(
            user=user,
            status='COMPLETED'
        ).count()
        
        total_points = UserProgress.objects.filter(
            user=user,
            status='COMPLETED'
        ).aggregate(
            total_points=Sum('content__points_reward')
        )['total_points'] or 0
        
        # Active learning
        active_enrollments = LearningPathEnrollment.objects.filter(
            user=user,
            status='IN_PROGRESS'
        ).count()
        
        # Achievements
        achievements_unlocked = UserAchievement.objects.filter(
            user=user,
            is_unlocked=True
        ).count()
        
        # Certificates
        certificates_earned = Certificate.objects.filter(user=user).count()
        
        # Recent completions
        recent_completions = UserProgress.objects.filter(
            user=user,
            status='COMPLETED'
        ).select_related('content').order_by('-completed_at')[:5]
        
        # Upcoming webinars
        upcoming_webinars = WebinarRegistration.objects.filter(
            user=user,
            webinar__status='SCHEDULED',
            webinar__scheduled_at__gt=timezone.now()
        ).select_related('webinar').order_by('webinar__scheduled_at')[:3]
        
        # Active challenges
        active_challenges = ChallengeParticipant.objects.filter(
            user=user,
            challenge__status='ACTIVE',
            completed=False
        ).select_related('challenge')[:3]
        
        # Recommendations
        recommendations = EducationalContent.objects.filter(
            is_published=True
        ).exclude(
            user_progress__user=user,
            user_progress__status='COMPLETED'
        ).order_by('?')[:3]
        
        return {
            'summary': {
                'total_completed': total_completed,
                'total_points': total_points,
                'active_enrollments': active_enrollments,
                'achievements_unlocked': achievements_unlocked,
                'certificates_earned': certificates_earned,
                'learning_streak': self._calculate_learning_streak(user),
                'weekly_goal_progress': self._calculate_weekly_goal_progress(user)
            },
            'recent_activity': [
                {
                    'type': 'content_completed',
                    'title': progress.content.title,
                    'description': f"Completed {progress.content.content_type.lower()}",
                    'date': progress.completed_at,
                    'points': progress.content.points_reward,
                    'content_type': progress.content.content_type,
                    'difficulty': progress.content.difficulty
                }
                for progress in recent_completions
            ],
            'upcoming_webinars': WebinarSerializer(
                [wr.webinar for wr in upcoming_webinars], many=True
            ).data if upcoming_webinars else [],
            'active_challenges': SavingsChallengeSerializer(
                [cp.challenge for cp in active_challenges], many=True
            ).data if active_challenges else [],
            'recommendations': EducationalContentSerializer(recommendations, many=True).data,
            'quick_stats': self._calculate_quick_stats(user)
        }
    
    def _calculate_learning_streak(self, user):
        """
        Calculate user's current learning streak.
        
        Args:
            user: User object
            
        Returns:
            int: Current streak in days
        """
        today = timezone.now().date()
        streak = 0
        current_date = today
        
        while True:
            has_activity = UserProgress.objects.filter(
                user=user,
                completed_at__date=current_date
            ).exists() or LearningPathEnrollment.objects.filter(
                user=user,
                last_accessed_at__date=current_date
            ).exists()
            
            if has_activity:
                streak += 1
                current_date -= timedelta(days=1)
            else:
                break
        
        return streak
    
    def _calculate_completion_rate(self, user):
        """
        Calculate user's content completion rate.
        
        Args:
            user: User object
            
        Returns:
            float: Completion rate percentage
        """
        total_started = UserProgress.objects.filter(user=user).count()
        total_completed = UserProgress.objects.filter(
            user=user,
            status='COMPLETED'
        ).count()
        
        return (total_completed / total_started * 100) if total_started > 0 else 0
    
    def _calculate_daily_engagement(self, user):
        """
        Calculate daily engagement patterns.
        
        Args:
            user: User object
            
        Returns:
            dict: Daily engagement data
        """
        thirty_days_ago = timezone.now() - timedelta(days=30)
        
        daily_engagement = UserProgress.objects.filter(
            user=user,
            completed_at__gte=thirty_days_ago
        ).extra({
            'date': "date(completed_at)"
        }).values('date').annotate(
            sessions=Count('id', distinct=True),
            minutes=Sum('time_spent_minutes'),
            completions=Count('id', filter=Q(status='COMPLETED'))
        ).order_by('date')
        
        return list(daily_engagement)
    
    def _calculate_preferred_learning_time(self, user):
        """
        Calculate user's preferred learning time.
        
        Args:
            user: User object
            
        Returns:
            dict: Preferred learning time data
        """
        time_data = UserProgress.objects.filter(
            user=user,
            completed_at__isnull=False
        ).extra({
            'hour': "extract(hour from completed_at)"
        }).values('hour').annotate(
            count=Count('id')
        ).order_by('hour')
        
        return list(time_data)
    
    def _calculate_content_preferences(self, user):
        """
        Calculate user's content preferences.
        
        Args:
            user: User object
            
        Returns:
            dict: Content preference data
        """
        preferences = UserProgress.objects.filter(
            user=user
        ).values(
            'content__content_type',
            'content__category',
            'content__difficulty'
        ).annotate(
            count=Count('id'),
            total_time=Sum('time_spent_minutes'),
            completion_rate=Avg(
                Case(
                    When(status='COMPLETED', then=1),
                    default=0,
                    output_field=IntegerField()
                )
            )
        ).order_by('-count')
        
        return list(preferences)
    
    def _calculate_weekly_goal_progress(self, user):
        """
        Calculate weekly learning goal progress.
        
        Args:
            user: User object
            
        Returns:
            dict: Weekly goal progress
        """
        week_start = timezone.now() - timedelta(days=timezone.now().weekday())
        week_end = week_start + timedelta(days=6)
        
        weekly_completions = UserProgress.objects.filter(
            user=user,
            status='COMPLETED',
            completed_at__range=[week_start, week_end]
        ).count()
        
        weekly_points = UserProgress.objects.filter(
            user=user,
            status='COMPLETED',
            completed_at__range=[week_start, week_end]
        ).aggregate(
            points=Sum('content__points_reward')
        )['points'] or 0
        
        # Default goal: 5 completions, 500 points per week
        goal_completions = 5
        goal_points = 500
        
        return {
            'completions': {
                'current': weekly_completions,
                'goal': goal_completions,
                'progress': (weekly_completions / goal_completions * 100) if goal_completions > 0 else 0
            },
            'points': {
                'current': weekly_points,
                'goal': goal_points,
                'progress': (weekly_points / goal_points * 100) if goal_points > 0 else 0
            }
        }
    
    def _calculate_quick_stats(self, user):
        """
        Calculate quick stats for dashboard.
        
        Args:
            user: User object
            
        Returns:
            dict: Quick stats
        """
        today = timezone.now().date()
        
        today_completions = UserProgress.objects.filter(
            user=user,
            status='COMPLETED',
            completed_at__date=today
        ).count()
        
        today_points = UserProgress.objects.filter(
            user=user,
            status='COMPLETED',
            completed_at__date=today
        ).aggregate(
            points=Sum('content__points_reward')
        )['points'] or 0
        
        this_week_completions = UserProgress.objects.filter(
            user=user,
            status='COMPLETED',
            completed_at__gte=today - timedelta(days=today.weekday())
        ).count()
        
        return {
            'today_completions': today_completions,
            'today_points': today_points,
            'this_week_completions': this_week_completions,
            'average_daily_completions': self._calculate_average_daily_completions(user),
            'favorite_category': self._calculate_favorite_category(user),
            'most_productive_day': self._calculate_most_productive_day(user)
        }
    
    def _calculate_average_daily_completions(self, user):
        """
        Calculate average daily completions.
        
        Args:
            user: User object
            
        Returns:
            float: Average daily completions
        """
        total_completions = UserProgress.objects.filter(
            user=user,
            status='COMPLETED'
        ).count()
        
        days_active = max(1, (timezone.now() - user.date_joined).days)
        
        return total_completions / days_active
    
    def _calculate_favorite_category(self, user):
        """
        Calculate user's favorite learning category.
        
        Args:
            user: User object
            
        Returns:
            str: Favorite category
        """
        favorite = UserProgress.objects.filter(
            user=user,
            status='COMPLETED'
        ).values('content__category').annotate(
            count=Count('id')
        ).order_by('-count').first()
        
        return favorite['content__category'] if favorite else 'None'
    
    def _calculate_most_productive_day(self, user):
        """
        Calculate user's most productive day of week.
        
        Args:
            user: User object
            
        Returns:
            str: Most productive day
        """
        day_data = UserProgress.objects.filter(
            user=user,
            status='COMPLETED'
        ).extra({
            'day_of_week': "extract(dow from completed_at)"
        }).values('day_of_week').annotate(
            count=Count('id')
        ).order_by('-count').first()
        
        days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        return days[int(day_data['day_of_week'])] if day_data else 'Unknown'


# Add other enhanced viewsets similarly...