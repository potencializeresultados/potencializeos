from rest_framework import viewsets, permissions
from .models import LedgerEntry
from .serializers import LedgerEntrySerializer

class LedgerEntryViewSet(viewsets.ModelViewSet):
    queryset = LedgerEntry.objects.all()
    serializer_class = LedgerEntrySerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['ledger_type', 'date', 'consultant']
    search_fields = ['description']
