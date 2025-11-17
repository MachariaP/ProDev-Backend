from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ChamaGroupViewSet, GroupMembershipViewSet,
    GroupOfficialViewSet, GroupGoalViewSet
)

router = DefaultRouter()
router.register(r'chama-groups', ChamaGroupViewSet, basename='chamagroup')
router.register(r'memberships', GroupMembershipViewSet, basename='membership')
router.register(r'officials', GroupOfficialViewSet, basename='official')
router.register(r'goals', GroupGoalViewSet, basename='goal')

urlpatterns = [
    path('', include(router.urls)),
]
