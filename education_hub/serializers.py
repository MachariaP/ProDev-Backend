from rest_framework import serializers
from .models import EducationalContent, UserProgress, SavingsChallenge, ChallengeParticipant, Webinar


class EducationalContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = EducationalContent
        fields = '__all__'
        read_only_fields = ['id']


class UserProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProgress
        fields = '__all__'
        read_only_fields = ['id']


class SavingsChallengeSerializer(serializers.ModelSerializer):
    class Meta:
        model = SavingsChallenge
        fields = '__all__'
        read_only_fields = ['id']


class ChallengeParticipantSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChallengeParticipant
        fields = '__all__'
        read_only_fields = ['id']


class WebinarSerializer(serializers.ModelSerializer):
    class Meta:
        model = Webinar
        fields = '__all__'
        read_only_fields = ['id']

