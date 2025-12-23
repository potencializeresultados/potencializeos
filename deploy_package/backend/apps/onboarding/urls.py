from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import OnboardingItemViewSet, OnboardingTaskViewSet, OnboardingNoteViewSet

router = DefaultRouter()
router.register(r'items', OnboardingItemViewSet)
router.register(r'tasks', OnboardingTaskViewSet)
router.register(r'notes', OnboardingNoteViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
