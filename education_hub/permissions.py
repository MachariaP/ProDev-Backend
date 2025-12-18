"""
Custom Permissions for Education Hub.

This module defines custom permission classes for the education hub API.
These permissions control access to resources based on ownership, roles,
and relationships between users and content.

Key Permissions:
- IsContentAuthor: Content modification by authors only
- IsLearningPathOwner: Learning path management by owners/admins
- IsChallengeCreator: Challenge administration by creators
- IsWebinarPresenter: Webinar management by presenters
"""

from rest_framework import permissions


class IsContentAuthor(permissions.BasePermission):
    """
    Check if user is the author of the content.
    
    Allows:
        - Safe methods (GET, HEAD, OPTIONS) for all users
        - Modification (POST, PUT, PATCH, DELETE) for content authors only
    """
    
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.author == request.user


class IsLearningPathOwner(permissions.BasePermission):
    """
    Check if user can modify learning path.
    
    Allows:
        - Safe methods (GET, HEAD, OPTIONS) for all users
        - Modification for learning path owners/admins only
    """
    
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        # Add logic to check if user is owner/admin
        return request.user.is_staff


class IsChallengeCreator(permissions.BasePermission):
    """
    Check if user created the challenge.
    
    Allows:
        - Safe methods (GET, HEAD, OPTIONS) for all users
        - Modification for challenge creators only
    """
    
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.created_by == request.user


class IsWebinarPresenter(permissions.BasePermission):
    """
    Check if user is the webinar presenter.
    
    Allows:
        - Safe methods (GET, HEAD, OPTIONS) for all users
        - Modification for webinar presenters or staff only
    """
    
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.presenter == request.user or request.user.is_staff