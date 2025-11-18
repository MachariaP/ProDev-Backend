from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import EducationalContent, UserProgress, SavingsChallenge, ChallengeParticipant, Webinar
from .serializers import EducationalContentSerializer, UserProgressSerializer, SavingsChallengeSerializer, ChallengeParticipantSerializer, WebinarSerializer


class EducationalContentViewSet(viewsets.ModelViewSet):
    queryset = EducationalContent.objects.all()
    serializer_class = EducationalContentSerializer
    permission_classes = [IsAuthenticated]


class UserProgressViewSet(viewsets.ModelViewSet):
    queryset = UserProgress.objects.all()
    serializer_class = UserProgressSerializer
    permission_classes = [IsAuthenticated]


class SavingsChallengeViewSet(viewsets.ModelViewSet):
    queryset = SavingsChallenge.objects.all()
    serializer_class = SavingsChallengeSerializer
    permission_classes = [IsAuthenticated]


class ChallengeParticipantViewSet(viewsets.ModelViewSet):
    queryset = ChallengeParticipant.objects.all()
    serializer_class = ChallengeParticipantSerializer
    permission_classes = [IsAuthenticated]


class WebinarViewSet(viewsets.ModelViewSet):
    queryset = Webinar.objects.all()
    serializer_class = WebinarSerializer
    permission_classes = [IsAuthenticated]

