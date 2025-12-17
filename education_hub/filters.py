import django_filters
from .models import EducationalContent, LearningPath, SavingsChallenge, Webinar


class EducationalContentFilter(django_filters.FilterSet):
    category = django_filters.CharFilter(field_name='category')
    difficulty = django_filters.CharFilter(field_name='difficulty')
    content_type = django_filters.CharFilter(field_name='content_type')
    is_featured = django_filters.BooleanFilter(field_name='is_featured')
    
    class Meta:
        model = EducationalContent
        fields = ['category', 'difficulty', 'content_type', 'is_featured', 'is_published']


class LearningPathFilter(django_filters.FilterSet):
    difficulty = django_filters.CharFilter(field_name='difficulty')
    path_type = django_filters.CharFilter(field_name='path_type')
    is_featured = django_filters.BooleanFilter(field_name='is_featured')
    
    class Meta:
        model = LearningPath
        fields = ['difficulty', 'path_type', 'is_featured', 'is_published']


class SavingsChallengeFilter(django_filters.FilterSet):
    challenge_type = django_filters.CharFilter(field_name='challenge_type')
    status = django_filters.CharFilter(field_name='status')
    min_target = django_filters.NumberFilter(field_name='target_amount', lookup_expr='gte')
    max_target = django_filters.NumberFilter(field_name='target_amount', lookup_expr='lte')
    
    class Meta:
        model = SavingsChallenge
        fields = ['challenge_type', 'status']


class WebinarFilter(django_filters.FilterSet):
    category = django_filters.CharFilter(field_name='category')
    difficulty = django_filters.CharFilter(field_name='difficulty')
    platform = django_filters.CharFilter(field_name='platform')
    status = django_filters.CharFilter(field_name='status')
    
    class Meta:
        model = Webinar
        fields = ['category', 'difficulty', 'platform', 'status']
