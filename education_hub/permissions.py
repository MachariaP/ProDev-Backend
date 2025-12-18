"""
Custom Permissions for Education Hub.

This module defines custom permission classes for the education hub API.
These permissions control access to resources based on ownership, roles,
and relationships between users and content.

The permissions are designed to be:
- Granular: Fine-grained control over different operations
- Extensible: Easy to add new permission checks
- Efficient: Minimal database queries for permission checks
- Secure: Proper validation and error handling
- Consistent: Uniform permission checking across all endpoints

Key Permission Classes:
- IsContentAuthor: Content modification by authors only
- IsLearningPathOwner: Learning path management by owners/admins
- IsChallengeCreator: Challenge administration by creators
- IsWebinarPresenter: Webinar management by presenters
- HasContentAccess: Content access based on prerequisites and enrollment
- IsGroupMember: Group-based content access
- HasAchievementAccess: Achievement visibility and unlocking
- IsCertificateOwner: Certificate access and management

Additional Utility Functions:
- check_content_prerequisites: Verify user has completed prerequisites
- check_enrollment_status: Verify user enrollment status
- check_challenge_participation: Verify user challenge participation
- check_webinar_registration: Verify user webinar registration
"""

from rest_framework import permissions
from rest_framework.exceptions import PermissionDenied
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from .models import (
    EducationalContent, LearningPath, SavingsChallenge, Webinar,
    Certificate, Achievement, UserProgress, LearningPathEnrollment,
    ChallengeParticipant, WebinarRegistration
)


User = get_user_model()


class BaseEducationPermission(permissions.BasePermission):
    """
    Base permission class for education hub with common functionality.
    
    Provides:
    - Request context access
    - User authentication checks
    - Object-level permission caching
    - Consistent error messages
    - Debug logging for permission failures
    """
    
    def __init__(self):
        """Initialize permission cache."""
        self._permission_cache = {}
    
    def get_cache_key(self, request, view, obj=None):
        """
        Generate cache key for permission checking.
        
        Args:
            request: HTTP request object
            view: View instance
            obj: Object being accessed (optional)
            
        Returns:
            str: Cache key
        """
        if obj:
            return f"{request.user.id}_{view.__class__.__name__}_{obj.__class__.__name__}_{obj.id}"
        return f"{request.user.id}_{view.__class__.__name__}"
    
    def has_permission(self, request, view):
        """
        Default permission check for view-level access.
        
        Args:
            request: HTTP request object
            view: View instance
            
        Returns:
            bool: True if user has permission
        """
        # Cache permission check
        cache_key = self.get_cache_key(request, view)
        if cache_key in self._permission_cache:
            return self._permission_cache[cache_key]
        
        # Default: allow authenticated users
        has_perm = request.user.is_authenticated
        self._permission_cache[cache_key] = has_perm
        
        return has_perm
    
    def has_object_permission(self, request, view, obj):
        """
        Default object-level permission check.
        
        Args:
            request: HTTP request object
            view: View instance
            obj: Object being accessed
            
        Returns:
            bool: True if user has object permission
        """
        # Cache object permission check
        cache_key = self.get_cache_key(request, view, obj)
        if cache_key in self._permission_cache:
            return self._permission_cache[cache_key]
        
        # Default: allow if user has view permission
        has_perm = self.has_permission(request, view)
        self._permission_cache[cache_key] = has_perm
        
        return has_perm


