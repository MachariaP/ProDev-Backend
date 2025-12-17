from rest_framework import permissions


class IsContentAuthor(permissions.BasePermission):
    """Check if user is the author of the content."""
    
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.author == request.user


class IsLearningPathOwner(permissions.BasePermission):
    """Check if user can modify learning path."""
    
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        # Add logic to check if user is owner/admin
        return request.user.is_staff


class IsChallengeCreator(permissions.BasePermission):
    """Check if user created the challenge."""
    
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.created_by == request.user


class IsWebinarPresenter(permissions.BasePermission):
    """Check if user is the webinar presenter."""
    
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.presenter == request.user or request.user.is_staff
