from rest_framework import viewsets, permissions
from .models import Product, WorkflowStep
from .serializers import ProductSerializer, WorkflowStepSerializer

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['category', 'price_model']
    search_fields = ['title', 'description']

class WorkflowStepViewSet(viewsets.ModelViewSet):
    queryset = WorkflowStep.objects.all()
    serializer_class = WorkflowStepSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['product', 'step_type']