class IsContentAuthor(BaseEducationPermission):
    """
    Check if user is the author of educational content.
    
    Allows:
    - Safe methods (GET, HEAD, OPTIONS) for all users
    - Creation (POST) for authenticated users
    - Modification (PUT, PATCH, DELETE) for content authors only
    - Staff users have full access
    
    This permission ensures that only content authors can modify their
    content, while allowing all users to view published content.
    
    Usage:
        permission_classes = [IsAuthenticated, IsContentAuthor]
    """
    
    def has_permission(self, request, view):
        """
        Check view-level permission for content operations.
        
        Args:
            request: HTTP request object
            view: View instance
            
        Returns:
            bool: True if user has permission for the view action
        """
        # Always allow safe methods
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Allow creation for authenticated users
        if request.method == 'POST':
            return request.user.is_authenticated
        
        # For other methods, check object permission
        return super().has_permission(request, view)
    
    def has_object_permission(self, request, view, obj):
        """
        Check object-level permission for educational content.
        
        Args:
            request: HTTP request object
            view: View instance
            obj: EducationalContent object
            
        Returns:
            bool: True if user has permission for this content object
        
        Rules:
        1. Safe methods always allowed
        2. Staff users can do anything
        3. Authors can modify their own content
        4. Other users cannot modify content
        """
        # Always allow safe methods
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Staff users have full access
        if request.user.is_staff:
            return True
        
        # Check if user is the author
        if hasattr(obj, 'author'):
            return obj.author == request.user
        
        # For content without author (system-generated), allow staff only
        return False


class IsLearningPathOwner(BaseEducationPermission):
    """
    Check if user can modify learning path.
    
    Allows:
    - Safe methods (GET, HEAD, OPTIONS) for all users
    - Creation (POST) for authenticated users
    - Modification (PUT, PATCH, DELETE) for learning path owners/admins only
    - Enrollment operations for enrolled users
    - Progress tracking for enrolled users
    
    Owners are defined as:
    1. The user who created the learning path (if created_by field exists)
    2. Staff users
    3. Group administrators (if integrated with group system)
    
    Usage:
        permission_classes = [IsAuthenticated, IsLearningPathOwner]
    """
    
    def has_permission(self, request, view):
        """
        Check view-level permission for learning path operations.
        
        Args:
            request: HTTP request object
            view: View instance
            
        Returns:
            bool: True if user has permission for the view action
        """
        # Always allow safe methods
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Check action-specific permissions
        action = getattr(view, 'action', None)
        
        # Allow enrollment actions for authenticated users
        if action in ['enroll', 'unenroll']:
            return request.user.is_authenticated
        
        # Allow progress tracking for authenticated users
        if action in ['update_progress', 'complete_content']:
            return request.user.is_authenticated
        
        # Allow creation for authenticated users
        if request.method == 'POST' and not action:
            return request.user.is_authenticated
        
        # For other methods, check object permission
        return super().has_permission(request, view)
    
    def has_object_permission(self, request, view, obj):
        """
        Check object-level permission for learning path.
        
        Args:
            request: HTTP request object
            view: View instance
            obj: LearningPath object
            
        Returns:
            bool: True if user has permission for this learning path
        
        Rules:
        1. Safe methods always allowed
        2. Staff users can do anything
        3. Owners can modify learning path
        4. Enrolled users can track progress
        5. Other users can only view
        """
        # Always allow safe methods
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Staff users have full access
        if request.user.is_staff:
            return True
        
        # Check action-specific permissions
        action = getattr(view, 'action', None)
        
        # Check if user is owner (via created_by field if it exists)
        if hasattr(obj, 'created_by') and obj.created_by == request.user:
            return True
        
        # Check enrollment-based permissions
        if action in ['update_progress', 'complete_content', 'start']:
            # Check if user is enrolled
            is_enrolled = LearningPathEnrollment.objects.filter(
                user=request.user,
                learning_path=obj
            ).exists()
            return is_enrolled
        
        # For modification actions, only owners and staff
        if request.method in ['PUT', 'PATCH', 'DELETE']:
            return False
        
        return False


