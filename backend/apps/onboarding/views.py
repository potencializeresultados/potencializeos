from rest_framework import viewsets, permissions
from .models import OnboardingItem, OnboardingTask, OnboardingNote
from .serializers import OnboardingItemSerializer, OnboardingTaskSerializer, OnboardingNoteSerializer

class OnboardingItemViewSet(viewsets.ModelViewSet):
    queryset = OnboardingItem.objects.all()
    serializer_class = OnboardingItemSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['stage', 'consultant', 'client']

class OnboardingTaskViewSet(viewsets.ModelViewSet):
    queryset = OnboardingTask.objects.all()
    serializer_class = OnboardingTaskSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['onboarding', 'completed']

class OnboardingNoteViewSet(viewsets.ModelViewSet):
    queryset = OnboardingNote.objects.all()
    serializer_class = OnboardingNoteSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['onboarding']
