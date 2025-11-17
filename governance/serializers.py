from rest_framework import serializers
from .models import (
    GroupConstitution, Fine, Vote, VoteBallot,
    Document, ComplianceRecord
)


class GroupConstitutionSerializer(serializers.ModelSerializer):
    """Serializer for Group Constitution."""
    
    group_name = serializers.CharField(source='group.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = GroupConstitution
        fields = [
            'id', 'group', 'group_name', 'title', 'content',
            'membership_rules', 'contribution_rules', 'loan_policy',
            'exit_procedure', 'late_contribution_fine',
            'missed_meeting_fine', 'constitution_document',
            'version', 'created_by', 'created_by_name',
            'created_at', 'updated_at', 'approved_at'
        ]
        read_only_fields = ['id', 'version', 'created_at', 'updated_at', 'approved_at']


class FineSerializer(serializers.ModelSerializer):
    """Serializer for Fines."""
    
    group_name = serializers.CharField(source='group.name', read_only=True)
    member_name = serializers.CharField(source='member.get_full_name', read_only=True)
    issued_by_name = serializers.CharField(source='issued_by.get_full_name', read_only=True)
    
    class Meta:
        model = Fine
        fields = [
            'id', 'group', 'group_name', 'member', 'member_name',
            'fine_type', 'amount', 'reason', 'status',
            'issued_by', 'issued_by_name', 'issued_at',
            'paid_at', 'waived_at', 'notes'
        ]
        read_only_fields = ['id', 'issued_by', 'issued_at', 'paid_at', 'waived_at']


class VoteBallotSerializer(serializers.ModelSerializer):
    """Serializer for Vote Ballots."""
    
    voter_name = serializers.CharField(source='voter.get_full_name', read_only=True)
    proxy_for_name = serializers.CharField(source='proxy_for.get_full_name', read_only=True)
    
    class Meta:
        model = VoteBallot
        fields = [
            'id', 'vote', 'voter', 'voter_name', 'choice',
            'is_proxy', 'proxy_for', 'proxy_for_name',
            'cast_at', 'comments'
        ]
        read_only_fields = ['id', 'cast_at']


class VoteSerializer(serializers.ModelSerializer):
    """Serializer for Votes."""
    
    group_name = serializers.CharField(source='group.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    is_passed = serializers.BooleanField(read_only=True)
    ballots = VoteBallotSerializer(many=True, read_only=True)
    
    class Meta:
        model = Vote
        fields = [
            'id', 'group', 'group_name', 'title', 'description',
            'vote_type', 'status', 'allow_proxy', 'start_date',
            'end_date', 'total_eligible_voters', 'total_votes_cast',
            'yes_votes', 'no_votes', 'abstain_votes', 'is_passed',
            'created_by', 'created_by_name', 'ballots',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'total_votes_cast', 'yes_votes', 'no_votes',
            'abstain_votes', 'created_at', 'updated_at'
        ]


class DocumentSerializer(serializers.ModelSerializer):
    """Serializer for Documents."""
    
    group_name = serializers.CharField(source='group.name', read_only=True)
    uploaded_by_name = serializers.CharField(source='uploaded_by.get_full_name', read_only=True)
    
    class Meta:
        model = Document
        fields = [
            'id', 'group', 'group_name', 'title', 'document_type',
            'description', 'file', 'is_public', 'uploaded_by',
            'uploaded_by_name', 'uploaded_at', 'file_size'
        ]
        read_only_fields = ['id', 'uploaded_by', 'uploaded_at', 'file_size']


class ComplianceRecordSerializer(serializers.ModelSerializer):
    """Serializer for Compliance Records."""
    
    group_name = serializers.CharField(source='group.name', read_only=True)
    
    class Meta:
        model = ComplianceRecord
        fields = [
            'id', 'group', 'group_name', 'odpc_registered',
            'odpc_registration_number', 'aml_kyc_compliant',
            'security_certified', 'certification_type',
            'overall_status', 'compliance_certificate',
            'last_audit_date', 'next_audit_date', 'notes',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