class IsChallengeCreator(BaseEducationPermission):
    """
    Check if user created the savings challenge.
    
    Allows:
    - Safe methods (GET, HEAD, OPTIONS) for all users
    - Creation (POST) for authenticated users
    - Modification (PUT, PATCH, DELETE) for challenge creators only
    - Participation operations for authenticated users
    - Progress updates for participants
    
    Creators are defined as:
    1. The user who created the challenge (created_by field)
    2. Staff users
    
    Usage:
        permission_classes = [IsAuthenticated, IsChallengeCreator]
    """
    
    def has_permission(self, request, view):
        """
        Check view-level permission for challenge operations.
        
        Args:
            request: HTTP request object
            view: View instance
            
        Returns:
            bool: True if user has permission for the view action
        """
        # Always allow safe methods
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Check action-specific permissions
        action = getattr(view, 'action', None)
        
        # Allow participation actions for authenticated users
        if action in ['join', 'leave', 'update_savings']:
            return request.user.is_authenticated
        
        # Allow creation for authenticated users
        if request.method == 'POST' and not action:
            return request.user.is_authenticated
        
        # For other methods, check object permission
        return super().has_permission(request, view)
    
    def has_object_permission(self, request, view, obj):
        """
        Check object-level permission for savings challenge.
        
        Args:
            request: HTTP request object
            view: View instance
            obj: SavingsChallenge object
            
        Returns:
            bool: True if user has permission for this challenge
        
        Rules:
        1. Safe methods always allowed
        2. Staff users can do anything
        3. Creators can modify challenge
        4. Participants can update their progress
        5. Other users can only view
        """
        # Always allow safe methods
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Staff users have full access
        if request.user.is_staff:
            return True
        
        # Check if user is the creator
        if hasattr(obj, 'created_by') and obj.created_by == request.user:
            return True
        
        # Check action-specific permissions
        action = getattr(view, 'action', None)
        
        # Check participation-based permissions
        if action in ['update_savings', 'complete_lesson']:
            # Check if user is participating
            is_participating = ChallengeParticipant.objects.filter(
                user=request.user,
                challenge=obj
            ).exists()
            return is_participating
        
        # For modification actions, only creators and staff
        if request.method in ['PUT', 'PATCH', 'DELETE']:
            return False
        
        return False


class IsWebinarPresenter(BaseEducationPermission):
    """
    Check if user is the webinar presenter.
    
    Allows:
    - Safe methods (GET, HEAD, OPTIONS) for all users
    - Creation (POST) for authenticated users
    - Modification (PUT, PATCH, DELETE) for webinar presenters or staff
    - Registration for authenticated users
    - Check-in for registered users
    - Q&A for registered/attended users
    
    Presenters are defined as:
    1. The main presenter (presenter field)
    2. Co-presenters (co_presenters ManyToMany field)
    3. Staff users
    
    Usage:
        permission_classes = [IsAuthenticated, IsWebinarPresenter]
    """
    
    def has_permission(self, request, view):
        """
        Check view-level permission for webinar operations.
        
        Args:
            request: HTTP request object
            view: View instance
            
        Returns:
            bool: True if user has permission for the view action
        """
        # Always allow safe methods
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Check action-specific permissions
        action = getattr(view, 'action', None)
        
        # Allow registration actions for authenticated users
        if action in ['register', 'cancel_registration']:
            return request.user.is_authenticated
        
        # Allow attendance actions for authenticated users
        if action in ['checkin', 'submit_feedback']:
            return request.user.is_authenticated
        
        # Allow Q&A for authenticated users
        if action in ['ask_question', 'answer_question']:
            return request.user.is_authenticated
        
        # Allow creation for authenticated users
        if request.method == 'POST' and not action:
            return request.user.is_authenticated
        
        # For other methods, check object permission
        return super().has_permission(request, view)
    
    def has_object_permission(self, request, view, obj):
        """
        Check object-level permission for webinar.
        
        Args:
            request: HTTP request object
            view: View instance
            obj: Webinar object
            
        Returns:
            bool: True if user has permission for this webinar
        
        Rules:
        1. Safe methods always allowed
        2. Staff users can do anything
        3. Presenters can modify webinar
        4. Registered users can check in and provide feedback
        5. Other users can only view
        """
        # Always allow safe methods
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Staff users have full access
        if request.user.is_staff:
            return True
        
        # Check if user is presenter or co-presenter
        is_presenter = False
        if hasattr(obj, 'presenter'):
            is_presenter = obj.presenter == request.user
        
        if not is_presenter and hasattr(obj, 'co_presenters'):
            is_presenter = obj.co_presenters.filter(id=request.user.id).exists()
        
        if is_presenter:
            return True
        
        # Check action-specific permissions
        action = getattr(view, 'action', None)
        
        # Check registration-based permissions
        if action in ['checkin', 'submit_feedback']:
            # Check if user is registered
            is_registered = WebinarRegistration.objects.filter(
                user=request.user,
                webinar=obj
            ).exists()
            return is_registered
        
        # For modification actions, only presenters and staff
        if request.method in ['PUT', 'PATCH', 'DELETE']:
            return False
        
        return False


