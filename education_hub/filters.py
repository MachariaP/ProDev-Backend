"""
Filters for Education Hub.

This module defines Django FilterSet classes for filtering education hub models.
It provides filtering capabilities for educational content, learning paths,
savings challenges, and webinars based on various criteria.

Key Filters:
- EducationalContentFilter: Filter by category, difficulty, content type
- LearningPathFilter: Filter by difficulty, path type, featured status
- SavingsChallengeFilter: Filter by challenge type, status, target amount
- WebinarFilter: Filter by platform, category, difficulty, status
"""

import django_filters
from .models import EducationalContent, LearningPath, SavingsChallenge, Webinar


class EducationalContentFilter(django_filters.FilterSet):
    """
    FilterSet for EducationalContent model.
    
    Filters:
        category: Filter by content category
        difficulty: Filter by difficulty level
        content_type: Filter by content type
        is_featured: Filter by featured status
        is_published: Filter by publication status
    """
    
    category = django_filters.CharFilter(field_name='category')
    difficulty = django_filters.CharFilter(field_name='difficulty')
    content_type = django_filters.CharFilter(field_name='content_type')
    is_featured = django_filters.BooleanFilter(field_name='is_featured')
    
    class Meta:
        model = EducationalContent
        fields = ['category', 'difficulty', 'content_type', 'is_featured', 'is_published']


class LearningPathFilter(django_filters.FilterSet):
    """
    FilterSet for LearningPath model.
    
    Filters:
        difficulty: Filter by difficulty level
        path_type: Filter by path type
        is_featured: Filter by featured status
        is_published: Filter by publication status
    """
    
    difficulty = django_filters.CharFilter(field_name='difficulty')
    path_type = django_filters.CharFilter(field_name='path_type')
    is_featured = django_filters.BooleanFilter(field_name='is_featured')
    
    class Meta:
        model = LearningPath
        fields = ['difficulty', 'path_type', 'is_featured', 'is_published']


class SavingsChallengeFilter(django_filters.FilterSet):
    """
    FilterSet for SavingsChallenge model.
    
    Filters:
        challenge_type: Filter by challenge type
        status: Filter by challenge status
        min_target: Filter by minimum target amount
        max_target: Filter by maximum target amount
    """
    
    challenge_type = django_filters.CharFilter(field_name='challenge_type')
    status = django_filters.CharFilter(field_name='status')
    min_target = django_filters.NumberFilter(field_name='target_amount', lookup_expr='gte')
    max_target = django_filters.NumberFilter(field_name='target_amount', lookup_expr='lte')
    
    class Meta:
        model = SavingsChallenge
        fields = ['challenge_type', 'status']


class WebinarFilter(django_filters.FilterSet):
    """
    FilterSet for Webinar model.
    
    Filters:
        category: Filter by content category
        difficulty: Filter by difficulty level
        platform: Filter by platform (ZOOM, TEAMS, etc.)
        status: Filter by webinar status
    """
    
    category = django_filters.CharFilter(field_name='category')
    difficulty = django_filters.CharFilter(field_name='difficulty')
    platform = django_filters.CharFilter(field_name='platform')
    status = django_filters.CharFilter(field_name='status')
    
    class Meta:
        model = Webinar
        fields = ['category', 'difficulty', 'platform', 'status']