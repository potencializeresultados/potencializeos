from rest_framework import viewsets, permissions
from .models import Ticket, TicketInteraction, TicketCategory
from .serializers import TicketSerializer, TicketInteractionSerializer, TicketCategorySerializer

class TicketViewSet(viewsets.ModelViewSet):
    queryset = Ticket.objects.all()
    serializer_class = TicketSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['status', 'priority', 'area', 'project']
    search_fields = ['title', 'description']

class TicketInteractionViewSet(viewsets.ModelViewSet):
    queryset = TicketInteraction.objects.all()
    serializer_class = TicketInteractionSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['ticket']

class TicketCategoryViewSet(viewsets.ModelViewSet):
    queryset = TicketCategory.objects.all()
    serializer_class = TicketCategorySerializer
    permission_classes = [permissions.IsAuthenticated]