class HasContentAccess(BaseEducationPermission):
    """
    Check if user has access to educational content based on prerequisites.
    
    This permission checks if the user has completed all prerequisites
    for the content they're trying to access. It's used for content
    that requires prior learning.
    
    Allows:
    - Viewing content if prerequisites are met or user is staff
    - Progress tracking if prerequisites are met
    - Quiz submission if prerequisites are met
    
    Note: Published content without prerequisites is always accessible.
    
    Usage:
        permission_classes = [IsAuthenticated, HasContentAccess]
    """
    
    def has_object_permission(self, request, view, obj):
        """
        Check if user has access to this content based on prerequisites.
        
        Args:
            request: HTTP request object
            view: View instance
            obj: EducationalContent object
            
        Returns:
            bool: True if user has access to this content
        
        Rules:
        1. Staff users have full access
        2. Unpublished content only accessible to authors and staff
        3. Content without prerequisites is accessible to all
        4. Content with prerequisites requires completion
        5. Safe methods may have different requirements
        """
        # Staff users have full access
        if request.user.is_staff:
            return True
        
        # Check if content is published
        if not obj.is_published:
            # Only authors and staff can access unpublished content
            if hasattr(obj, 'author'):
                return obj.author == request.user
            return False
        
        # For safe methods, allow access to all published content
        # (prerequisites are checked when starting progress)
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Check action-specific access
        action = getattr(view, 'action', None)
        
        # For starting progress or submitting quiz, check prerequisites
        if action in ['start_progress', 'submit_quiz', 'update_progress']:
            return self.check_prerequisites(request.user, obj)
        
        # For other actions, use default rules
        return True
    
    def check_prerequisites(self, user, content):
        """
        Check if user has completed all prerequisites for content.
        
        Args:
            user (User): User to check
            content (EducationalContent): Content to check prerequisites for
            
        Returns:
            bool: True if all prerequisites are completed
        """
        if not content.prerequisites.exists():
            return True
        
        # Get all prerequisite IDs
        prerequisite_ids = content.prerequisites.values_list('id', flat=True)
        
        # Count completed prerequisites
        completed_count = UserProgress.objects.filter(
            user=user,
            content_id__in=prerequisite_ids,
            status='COMPLETED'
        ).count()
        
        return completed_count == len(prerequisite_ids)


class IsGroupMember(BaseEducationPermission):
    """
    Check if user is member of a group for group-restricted content.
    
    This permission integrates with the group system to restrict
    educational content to specific group members. It's useful for:
    - Group-specific learning paths
    - Private group webinars
    - Group savings challenges
    
    Allows:
    - Access if user is member of the required group
    - Staff users have access to all groups
    - Group admins have additional permissions
    
    Note: This requires integration with the group system.
    
    Usage:
        permission_classes = [IsAuthenticated, IsGroupMember]
    """
    
    def has_object_permission(self, request, view, obj):
        """
        Check if user has group-based access to content.
        
        Args:
            request: HTTP request object
            view: View instance
            obj: Education hub object with group association
            
        Returns:
            bool: True if user has group access
        
        Rules:
        1. Staff users have full access
        2. Objects without group association are accessible
        3. Group members can access group-restricted content
        4. Group admins have additional permissions
        """
        # Staff users have full access
        if request.user.is_staff:
            return True
        
        # Check if object has group association
        # This depends on how groups are integrated with education hub
        
        # Example: Learning path with group restriction
        if hasattr(obj, 'group'):
            if obj.group is None:
                return True  # No group restriction
            
            # Check group membership
            # This would typically check a GroupMembership model
            # For now, return True as a placeholder
            return True
        
        # Example: Savings challenge with group
        if hasattr(obj, 'allowed_groups'):
            if not obj.allowed_groups.exists():
                return True  # No group restriction
            
            # Check if user is in any allowed group
            # This would check group membership
            return True
        
        # No group restriction found
        return True


