from rest_framework import viewsets, permissions
from .models import Lead, Deal, Activity
from .serializers import LeadSerializer, DealSerializer, ActivitySerializer

class LeadViewSet(viewsets.ModelViewSet):
    queryset = Lead.objects.all()
    serializer_class = LeadSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['status']
    search_fields = ['name', 'company', 'email']

class DealViewSet(viewsets.ModelViewSet):
    queryset = Deal.objects.all()
    serializer_class = DealSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['stage', 'owner']
    search_fields = ['title', 'company']

class ActivityViewSet(viewsets.ModelViewSet):
    queryset = Activity.objects.all()
    serializer_class = ActivitySerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['status', 'user', 'deal']
