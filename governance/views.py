from rest_framework import viewsets, permissions
from django_filters.rest_framework import DjangoFilterBackend
from .models import (
    GroupConstitution, Fine, Vote, VoteBallot,
    Document, ComplianceRecord
)
from .serializers import (
    GroupConstitutionSerializer, FineSerializer,
    VoteSerializer, VoteBallotSerializer,
    DocumentSerializer, ComplianceRecordSerializer
)


class GroupConstitutionViewSet(viewsets.ModelViewSet):
    """ViewSet for Group Constitutions."""
    
    queryset = GroupConstitution.objects.all()
    serializer_class = GroupConstitutionSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['group']
    
    def perform_create(self, serializer):
        """Set created_by to current user."""
        serializer.save(created_by=self.request.user)


class FineViewSet(viewsets.ModelViewSet):
    """ViewSet for Fines."""
    
    queryset = Fine.objects.all()
    serializer_class = FineSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['group', 'member', 'fine_type', 'status']
    
    def perform_create(self, serializer):
        """Set issued_by to current user."""
        serializer.save(issued_by=self.request.user)


class VoteViewSet(viewsets.ModelViewSet):
    """ViewSet for Votes."""
    
    queryset = Vote.objects.all()
    serializer_class = VoteSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['group', 'status', 'vote_type']
    
    def perform_create(self, serializer):
        """Set created_by to current user."""
        serializer.save(created_by=self.request.user)


class VoteBallotViewSet(viewsets.ModelViewSet):
    """ViewSet for Vote Ballots."""
    
    queryset = VoteBallot.objects.all()
    serializer_class = VoteBallotSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['vote', 'voter', 'choice']
    
    def perform_create(self, serializer):
        """Set voter to current user if not proxy."""
        if not serializer.validated_data.get('is_proxy'):
            serializer.save(voter=self.request.user)
        else:
            serializer.save()


class DocumentViewSet(viewsets.ModelViewSet):
    """ViewSet for Documents."""
    
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['group', 'document_type', 'is_public']
    
    def perform_create(self, serializer):
        """Set uploaded_by to current user."""
        serializer.save(uploaded_by=self.request.user)


class ComplianceRecordViewSet(viewsets.ModelViewSet):
    """ViewSet for Compliance Records."""
    
    queryset = ComplianceRecord.objects.all()
    serializer_class = ComplianceRecordSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['group', 'overall_status']