class HasAchievementAccess(BaseEducationPermission):
    """
    Check if user has access to achievement operations.
    
    This permission controls who can:
    - View achievement details
    - Unlock achievements
    - View other users' achievements
    
    Allows:
    - Users to view their own achievements
    - Users to view public achievements
    - Staff to view all achievements
    - System to unlock achievements
    
    Usage:
        permission_classes = [IsAuthenticated, HasAchievementAccess]
    """
    
    def has_permission(self, request, view):
        """
        Check view-level permission for achievement operations.
        
        Args:
            request: HTTP request object
            view: View instance
            
        Returns:
            bool: True if user has permission for the view action
        """
        # Always allow safe methods for authenticated users
        if request.method in permissions.SAFE_METHODS:
            return request.user.is_authenticated
        
        # Allow system operations (webhook receivers, etc.)
        if request.method == 'POST' and hasattr(request, 'is_system'):
            return request.is_system
        
        return super().has_permission(request, view)
    
    def has_object_permission(self, request, view, obj):
        """
        Check object-level permission for achievement.
        
        Args:
            request: HTTP request object
            view: View instance
            obj: Achievement or UserAchievement object
            
        Returns:
            bool: True if user has permission for this achievement
        """
        # Staff users have full access
        if request.user.is_staff:
            return True
        
        # Check if object is Achievement or UserAchievement
        if isinstance(obj, Achievement):
            # Check if achievement is active
            if not obj.is_active and not request.user.is_staff:
                return False
            
            # All users can view active achievements
            if request.method in permissions.SAFE_METHODS:
                return True
            
            # Only system can unlock achievements via API
            if request.method == 'POST' and hasattr(request, 'is_system'):
                return request.is_system
            
            return False
        
        elif isinstance(obj, UserAchievement):
            # Users can view their own achievements
            if obj.user == request.user:
                return True
            
            # Check if achievement is public
            if obj.achievement.is_active:
                # Users can view others' public achievements
                if request.method in permissions.SAFE_METHODS:
                    return True
            
            return False
        
        return False


class IsCertificateOwner(BaseEducationPermission):
    """
    Check if user owns the certificate or it's publicly accessible.
    
    Allows:
    - Owners to view and download their certificates
    - Public access to certificates marked as public
    - Staff to view all certificates
    - Verification access with valid verification code
    
    Usage:
        permission_classes = [IsAuthenticated, IsCertificateOwner]
    """
    
    def has_object_permission(self, request, view, obj):
        """
        Check object-level permission for certificate.
        
        Args:
            request: HTTP request object
            view: View instance
            obj: Certificate object
            
        Returns:
            bool: True if user has permission for this certificate
        
        Rules:
        1. Staff users have full access
        2. Certificate owners have full access
        3. Public certificates are viewable by all
        4. Verification endpoint allows access with code
        """
        # Staff users have full access
        if request.user.is_staff:
            return True
        
        # Check if user is the certificate owner
        if obj.user == request.user:
            return True
        
        # Check if certificate is public
        if obj.is_public and request.method in permissions.SAFE_METHODS:
            return True
        
        # Check verification endpoint
        action = getattr(view, 'action', None)
        if action == 'verify':
            # Allow verification with code parameter
            verification_code = request.query_params.get('code')
            if verification_code and verification_code == obj.verification_code:
                return True
        
        return False


