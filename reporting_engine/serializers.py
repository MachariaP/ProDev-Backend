from rest_framework import serializers
from .models import GeneratedReport, ScheduledReport


class GeneratedReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = GeneratedReport
        fields = '__all__'
        read_only_fields = ['id']


class ScheduledReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScheduledReport
        fields = '__all__'
        read_only_fields = ['id']

