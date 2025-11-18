from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import GeneratedReportViewSet, ScheduledReportViewSet

router = DefaultRouter()
router.register(r'generated-reports', GeneratedReportViewSet, basename='generated-report')
router.register(r'scheduled-reports', ScheduledReportViewSet, basename='scheduled-report')

urlpatterns = [
    path('', include(router.urls)),
]