class HasLearningProgressPermission(BaseEducationPermission):
    """
    Check if user has permission for learning progress operations.
    
    This permission controls who can:
    - View user progress (own or others with permission)
    - Update progress (own progress only)
    - Delete progress (own progress only)
    - View aggregated statistics
    
    Allows:
    - Users to manage their own progress
    - Staff to view all progress
    - Group leaders to view group member progress (if integrated)
    
    Usage:
        permission_classes = [IsAuthenticated, HasLearningProgressPermission]
    """
    
    def has_permission(self, request, view):
        """
        Check view-level permission for progress operations.
        
        Args:
            request: HTTP request object
            view: View instance
            
        Returns:
            bool: True if user has permission for the view action
        """
        # Allow authenticated users to view their own progress
        if request.method in permissions.SAFE_METHODS:
            return request.user.is_authenticated
        
        # Allow users to create their own progress
        if request.method == 'POST':
            return request.user.is_authenticated
        
        return super().has_permission(request, view)
    
    def has_object_permission(self, request, view, obj):
        """
        Check object-level permission for user progress.
        
        Args:
            request: HTTP request object
            view: View instance
            obj: UserProgress object
            
        Returns:
            bool: True if user has permission for this progress record
        
        Rules:
        1. Staff users have full access
        2. Users can manage their own progress
        3. Group leaders can view member progress (if configured)
        4. Others cannot access
        """
        # Staff users have full access
        if request.user.is_staff:
            return True
        
        # Check if user owns the progress record
        if obj.user == request.user:
            return True
        
        # Check group leader access (if integrated)
        # This would check if request.user is a leader of obj.user's group
        # For now, return False
        return False


# Utility functions for permission checking

def check_content_prerequisites(user, content):
    """
    Check if user has completed all prerequisites for content.
    
    Args:
        user (User): User to check
        content (EducationalContent): Content with prerequisites
        
    Returns:
        tuple: (bool has_access, list missing_prerequisites)
    """
    if not user.is_authenticated:
        return False, ["User not authenticated"]
    
    if not content.prerequisites.exists():
        return True, []
    
    # Get all prerequisites
    prerequisites = content.prerequisites.all()
    
    # Check completion status
    missing = []
    for prerequisite in prerequisites:
        try:
            progress = UserProgress.objects.get(user=user, content=prerequisite)
            if progress.status != 'COMPLETED':
                missing.append(prerequisite)
        except UserProgress.DoesNotExist:
            missing.append(prerequisite)
    
    return len(missing) == 0, missing


def check_enrollment_status(user, learning_path):
    """
    Check user's enrollment status for a learning path.
    
    Args:
        user (User): User to check
        learning_path (LearningPath): Learning path to check
        
    Returns:
        dict: Enrollment status and details
    """
    if not user.is_authenticated:
        return {
            'enrolled': False,
            'status': 'NOT_ENROLLED',
            'progress': 0,
            'can_enroll': True,
        }
    
    try:
        enrollment = LearningPathEnrollment.objects.get(
            user=user,
            learning_path=learning_path
        )
        
        return {
            'enrolled': True,
            'status': enrollment.status,
            'progress': enrollment.progress_percentage,
            'enrollment_id': enrollment.id,
            'can_enroll': False,
            'can_start': enrollment.status == 'ENROLLED',
            'can_continue': enrollment.status == 'IN_PROGRESS',
        }
    except LearningPathEnrollment.DoesNotExist:
        return {
            'enrolled': False,
            'status': 'NOT_ENROLLED',
            'progress': 0,
            'can_enroll': learning_path.is_published,
        }


