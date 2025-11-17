from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, MemberWalletViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'wallets', MemberWalletViewSet, basename='wallet')

urlpatterns = [
    path('', include(router.urls)),
]
