from rest_framework import serializers
from .models import Product, WorkflowStep

class WorkflowStepSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkflowStep
        fields = '__all__'

class ProductSerializer(serializers.ModelSerializer):
    workflow_steps = WorkflowStepSerializer(many=True, read_only=True)
    
    class Meta:
        model = Product
        fields = '__all__'