def check_challenge_participation(user, challenge):
    """
    Check user's participation status for a savings challenge.
    
    Args:
        user (User): User to check
        challenge (SavingsChallenge): Challenge to check
        
    Returns:
        dict: Participation status and details
    """
    if not user.is_authenticated:
        return {
            'participating': False,
            'status': 'NOT_PARTICIPATING',
            'progress': 0,
            'can_join': True,
        }
    
    try:
        participant = ChallengeParticipant.objects.get(
            user=user,
            challenge=challenge
        )
        
        return {
            'participating': True,
            'status': 'COMPLETED' if participant.completed else 'IN_PROGRESS',
            'progress': participant.progress_percentage,
            'current_amount': participant.current_amount,
            'target_amount': participant.target_amount,
            'participant_id': participant.id,
            'can_join': False,
            'can_update': not participant.completed,
        }
    except ChallengeParticipant.DoesNotExist:
        # Check if user can join
        can_join = (
            challenge.status in ['UPCOMING', 'ACTIVE'] and
            challenge.participants_count < challenge.max_participants
        )
        
        return {
            'participating': False,
            'status': 'NOT_PARTICIPATING',
            'progress': 0,
            'can_join': can_join,
        }


def check_webinar_registration(user, webinar):
    """
    Check user's registration status for a webinar.
    
    Args:
        user (User): User to check
        webinar (Webinar): Webinar to check
        
    Returns:
        dict: Registration status and details
    """
    if not user.is_authenticated:
        return {
            'registered': False,
            'status': 'NOT_REGISTERED',
            'can_register': True,
        }
    
    try:
        registration = WebinarRegistration.objects.get(
            user=user,
            webinar=webinar
        )
        
        return {
            'registered': True,
            'status': registration.status,
            'checked_in': registration.checked_in,
            'registration_id': registration.id,
            'checkin_code': registration.checkin_code,
            'can_register': False,
            'can_checkin': (
                registration.status == 'REGISTERED' and
                not registration.checked_in and
                webinar.status in ['SCHEDULED', 'LIVE']
            ),
            'can_cancel': registration.status == 'REGISTERED',
        }
    except WebinarRegistration.DoesNotExist:
        # Check if user can register
        can_register = (
            webinar.status == 'SCHEDULED' and
            webinar.registered_count < webinar.max_participants
        )
        
        return {
            'registered': False,
            'status': 'NOT_REGISTERED',
            'can_register': can_register,
        }


# Permission combinations for common use cases

class ContentAccessPermission(permissions.BasePermission):
    """Combined permission for content access with prerequisites."""
    
    def has_object_permission(self, request, view, obj):
        """Check combined permissions for content access."""
        # Check basic permissions
        if not request.user.is_authenticated:
            return False
        
        # Staff can do anything
        if request.user.is_staff:
            return True
        
        # Check content-specific permissions
        content_permission = IsContentAuthor()
        if not content_permission.has_object_permission(request, view, obj):
            return False
        
        # Check prerequisite access for non-safe methods
        if request.method not in permissions.SAFE_METHODS:
            access_permission = HasContentAccess()
            if not access_permission.has_object_permission(request, view, obj):
                return False
        
        return True


class LearningPathAccessPermission(permissions.BasePermission):
    """Combined permission for learning path access."""
    
    def has_object_permission(self, request, view, obj):
        """Check combined permissions for learning path access."""
        # Check basic permissions
        if not request.user.is_authenticated:
            return False
        
        # Staff can do anything
        if request.user.is_staff:
            return True
        
        # Check learning path permissions
        path_permission = IsLearningPathOwner()
        return path_permission.has_object_permission(request, view, obj)


class ChallengeAccessPermission(permissions.BasePermission):
    """Combined permission for challenge access."""
    
    def has_object_permission(self, request, view, obj):
        """Check combined permissions for challenge access."""
        # Check basic permissions
        if not request.user.is_authenticated:
            return False
        
        # Staff can do anything
        if request.user.is_staff:
            return True
        
        # Check challenge permissions
        challenge_permission = IsChallengeCreator()
        return challenge_permission.has_object_permission(request, view, obj)