"""
Education Hub Views Module.

This module provides comprehensive API views for the education hub feature.
It includes viewsets for educational content, learning paths, progress tracking,
webinars, savings challenges, certificates, and dashboard analytics.

Key Viewsets:
- EducationalContentViewSet: Manages educational content with progress tracking
- LearningPathViewSet: Handles learning paths and enrollments
- WebinarViewSet: Manages webinars with registration and attendance
- SavingsChallengeViewSet: Handles savings challenges with leaderboards
- EducationDashboardViewSet: Provides analytics and user insights

All viewsets include custom actions for specific functionality beyond basic CRUD.
"""

from rest_framework import viewsets, status, filters, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count, Sum, Avg, F, Value
from django.db.models.functions import Coalesce
from django.utils import timezone
from datetime import timedelta
import uuid
import json

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
    QuizSubmissionSerializer
)
from .filters import (
    EducationalContentFilter, LearningPathFilter,
    SavingsChallengeFilter, WebinarFilter
)
from .permissions import (
    IsContentAuthor, IsLearningPathOwner, IsChallengeCreator,
    IsWebinarPresenter
)


# Educational Content Views
class EducationalContentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing educational content.
    
    Provides CRUD operations for educational content with additional
    actions for progress tracking, quiz submission, and bookmarking.
    
    Endpoints:
        GET /api/v1/education/educational-contents/ - List all content
        POST /api/v1/education/educational-contents/ - Create new content
        GET /api/v1/education/educational-contents/{id}/ - Retrieve content
        PUT/PATCH /api/v1/education/educational-contents/{id}/ - Update content
        DELETE /api/v1/education/educational-contents/{id}/ - Delete content
        
    Custom Actions:
        POST /api/v1/education/educational-contents/{id}/start_progress/ - Start progress
        POST /api/v1/education/educational-contents/{id}/update_progress/ - Update progress
        POST /api/v1/education/educational-contents/{id}/submit_quiz/ - Submit quiz
        POST /api/v1/education/educational-contents/{id}/bookmark/ - Bookmark content
        GET /api/v1/education/educational-contents/bookmarked/ - Get bookmarked content
        GET /api/v1/education/educational-contents/recommended/ - Get recommended content
    """
    
    queryset = EducationalContent.objects.all()
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = EducationalContentFilter
    search_fields = ['title', 'description', 'content', 'tags']
    ordering_fields = ['created_at', 'updated_at', 'views_count', 'points_reward']
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        """
        Return appropriate serializer class based on action.
        
        Returns:
            Serializer: Appropriate serializer class
        """
        if self.action in ['create', 'update', 'partial_update']:
            return EducationalContentCreateSerializer
        return EducationalContentSerializer
    
    def get_queryset(self):
        """
        Filter queryset based on query parameters and user permissions.
        
        Returns:
            QuerySet: Filtered educational content queryset
        """
        queryset = super().get_queryset()
        
        # Filter by user progress if requested
        status_filter = self.request.query_params.get('progress_status')
        user = self.request.user
        
        if status_filter and user.is_authenticated:
            if status_filter == 'completed':
                completed_ids = UserProgress.objects.filter(
                    user=user, status='COMPLETED'
                ).values_list('content_id', flat=True)
                queryset = queryset.filter(id__in=completed_ids)
            elif status_filter == 'in_progress':
                in_progress_ids = UserProgress.objects.filter(
                    user=user, status='IN_PROGRESS'
                ).values_list('content_id', flat=True)
                queryset = queryset.filter(id__in=in_progress_ids)
            elif status_filter == 'not_started':
                started_ids = UserProgress.objects.filter(
                    user=user
                ).values_list('content_id', flat=True)
                queryset = queryset.exclude(id__in=started_ids)
        
        # Filter by difficulty and category
        difficulty = self.request.query_params.get('difficulty')
        if difficulty:
            queryset = queryset.filter(difficulty=difficulty)
        
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category=category)
        
        # Only show published content for non-authors
        if not self.request.user.is_staff:
            queryset = queryset.filter(is_published=True)
        
        return queryset
    
    def perform_create(self, serializer):
        """
        Set the author when creating educational content.
        
        Args:
            serializer: Serializer instance
        """
        serializer.save(author=self.request.user)
    
    @action(detail=True, methods=['post'])
    def start_progress(self, request, pk=None):
        """Start tracking progress on content."""
        content = self.get_object()
        user = request.user
        
        # Check if progress already exists
        progress, created = UserProgress.objects.get_or_create(
            user=user,
            content=content,
            defaults={
                'status': 'IN_PROGRESS',
                'progress_percentage': 0,
                'started_at': timezone.now()
            }
        )
        
        if not created:
            progress.status = 'IN_PROGRESS'
            progress.save()
        
        # Increment views count
        content.views_count = F('views_count') + 1
        content.save()
        content.refresh_from_db()
        
        return Response({
            'message': 'Progress tracking started',
            'progress': UserProgressSerializer(progress).data
        })
    
    @action(detail=True, methods=['post'])
    def update_progress(self, request, pk=None):
        """Update progress percentage."""
        content = self.get_object()
        user = request.user
        
        try:
            progress = UserProgress.objects.get(user=user, content=content)
        except UserProgress.DoesNotExist:
            return Response(
                {'error': 'Progress not found. Start progress first.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        progress_percentage = request.data.get('progress_percentage', 0)
        last_position = request.data.get('last_position', 0)
        bookmarked = request.data.get('bookmarked')
        
        if progress_percentage < 0 or progress_percentage > 100:
            return Response(
                {'error': 'Progress percentage must be between 0 and 100'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        progress.progress_percentage = progress_percentage
        progress.last_position = last_position
        
        if bookmarked is not None:
            progress.bookmarked = bookmarked
        
        if progress_percentage == 100:
            progress.status = 'COMPLETED'
            progress.completed_at = timezone.now()
        
        progress.save()
        
        return Response({
            'message': 'Progress updated',
            'progress': UserProgressSerializer(progress).data
        })
    
    @action(detail=True, methods=['post'])
    def submit_quiz(self, request, pk=None):
        """Submit quiz answers and calculate score."""
        content = self.get_object()
        user = request.user
        
        if content.content_type != 'QUIZ':
            return Response(
                {'error': 'This content is not a quiz'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = QuizSubmissionSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        answers = serializer.validated_data['answers']
        time_spent = serializer.validated_data.get('time_spent_minutes', 0)
        
        # Calculate score (simplified - implement your own logic)
        correct_answers = 0
        total_questions = len(content.quiz_questions) if content.quiz_questions else 0
        
        if total_questions > 0:
            for i, question in enumerate(content.quiz_questions):
                user_answer = answers.get(str(i))
                correct_answer = question.get('correct_answer')
                
                if user_answer == correct_answer:
                    correct_answers += 1
            
            score = (correct_answers / total_questions) * 100
        else:
            score = 0
        
        # Update or create progress
        progress, created = UserProgress.objects.update_or_create(
            user=user,
            content=content,
            defaults={
                'status': 'COMPLETED',
                'progress_percentage': 100,
                'quiz_score': score,
                'quiz_answers': answers,
                'completed_at': timezone.now(),
                'time_spent_minutes': time_spent,
                'started_at': timezone.now() if created else F('started_at')
            }
        )
        
        # Award points
        if score >= content.passing_score:
            # Add user points logic here
            pass
        
        return Response({
            'message': 'Quiz submitted successfully',
            'score': score,
            'passed': score >= content.passing_score,
            'correct_answers': correct_answers,
            'total_questions': total_questions,
            'progress': UserProgressSerializer(progress).data
        })
    
    @action(detail=True, methods=['post'])
    def bookmark(self, request, pk=None):
        """Bookmark content."""
        content = self.get_object()
        user = request.user
        
        progress, created = UserProgress.objects.get_or_create(
            user=user,
            content=content,
            defaults={'bookmarked': True}
        )
        
        if not created:
            progress.bookmarked = not progress.bookmarked
            progress.save()
        
        return Response({
            'message': 'Bookmark toggled',
            'bookmarked': progress.bookmarked
        })
    
    @action(detail=False, methods=['get'])
    def bookmarked(self, request):
        """Get bookmarked content."""
        user = request.user
        bookmarked_progress = UserProgress.objects.filter(
            user=user,
            bookmarked=True
        ).select_related('content')
        
        contents = [progress.content for progress in bookmarked_progress]
        serializer = self.get_serializer(contents, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def recommended(self, request):
        """Get recommended content based on user's progress and interests."""
        user = request.user
        
        # Get user's completed categories
        completed_categories = UserProgress.objects.filter(
            user=user,
            status='COMPLETED'
        ).values_list('content__category', flat=True).distinct()
        
        # Get content in same categories but not completed
        queryset = EducationalContent.objects.filter(
            category__in=completed_categories,
            is_published=True
        ).exclude(
            user_progress__user=user,
            user_progress__status='COMPLETED'
        ).order_by('?')[:10]  # Random 10 items
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


