from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from django.db import transaction
from groups.models import GroupMembership
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
        """Set created_by to current user and calculate total eligible voters."""
        vote = serializer.save(created_by=self.request.user)
        # Set total eligible voters to the number of active members in the group
        eligible_voters = GroupMembership.objects.filter(
            group=vote.group,
            status='ACTIVE'
        ).count()
        vote.total_eligible_voters = eligible_voters
        vote.save()
    
    def _validate_vote_eligibility(self, vote, user):
        """Validate if user is eligible to vote."""
        # Validate vote is active
        if vote.status != 'ACTIVE':
            return False, 'This vote is not active'
        
        # Validate voting period
        now = timezone.now()
        if now < vote.start_date:
            return False, 'Voting has not started yet'
        if now > vote.end_date:
            return False, 'Voting period has ended'
        
        # Check if user is a member of the group
        membership = GroupMembership.objects.filter(
            group=vote.group,
            user=user,
            status='ACTIVE'
        ).first()
        
        if not membership:
            return False, 'You must be an active member to vote'
        
        # Check if user has already voted
        existing_ballot = VoteBallot.objects.filter(
            vote=vote,
            voter=user
        ).first()
        
        if existing_ballot:
            return False, 'You have already voted on this item'
        
        return True, None
    
    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """Activate a vote to start voting period."""
        vote = self.get_object()
        
        if vote.status != 'DRAFT':
            return Response(
                {'error': 'Only draft votes can be activated'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        vote.status = 'ACTIVE'
        vote.save()
        
        serializer = self.get_serializer(vote)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def close(self, request, pk=None):
        """Close a vote and finalize results."""
        vote = self.get_object()
        
        if vote.status != 'ACTIVE':
            return Response(
                {'error': 'Only active votes can be closed'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        vote.status = 'CLOSED'
        vote.save()
        
        serializer = self.get_serializer(vote)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def cast_vote(self, request, pk=None):
        """Cast a vote on this voting item."""
        vote = self.get_object()
        
        # Validate eligibility
        is_valid, error_message = self._validate_vote_eligibility(vote, request.user)
        if not is_valid:
            return Response(
                {'error': error_message},
                status=status.HTTP_400_BAD_REQUEST if 'not active' in error_message or 'already voted' in error_message else status.HTTP_403_FORBIDDEN
            )
        
        # Get choice from request
        choice = request.data.get('choice')
        if choice not in ['YES', 'NO', 'ABSTAIN']:
            return Response(
                {'error': 'Invalid choice. Must be YES, NO, or ABSTAIN'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create ballot and update vote counts atomically
        with transaction.atomic():
            ballot = VoteBallot.objects.create(
                vote=vote,
                voter=request.user,
                choice=choice,
                comments=request.data.get('comments', '')
            )
            
            # Update vote counts
            vote.total_votes_cast += 1
            if choice == 'YES':
                vote.yes_votes += 1
            elif choice == 'NO':
                vote.no_votes += 1
            elif choice == 'ABSTAIN':
                vote.abstain_votes += 1
            
            vote.save()
        
        ballot_serializer = VoteBallotSerializer(ballot)
        vote_serializer = self.get_serializer(vote)
        
        return Response({
            'ballot': ballot_serializer.data,
            'vote': vote_serializer.data,
            'message': 'Vote cast successfully'
        }, status=status.HTTP_201_CREATED)


class VoteBallotViewSet(viewsets.ModelViewSet):
    """ViewSet for Vote Ballots."""
    
    queryset = VoteBallot.objects.all()
    serializer_class = VoteBallotSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['vote', 'voter', 'choice']
    
    def get_queryset(self):
        """Filter ballots to only show user's own ballots unless they're admin."""
        queryset = super().get_queryset()
        if not self.request.user.is_staff:
            # Regular users can only see their own ballots
            queryset = queryset.filter(voter=self.request.user)
        return queryset
    
    def perform_create(self, serializer):
        """Validate and create a ballot with vote count updates."""
        vote = serializer.validated_data['vote']
        
        # Validate vote is active
        if vote.status != 'ACTIVE':
            raise ValidationError('This vote is not active')
        
        # Validate voting period
        now = timezone.now()
        if now < vote.start_date:
            raise ValidationError('Voting has not started yet')
        if now > vote.end_date:
            raise ValidationError('Voting period has ended')
        
        # Check if user has already voted
        existing_ballot = VoteBallot.objects.filter(
            vote=vote,
            voter=self.request.user
        ).first()
        
        if existing_ballot:
            raise ValidationError('You have already voted on this item')
        
        # Create ballot and update vote counts atomically
        with transaction.atomic():
            if not serializer.validated_data.get('is_proxy'):
                ballot = serializer.save(voter=self.request.user)
            else:
                ballot = serializer.save()
            
            # Update vote counts
            choice = ballot.choice
            vote.total_votes_cast += 1
            if choice == 'YES':
                vote.yes_votes += 1
            elif choice == 'NO':
                vote.no_votes += 1
            elif choice == 'ABSTAIN':
                vote.abstain_votes += 1
            
            vote.save()


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

