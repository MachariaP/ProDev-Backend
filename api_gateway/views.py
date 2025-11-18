from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import ExternalAPIConnection, APIRequest, WebhookEndpoint
from .serializers import ExternalAPIConnectionSerializer, APIRequestSerializer, WebhookEndpointSerializer


class ExternalAPIConnectionViewSet(viewsets.ModelViewSet):
    queryset = ExternalAPIConnection.objects.all()
    serializer_class = ExternalAPIConnectionSerializer
    permission_classes = [IsAuthenticated]


class APIRequestViewSet(viewsets.ModelViewSet):
    queryset = APIRequest.objects.all()
    serializer_class = APIRequestSerializer
    permission_classes = [IsAuthenticated]


class WebhookEndpointViewSet(viewsets.ModelViewSet):
    queryset = WebhookEndpoint.objects.all()
    serializer_class = WebhookEndpointSerializer
    permission_classes = [IsAuthenticated]

