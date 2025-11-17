from django.contrib import admin
from .models import (
    GroupConstitution, Fine, Vote, VoteBallot,
    Document, ComplianceRecord
)


@admin.register(GroupConstitution)
class GroupConstitutionAdmin(admin.ModelAdmin):
    list_display = ['group', 'title', 'version', 'created_at']
    search_fields = ['group__name', 'title']


@admin.register(Fine)
class FineAdmin(admin.ModelAdmin):
    list_display = ['member', 'group', 'fine_type', 'amount', 'status', 'issued_at']
    list_filter = ['fine_type', 'status', 'issued_at']


@admin.register(Vote)
class VoteAdmin(admin.ModelAdmin):
    list_display = ['title', 'group', 'status', 'vote_type', 'start_date', 'end_date']
    list_filter = ['status', 'vote_type']


@admin.register(VoteBallot)
class VoteBallotAdmin(admin.ModelAdmin):
    list_display = ['vote', 'voter', 'choice', 'is_proxy', 'cast_at']
    list_filter = ['choice', 'is_proxy']


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ['title', 'group', 'document_type', 'is_public', 'uploaded_at']
    list_filter = ['document_type', 'is_public', 'uploaded_at']


@admin.register(ComplianceRecord)
class ComplianceRecordAdmin(admin.ModelAdmin):
    list_display = ['group', 'overall_status', 'odpc_registered', 'aml_kyc_compliant', 'updated_at']
    list_filter = ['overall_status', 'odpc_registered', 'aml_kyc_compliant']

