from rest_framework import viewsets, permissions
from .models import ClientProfile
from .serializers import ClientProfileSerializer

class ClientProfileViewSet(viewsets.ModelViewSet):
    queryset = ClientProfile.objects.all()
    serializer_class = ClientProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['status', 'state', 'has_mapped_processes']
    search_fields = ['company_name', 'cnpj', 'responsible_name']
