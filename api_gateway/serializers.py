from rest_framework import serializers
from .models import ExternalAPIConnection, APIRequest, WebhookEndpoint


class ExternalAPIConnectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExternalAPIConnection
        fields = '__all__'
        read_only_fields = ['id']


class APIRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = APIRequest
        fields = '__all__'
        read_only_fields = ['id']


class WebhookEndpointSerializer(serializers.ModelSerializer):
    class Meta:
        model = WebhookEndpoint
        fields = '__all__'
        read_only_fields = ['id']