# Learning Path Views
class LearningPathViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing learning paths.
    
    Provides CRUD operations for learning paths with additional
    actions for enrollment, progress tracking, and content completion.
    
    Endpoints:
        GET /api/v1/education/learning-paths/ - List all learning paths
        POST /api/v1/education/learning-paths/ - Create new learning path
        GET /api/v1/education/learning-paths/{id}/ - Retrieve learning path
        PUT/PATCH /api/v1/education/learning-paths/{id}/ - Update learning path
        DELETE /api/v1/education/learning-paths/{id}/ - Delete learning path
        
    Custom Actions:
        POST /api/v1/education/learning-paths/{id}/enroll/ - Enroll in learning path
        POST /api/v1/education/learning-paths/{id}/start/ - Start learning path
        POST /api/v1/education/learning-paths/{id}/complete_content/ - Complete content
        GET /api/v1/education/learning-paths/{id}/progress/ - Get progress
        GET /api/v1/education/learning-paths/my_paths/ - Get user's learning paths
    """
    
    queryset = LearningPath.objects.all()
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = LearningPathFilter
    search_fields = ['title', 'description', 'short_description']
    ordering_fields = ['created_at', 'updated_at', 'enrolled_count', 'difficulty']
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        """
        Return appropriate serializer class based on action.
        
        Returns:
            Serializer: Appropriate serializer class
        """
        if self.action in ['create', 'update', 'partial_update']:
            return LearningPathCreateSerializer
        return LearningPathSerializer
    
    def get_queryset(self):
        """
        Filter queryset based on query parameters and user enrollment.
        
        Returns:
            QuerySet: Filtered learning paths queryset
        """
        queryset = super().get_queryset()
        
        # Filter by user enrollment
        enrollment_status = self.request.query_params.get('enrollment_status')
        user = self.request.user
        
        if enrollment_status and user.is_authenticated:
            if enrollment_status == 'enrolled':
                enrolled_ids = LearningPathEnrollment.objects.filter(
                    user=user
                ).values_list('learning_path_id', flat=True)
                queryset = queryset.filter(id__in=enrolled_ids)
            elif enrollment_status == 'not_enrolled':
                enrolled_ids = LearningPathEnrollment.objects.filter(
                    user=user
                ).values_list('learning_path_id', flat=True)
                queryset = queryset.exclude(id__in=enrolled_ids)
        
        # Filter by difficulty
        difficulty = self.request.query_params.get('difficulty')
        if difficulty:
            queryset = queryset.filter(difficulty=difficulty)
        
        # Filter by path type
        path_type = self.request.query_params.get('path_type')
        if path_type:
            queryset = queryset.filter(path_type=path_type)
        
        # Only show published paths for non-admins
        if not self.request.user.is_staff:
            queryset = queryset.filter(is_published=True)
        
        return queryset
    
    @action(detail=True, methods=['post'])
    def enroll(self, request, pk=None):
        """Enroll user in learning path."""
        learning_path = self.get_object()
        user = request.user
        
        # Check if already enrolled
        if LearningPathEnrollment.objects.filter(
            user=user,
            learning_path=learning_path
        ).exists():
            return Response(
                {'error': 'Already enrolled in this learning path'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create enrollment
        enrollment = LearningPathEnrollment.objects.create(
            user=user,
            learning_path=learning_path,
            status='ENROLLED',
            enrolled_at=timezone.now()
        )
        
        # Update enrollment count
        learning_path.enrolled_count = F('enrolled_count') + 1
        learning_path.save()
        learning_path.refresh_from_db()
        
        return Response({
            'message': 'Successfully enrolled in learning path',
            'enrollment': LearningPathEnrollmentSerializer(enrollment).data
        })
    
    @action(detail=True, methods=['post'])
    def start(self, request, pk=None):
        """Start the learning path."""
        learning_path = self.get_object()
        user = request.user
        
        try:
            enrollment = LearningPathEnrollment.objects.get(
                user=user,
                learning_path=learning_path
            )
        except LearningPathEnrollment.DoesNotExist:
            return Response(
                {'error': 'Not enrolled in this learning path'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Get first content
        first_content = learning_path.path_contents.order_by('order').first()
        if not first_content:
            return Response(
                {'error': 'Learning path has no content'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        enrollment.status = 'IN_PROGRESS'
        enrollment.started_at = timezone.now()
        enrollment.current_content = first_content.content
        enrollment.save()
        
        return Response({
            'message': 'Learning path started',
            'enrollment': LearningPathEnrollmentSerializer(enrollment).data,
            'current_content': EducationalContentSerializer(first_content.content).data
        })
    
    @action(detail=True, methods=['post'])
    def complete_content(self, request, pk=None):
        """Mark content as completed within learning path."""
        learning_path = self.get_object()
        user = request.user
        
        content_id = request.data.get('content_id')
        if not content_id:
            return Response(
                {'error': 'content_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            enrollment = LearningPathEnrollment.objects.get(
                user=user,
                learning_path=learning_path
            )
        except LearningPathEnrollment.DoesNotExist:
            return Response(
                {'error': 'Not enrolled in this learning path'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        try:
            content = EducationalContent.objects.get(id=content_id)
        except EducationalContent.DoesNotExist:
            return Response(
                {'error': 'Content not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if content is in learning path
        if not learning_path.learning_path_contents.filter(content=content).exists():
            return Response(
                {'error': 'Content not in this learning path'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create completion record
        completion, created = ContentCompletion.objects.get_or_create(
            enrollment=enrollment,
            content=content,
            defaults={
                'passed': True,
                'completed_at': timezone.now()
            }
        )
        
        # Add to completed contents
        enrollment.completed_contents.add(content)
        
        # Update enrollment progress
        enrollment.update_progress()
        
        # Get next content
        next_content = learning_path.path_contents.filter(
            order__gt=content.path_assignments.get(learning_path=learning_path).order
        ).order_by('order').first()
        
        if next_content:
            enrollment.current_content = next_content.content
            enrollment.save()
        
        # Check if path is completed
        if enrollment.progress_percentage == 100:
            enrollment.status = 'COMPLETED'
            enrollment.completed_at = timezone.now()
            enrollment.save()
            
            # Award certificate
            Certificate.objects.create(
                user=user,
                learning_path=learning_path,
                title=f"Certificate of Completion: {learning_path.title}",
                description=f"Awarded for completing the {learning_path.title} learning path",
                grade='PASS'
            )
            
            # Update learning path completion count
            learning_path.completed_count = F('completed_count') + 1
            learning_path.save()
        
        return Response({
            'message': 'Content marked as completed',
            'completion': ContentCompletionSerializer(completion).data,
            'enrollment': LearningPathEnrollmentSerializer(enrollment).data,
            'next_content': EducationalContentSerializer(next_content.content).data if next_content else None,
            'path_completed': enrollment.progress_percentage == 100
        })
    
    @action(detail=True, methods=['get'])
    def progress(self, request, pk=None):
        """Get user's progress in learning path."""
        learning_path = self.get_object()
        user = request.user
        
        try:
            enrollment = LearningPathEnrollment.objects.get(
                user=user,
                learning_path=learning_path
            )
        except LearningPathEnrollment.DoesNotExist:
            return Response(
                {'error': 'Not enrolled in this learning path'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        completions = ContentCompletion.objects.filter(
            enrollment=enrollment
        ).select_related('content')
        
        response_data = {
            'enrollment': LearningPathEnrollmentSerializer(enrollment).data,
            'completions': ContentCompletionSerializer(completions, many=True).data,
            'path_details': {
                'total_contents': learning_path.contents_count,
                'completed_contents': completions.count(),
                'remaining_contents': learning_path.contents_count - completions.count(),
                'estimated_time_remaining': max(0, learning_path.total_duration_hours * 60 - 
                                               sum(c.time_spent_minutes for c in completions))
            }
        }
        
        return Response(response_data)
    
    @action(detail=False, methods=['get'])
    def my_paths(self, request):
        """Get learning paths the user is enrolled in."""
        user = request.user
        
        enrollments = LearningPathEnrollment.objects.filter(
            user=user
        ).select_related('learning_path')
        
        learning_paths = [enrollment.learning_path for enrollment in enrollments]
        serializer = self.get_serializer(learning_paths, many=True)
        
        return Response(serializer.data)


# User Progress Views
class UserProgressViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing user progress on educational content.
    
    Provides CRUD operations for user progress tracking with
    additional actions for statistics and analytics.
    
    Endpoints:
        GET /api/v1/education/user-progress/ - List user's progress
        POST /api/v1/education/user-progress/ - Create progress record
        GET /api/v1/education/user-progress/{id}/ - Retrieve progress
        PUT/PATCH /api/v1/education/user-progress/{id}/ - Update progress
        DELETE /api/v1/education/user-progress/{id}/ - Delete progress
        
    Custom Actions:
        GET /api/v1/education/user-progress/stats/ - Get learning statistics
    """
    
    serializer_class = UserProgressSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    ordering_fields = ['started_at', 'completed_at', 'progress_percentage']
    
    def get_queryset(self):
        """
        Return only the current user's progress records.
        
        Returns:
            QuerySet: User's progress queryset
        """
        return UserProgress.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        """
        Set the user when creating progress records.
        
        Args:
            serializer: Serializer instance
        """
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get learning statistics for the user."""
        user = request.user
        
        # Calculate stats
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
        
        total_time = UserProgress.objects.filter(
            user=user
        ).aggregate(
            total_time=Sum('time_spent_minutes')
        )['total_time'] or 0
        
        active_enrollments = LearningPathEnrollment.objects.filter(
            user=user,
            status='IN_PROGRESS'
        ).count()
        
        certificates_earned = Certificate.objects.filter(user=user).count()
        achievements_unlocked = UserAchievement.objects.filter(
            user=user,
            is_unlocked=True
        ).count()
        
        # Weekly progress
        week_ago = timezone.now() - timedelta(days=7)
        weekly_completions = UserProgress.objects.filter(
            user=user,
            status='COMPLETED',
            completed_at__gte=week_ago
        ).count()
        
        # Category breakdown
        category_breakdown = UserProgress.objects.filter(
            user=user,
            status='COMPLETED'
        ).values('content__category').annotate(
            count=Count('id')
        ).order_by('-count')
        
        # Recent activity
        recent_activity = UserProgress.objects.filter(
            user=user
        ).select_related('content').order_by('-completed_at')[:10]
        
        recent_activity_data = []
        for progress in recent_activity:
            recent_activity_data.append({
                'content_title': progress.content.title,
                'status': progress.status,
                'progress': progress.progress_percentage,
                'completed_at': progress.completed_at,
                'content_type': progress.content.content_type
            })
        
        stats = {
            'total_contents_completed': total_completed,
            'total_points_earned': total_points,
            'total_time_spent_minutes': total_time,
            'active_enrollments': active_enrollments,
            'certificates_earned': certificates_earned,
            'achievements_unlocked': achievements_unlocked,
            'weekly_completions': weekly_completions,
            'category_breakdown': list(category_breakdown),
            'recent_activity': recent_activity_data
        }
        
        serializer = LearningStatsSerializer(stats)
        return Response(serializer.data)


# Savings Challenge Views
class SavingsChallengeViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing savings challenges.
    
    Provides CRUD operations for savings challenges with additional
    actions for joining, updating savings, leaderboards, and lesson completion.
    
    Endpoints:
        GET /api/v1/education/savings-challenges/ - List all challenges
        POST /api/v1/education/savings-challenges/ - Create new challenge
        GET /api/v1/education/savings-challenges/{id}/ - Retrieve challenge
        PUT/PATCH /api/v1/education/savings-challenges/{id}/ - Update challenge
        DELETE /api/v1/education/savings-challenges/{id}/ - Delete challenge
        
    Custom Actions:
        POST /api/v1/education/savings-challenges/{id}/join/ - Join challenge
        POST /api/v1/education/savings-challenges/{id}/update_savings/ - Update savings
        GET /api/v1/education/savings-challenges/{id}/leaderboard/ - Get leaderboard
        POST /api/v1/education/savings-challenges/{id}/complete_lesson/ - Complete lesson
    """
    
    queryset = SavingsChallenge.objects.all()
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = SavingsChallengeFilter
    search_fields = ['title', 'description', 'short_description']
    ordering_fields = ['start_date', 'end_date', 'participants_count', 'target_amount']
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        """
        Return appropriate serializer class based on action.
        
        Returns:
            Serializer: Appropriate serializer class
        """
        if self.action in ['create', 'update', 'partial_update']:
            return SavingsChallengeCreateSerializer
        return SavingsChallengeSerializer
    
    def perform_create(self, serializer):
        """
        Set the creator when creating savings challenges.
        
        Args:
            serializer: Serializer instance
        """
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def join(self, request, pk=None):
        """Join a savings challenge."""
        challenge = self.get_object()
        user = request.user
        
        # Check challenge status
        if challenge.status not in ['UPCOMING', 'ACTIVE']:
            return Response(
                {'error': 'Challenge is not open for participation'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if already participating
        if ChallengeParticipant.objects.filter(
            challenge=challenge,
            user=user
        ).exists():
            return Response(
                {'error': 'Already participating in this challenge'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check participant limit
        if challenge.participants_count >= challenge.max_participants:
            return Response(
                {'error': 'Challenge is full'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create participant
        participant = ChallengeParticipant.objects.create(
            challenge=challenge,
            user=user,
            target_amount=challenge.target_amount,
            started_at=timezone.now()
        )
        
        # Update challenge counts
        challenge.participants_count = F('participants_count') + 1
        challenge.save()
        challenge.refresh_from_db()
        
        return Response({
            'message': 'Successfully joined challenge',
            'participant': ChallengeParticipantSerializer(participant).data
        })
    
    @action(detail=True, methods=['post'])
    def update_savings(self, request, pk=None):
        """Update savings amount for challenge."""
        challenge = self.get_object()
        user = request.user
        
        amount = request.data.get('amount')
        if not amount:
            return Response(
                {'error': 'Amount is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            participant = ChallengeParticipant.objects.get(
                challenge=challenge,
                user=user
            )
        except ChallengeParticipant.DoesNotExist:
            return Response(
                {'error': 'Not participating in this challenge'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Update savings
        participant.current_amount += float(amount)
        participant.update_progress()
        
        # Update challenge total
        challenge.total_amount_saved = F('total_amount_saved') + float(amount)
        challenge.save()
        challenge.refresh_from_db()
        
        # Check and award completion
        if participant.completed and not participant.completed_at:
            participant.completed_at = timezone.now()
            participant.save()
            
            # Award points
            # Add points logic here
        
        return Response({
            'message': 'Savings updated',
            'participant': ChallengeParticipantSerializer(participant).data,
            'challenge_progress': {
                'total_saved': challenge.total_amount_saved,
                'participants_count': challenge.participants_count
            }
        })
    
    @action(detail=True, methods=['get'])
    def leaderboard(self, request, pk=None):
        """Get challenge leaderboard."""
        challenge = self.get_object()
        
        participants = ChallengeParticipant.objects.filter(
            challenge=challenge
        ).select_related('user').order_by('-current_amount')
        
        leaderboard_data = []
        for i, participant in enumerate(participants, 1):
            leaderboard_data.append({
                'rank': i,
                'user': {
                    'id': participant.user.id,
                    'name': participant.user.get_full_name(),
                    'profile_picture': participant.user.profile_picture
                },
                'current_amount': participant.current_amount,
                'progress_percentage': participant.progress_percentage,
                'completed': participant.completed,
                'streak_days': participant.streak_days
            })
        
        return Response(leaderboard_data)
    
    @action(detail=True, methods=['post'])
    def complete_lesson(self, request, pk=None):
        """Mark educational content as completed for challenge."""
        challenge = self.get_object()
        user = request.user
        
        content_id = request.data.get('content_id')
        if not content_id:
            return Response(
                {'error': 'content_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            participant = ChallengeParticipant.objects.get(
                challenge=challenge,
                user=user
            )
        except ChallengeParticipant.DoesNotExist:
            return Response(
                {'error': 'Not participating in this challenge'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        try:
            content = EducationalContent.objects.get(id=content_id)
        except EducationalContent.DoesNotExist:
            return Response(
                {'error': 'Content not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if content is linked to challenge
        if not challenge.educational_content.filter(id=content_id).exists():
            return Response(
                {'error': 'Content not part of this challenge'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Add to completed lessons
        participant.completed_lessons.add(content)
        
        # Update learning progress
        total_lessons = challenge.educational_content.count()
        completed_lessons = participant.completed_lessons.count()
        participant.learning_progress = int((completed_lessons / total_lessons) * 100) if total_lessons > 0 else 0
        participant.save()
        
        return Response({
            'message': 'Lesson marked as completed',
            'learning_progress': participant.learning_progress,
            'completed_lessons': completed_lessons,
            'total_lessons': total_lessons
        })


# Webinar Views
class WebinarViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing webinars.
    
    Provides CRUD operations for webinars with additional
    actions for registration, check-in, live streaming, and Q&A.
    
    Endpoints:
        GET /api/v1/education/webinars/ - List all webinars
        POST /api/v1/education/webinars/ - Create new webinar
        GET /api/v1/education/webinars/{id}/ - Retrieve webinar
        PUT/PATCH /api/v1/education/webinars/{id}/ - Update webinar
        DELETE /api/v1/education/webinars/{id}/ - Delete webinar
        
    Custom Actions:
        POST /api/v1/education/webinars/{id}/register/ - Register for webinar
        POST /api/v1/education/webinars/{id}/checkin/ - Check-in for attendance
        POST /api/v1/education/webinars/{id}/start_live/ - Start webinar (presenter)
        POST /api/v1/education/webinars/{id}/end_live/ - End webinar (presenter)
        GET /api/v1/education/webinars/{id}/attendees/ - Get attendees
        POST /api/v1/education/webinars/{id}/submit_feedback/ - Submit feedback
        GET /api/v1/education/webinars/{id}/questions/ - Get Q&A
        POST /api/v1/education/webinars/{id}/ask_question/ - Ask question
    """
    
    queryset = Webinar.objects.all()
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = WebinarFilter
    search_fields = ['title', 'description', 'short_description', 'presenter__first_name', 'presenter__last_name']
    ordering_fields = ['scheduled_at', 'created_at', 'registered_count']
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        """
        Return appropriate serializer class based on action.
        
        Returns:
            Serializer: Appropriate serializer class
        """
        if self.action in ['create', 'update', 'partial_update']:
            return WebinarCreateSerializer
        return WebinarSerializer
    
    def get_queryset(self):
        """
        Filter queryset based on query parameters.
        
        Returns:
            QuerySet: Filtered webinars queryset
        """
        queryset = super().get_queryset()
        
        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by category
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category=category)
        
        # Filter by platform
        platform = self.request.query_params.get('platform')
        if platform:
            queryset = queryset.filter(platform=platform)
        
        # Show upcoming webinars first
        if self.request.query_params.get('upcoming'):
            queryset = queryset.filter(
                scheduled_at__gt=timezone.now()
            ).order_by('scheduled_at')
        
        return queryset
    
    def perform_create(self, serializer):
        """
        Set the presenter when creating webinars.
        
        Args:
            serializer: Serializer instance
        """
        serializer.save(presenter=self.request.user)
    
    @action(detail=True, methods=['post'])
    def register(self, request, pk=None):
        """Register for webinar."""
        webinar = self.get_object()
        user = request.user
        
        # Check webinar status
        if webinar.status != 'SCHEDULED':
            return Response(
                {'error': 'Webinar is not open for registration'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if already registered
        if WebinarRegistration.objects.filter(
            webinar=webinar,
            user=user
        ).exists():
            return Response(
                {'error': 'Already registered for this webinar'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if webinar is full
        if webinar.registered_count >= webinar.max_participants:
            return Response(
                {'error': 'Webinar is full'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Generate check-in code
        import random
        import string
        checkin_code = ''.join(random.choices(string.digits, k=6))
        
        # Create registration
        registration = WebinarRegistration.objects.create(
            webinar=webinar,
            user=user,
            checkin_code=checkin_code,
            timezone=request.data.get('timezone', 'UTC'),
            source=request.data.get('source', 'WEB')
        )
        
        # Update webinar count
        webinar.registered_count = F('registered_count') + 1
        webinar.save()
        webinar.refresh_from_db()
        
        return Response({
            'message': 'Successfully registered for webinar',
            'registration': WebinarRegistrationSerializer(registration).data,
            'checkin_code': checkin_code
        })
    
    @action(detail=True, methods=['post'])
    def checkin(self, request, pk=None):
        """Check-in for webinar attendance."""
        webinar = self.get_object()
        user = request.user
        
        checkin_code = request.data.get('checkin_code')
        if not checkin_code:
            return Response(
                {'error': 'Check-in code is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            registration = WebinarRegistration.objects.get(
                webinar=webinar,
                user=user
            )
        except WebinarRegistration.DoesNotExist:
            return Response(
                {'error': 'Not registered for this webinar'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Verify check-in code
        if registration.checkin_code != checkin_code:
            return Response(
                {'error': 'Invalid check-in code'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check webinar time
        from django.utils import timezone
        now = timezone.now()
        
        if now < webinar.scheduled_at - timedelta(minutes=30):
            return Response(
                {'error': 'Check-in is not open yet'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if now > webinar.scheduled_at + timedelta(minutes=webinar.duration_minutes):
            return Response(
                {'error': 'Webinar has ended'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Mark as attended
        registration.mark_attended()
        
        # Update webinar attendance count
        webinar.attended_count = F('attended_count') + 1
        webinar.save()
        webinar.refresh_from_db()
        
        return Response({
            'message': 'Successfully checked in',
            'registration': WebinarRegistrationSerializer(registration).data
        })
    
    @action(detail=True, methods=['post'])
    def start_live(self, request, pk=None):
        """Start webinar (presenter only)."""
        webinar = self.get_object()
        user = request.user
        
        # Check if user is presenter
        if webinar.presenter != user and not user.is_staff:
            return Response(
                {'error': 'Only the presenter can start the webinar'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Update webinar status
        webinar.status = 'LIVE'
        webinar.save()
        
        # Generate meeting URL (simplified - integrate with Zoom/Teams API)
        if not webinar.meeting_url:
            # Example: Generate Zoom meeting URL
            # Implement actual Zoom/Teams API integration here
            pass
        
        return Response({
            'message': 'Webinar started',
            'webinar': WebinarSerializer(webinar).data,
            'meeting_url': webinar.meeting_url,
            'host_url': webinar.host_url
        })
    
    @action(detail=True, methods=['post'])
    def end_live(self, request, pk=None):
        """End webinar (presenter only)."""
        webinar = self.get_object()
        user = request.user
        
        # Check if user is presenter
        if webinar.presenter != user and not user.is_staff:
            return Response(
                {'error': 'Only the presenter can end the webinar'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Update webinar status
        webinar.status = 'COMPLETED'
        webinar.save()
        
        return Response({
            'message': 'Webinar ended',
            'webinar': WebinarSerializer(webinar).data
        })
    
    @action(detail=True, methods=['get'])
    def attendees(self, request, pk=None):
        """Get webinar attendees."""
        webinar = self.get_object()
        
        attendees = WebinarRegistration.objects.filter(
            webinar=webinar,
            status='ATTENDED'
        ).select_related('user')
        
        attendees_data = []
        for registration in attendees:
            attendees_data.append({
                'user': {
                    'id': registration.user.id,
                    'name': registration.user.get_full_name(),
                    'email': registration.user.email
                },
                'joined_at': registration.joined_at,
                'attendance_duration': registration.attendance_duration,
                'checked_in_at': registration.checkin_at
            })
        
        return Response(attendees_data)
    
    @action(detail=True, methods=['post'])
    def submit_feedback(self, request, pk=None):
        """Submit feedback for webinar."""
        webinar = self.get_object()
        user = request.user
        
        rating = request.data.get('rating')
        feedback = request.data.get('feedback')
        
        if not rating or not feedback:
            return Response(
                {'error': 'Rating and feedback are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            registration = WebinarRegistration.objects.get(
                webinar=webinar,
                user=user
            )
        except WebinarRegistration.DoesNotExist:
            return Response(
                {'error': 'Not registered for this webinar'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Update registration with feedback
        registration.rating = rating
        registration.feedback = feedback
        registration.feedback_at = timezone.now()
        registration.save()
        
        # Update webinar average rating
        ratings = WebinarRegistration.objects.filter(
            webinar=webinar,
            rating__isnull=False
        ).aggregate(avg_rating=Avg('rating'))
        
        webinar.average_rating = ratings['avg_rating'] or 0
        webinar.save()
        
        return Response({
            'message': 'Feedback submitted',
            'rating': rating,
            'feedback': feedback
        })
    
    @action(detail=True, methods=['get'])
    def questions(self, request, pk=None):
        """Get webinar Q&A."""
        webinar = self.get_object()
        
        questions = WebinarQnA.objects.filter(
            webinar=webinar
        ).select_related('user', 'answered_by').order_by('-upvotes', '-created_at')
        
        serializer = WebinarQnASerializer(questions, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def ask_question(self, request, pk=None):
        """Ask a question in webinar Q&A."""
        webinar = self.get_object()
        user = request.user
        
        question = request.data.get('question')
        is_anonymous = request.data.get('is_anonymous', False)
        
        if not question:
            return Response(
                {'error': 'Question is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create question
        qna = WebinarQnA.objects.create(
            webinar=webinar,
            user=user,
            question=question,
            is_anonymous=is_anonymous
        )
        
        return Response({
            'message': 'Question submitted',
            'question': WebinarQnASerializer(qna).data
        })


# Dashboard Views
class EducationDashboardViewSet(viewsets.ViewSet):
    """
    ViewSet for education dashboard and analytics.
    
    Provides endpoints for dashboard overview and learning analytics.
    
    Endpoints:
        GET /api/v1/education/dashboard/overview/ - Get dashboard overview
        GET /api/v1/education/dashboard/learning_analytics/ - Get learning analytics
    """
    
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def overview(self, request):
        """Get education dashboard overview."""
        user = request.user
        
        # Learning progress
        total_completed = UserProgress.objects.filter(
            user=user,
            status='COMPLETED'
        ).count()
        
        in_progress = UserProgress.objects.filter(
            user=user,
            status='IN_PROGRESS'
        ).count()
        
        total_points = UserProgress.objects.filter(
            user=user,
            status='COMPLETED'
        ).aggregate(
            total_points=Sum('content__points_reward')
        )['total_points'] or 0
        
        # Learning paths
        active_paths = LearningPathEnrollment.objects.filter(
            user=user,
            status='IN_PROGRESS'
        ).count()
        
        completed_paths = LearningPathEnrollment.objects.filter(
            user=user,
            status='COMPLETED'
        ).count()
        
        # Webinars
        webinars_attended = WebinarRegistration.objects.filter(
            user=user,
            status='ATTENDED'
        ).count()
        
        upcoming_webinars = WebinarRegistration.objects.filter(
            user=user,
            webinar__status='SCHEDULED',
            webinar__scheduled_at__gt=timezone.now()
        ).count()
        
        # Challenges
        active_challenges = ChallengeParticipant.objects.filter(
            user=user,
            challenge__status='ACTIVE',
            completed=False
        ).count()
        
        completed_challenges = ChallengeParticipant.objects.filter(
            user=user,
            completed=True
        ).count()
        
        # Recent activity
        recent_completions = UserProgress.objects.filter(
            user=user,
            status='COMPLETED'
        ).select_related('content').order_by('-completed_at')[:5]
        
        recent_activity = []
        for progress in recent_completions:
            recent_activity.append({
                'type': 'content_completed',
                'title': progress.content.title,
                'description': f"Completed {progress.content.content_type.lower()}",
                'date': progress.completed_at,
                'points': progress.content.points_reward
            })
        
        # Upcoming webinars
        upcoming = Webinar.objects.filter(
            registrations__user=user,
            status='SCHEDULED',
            scheduled_at__gt=timezone.now()
        ).order_by('scheduled_at')[:3]
        
        upcoming_data = WebinarSerializer(upcoming, many=True, context={'request': request}).data
        
        # Recommended content
        recommended = EducationalContent.objects.filter(
            is_published=True
        ).exclude(
            user_progress__user=user
        ).order_by('?')[:3]
        
        recommended_data = EducationalContentSerializer(
            recommended, many=True, context={'request': request}
        ).data
        
        return Response({
            'stats': {
                'learning': {
                    'total_completed': total_completed,
                    'in_progress': in_progress,
                    'total_points': total_points,
                    'active_paths': active_paths,
                    'completed_paths': completed_paths
                },
                'webinars': {
                    'attended': webinars_attended,
                    'upcoming': upcoming_webinars
                },
                'challenges': {
                    'active': active_challenges,
                    'completed': completed_challenges
                }
            },
            'recent_activity': recent_activity,
            'upcoming_webinars': upcoming_data,
            'recommended_content': recommended_data
        })
    
    @action(detail=False, methods=['get'])
    def learning_analytics(self, request):
        """Get learning analytics."""
        user = request.user
        
        # Daily learning activity for the past 30 days
        thirty_days_ago = timezone.now() - timedelta(days=30)
        
        daily_activity = UserProgress.objects.filter(
            user=user,
            completed_at__gte=thirty_days_ago
        ).extra(
            {'date': "date(completed_at)"}
        ).values('date').annotate(
            count=Count('id'),
            total_points=Sum('content__points_reward')
        ).order_by('date')
        
        # Category distribution
        category_distribution = UserProgress.objects.filter(
            user=user,
            status='COMPLETED'
        ).values('content__category').annotate(
            count=Count('id'),
            total_points=Sum('content__points_reward')
        ).order_by('-count')
        
        # Time of day preference
        hour_distribution = UserProgress.objects.filter(
            user=user,
            completed_at__isnull=False
        ).extra(
            {'hour': "extract(hour from completed_at)"}
        ).values('hour').annotate(
            count=Count('id')
        ).order_by('hour')
        
        # Streak calculation
        today = timezone.now().date()
        streak = 0
        current_date = today
        
        # Check consecutive days with completed content
        while True:
            has_completed = UserProgress.objects.filter(
                user=user,
                status='COMPLETED',
                completed_at__date=current_date
            ).exists()
            
            if has_completed:
                streak += 1
                current_date -= timedelta(days=1)
            else:
                break
        
        return Response({
            'daily_activity': list(daily_activity),
            'category_distribution': list(category_distribution),
            'hour_distribution': list(hour_distribution),
            'streak': streak,
            'total_days_active': UserProgress.objects.filter(
                user=user
            ).dates('completed_at', 'day').distinct().count()
        })


# Certificate Views
class CertificateViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for managing certificates.
    
    Provides read-only operations for certificates with
    additional actions for verification.
    
    Endpoints:
        GET /api/v1/education/certificates/ - List user's certificates
        GET /api/v1/education/certificates/{id}/ - Retrieve certificate
        
    Custom Actions:
        GET /api/v1/education/certificates/{id}/verify/ - Verify certificate
        GET /api/v1/education/certificates/public_verify/ - Public verification
    """
    
    serializer_class = CertificateSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """
        Return only the current user's certificates.
        
        Returns:
            QuerySet: User's certificates queryset
        """
        return Certificate.objects.filter(user=self.request.user)
    
    @action(detail=True, methods=['get'])
    def verify(self, request, pk=None):
        """Verify certificate."""
        certificate = self.get_object()
        
        return Response({
            'valid': True,
            'certificate': CertificateSerializer(certificate).data,
            'verification': {
                'code': certificate.verification_code,
                'issued_at': certificate.issued_at,
                'issued_to': certificate.user.get_full_name()
            }
        })
    
    @action(detail=False, methods=['get'])
    def public_verify(self, request):
        """Public certificate verification."""
        verification_code = request.query_params.get('code')
        
        if not verification_code:
            return Response(
                {'error': 'Verification code is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            certificate = Certificate.objects.get(
                verification_code=verification_code,
                is_public=True
            )
        except Certificate.DoesNotExist:
            return Response(
                {'error': 'Certificate not found or not public'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        return Response({
            'valid': True,
            'certificate': CertificateSerializer(certificate).data,
            'issued_to': certificate.user.get_full_name(),
            'issued_at': certificate.issued_at
        })


# Integration with Zoom/Teams (simplified example)
class ZoomIntegrationViewSet(viewsets.ViewSet):
    """
    ViewSet for Zoom/Teams integration (simplified example).
    
    Provides endpoints for webinar platform integration.
    Note: This is a simplified example - actual implementation
    would require OAuth2 setup and platform-specific API calls.
    
    Endpoints:
        POST /api/v1/education/zoom-integration/create_meeting/ - Create meeting
        POST /api/v1/education/zoom-integration/sync_attendance/ - Sync attendance
    """
    
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['post'])
    def create_meeting(self, request):
        """Create Zoom meeting for webinar."""
        # This is a simplified example. You would need to:
        # 1. Install and configure django-zoom-meetings or similar
        # 2. Set up OAuth2 with Zoom
        # 3. Implement actual API calls
        
        webinar_id = request.data.get('webinar_id')
        topic = request.data.get('topic')
        start_time = request.data.get('start_time')
        duration = request.data.get('duration', 60)
        
        # Example response structure
        return Response({
            'message': 'Zoom meeting created (simulated)',
            'meeting_id': '123456789',
            'join_url': 'https://zoom.us/j/123456789',
            'host_url': 'https://zoom.us/s/123456789?zak=xxx',
            'password': '123456'
        })
    
    @action(detail=False, methods=['post'])
    def sync_attendance(self, request):
        """Sync Zoom meeting attendance."""
        webinar_id = request.data.get('webinar_id')
        meeting_id = request.data.get('meeting_id')
        
        # This would call Zoom API to get participants
        # and update WebinarRegistration records
        
        return Response({
            'message': 'Attendance synced (simulated)',
            'participants_synced': 25
        })