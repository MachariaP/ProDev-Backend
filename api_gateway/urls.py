from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ExternalAPIConnectionViewSet, APIRequestViewSet, WebhookEndpointViewSet

router = DefaultRouter()
router.register(r'external-api-connections', ExternalAPIConnectionViewSet, basename='external-api-connection')
router.register(r'api-requests', APIRequestViewSet, basename='api-request')
router.register(r'webhook-endpoints', WebhookEndpointViewSet, basename='webhook-endpoint')

urlpatterns = [
    path('', include(router.urls)),
]
