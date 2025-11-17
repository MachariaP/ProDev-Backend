from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    GroupConstitutionViewSet, FineViewSet, VoteViewSet,
    VoteBallotViewSet, DocumentViewSet, ComplianceRecordViewSet
)

router = DefaultRouter()
router.register(r'constitutions', GroupConstitutionViewSet, basename='constitution')
router.register(r'fines', FineViewSet, basename='fine')
router.register(r'votes', VoteViewSet, basename='vote')
router.register(r'vote-ballots', VoteBallotViewSet, basename='voteballot')
router.register(r'documents', DocumentViewSet, basename='document')
router.register(r'compliance-records', ComplianceRecordViewSet, basename='compliancerecord')

urlpatterns = [
    path('', include(router.urls)),
]
