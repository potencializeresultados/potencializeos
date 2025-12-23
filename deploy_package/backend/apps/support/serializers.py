from rest_framework import serializers
from .models import Ticket, TicketInteraction, TicketCategory
from apps.core.serializers import UserSerializer

class TicketCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = TicketCategory
        fields = '__all__'

class TicketInteractionSerializer(serializers.ModelSerializer):
    sender_name = serializers.ReadOnlyField(source='sender.username')
    
    class Meta:
        model = TicketInteraction
        fields = '__all__'

class TicketSerializer(serializers.ModelSerializer):
    interactions = TicketInteractionSerializer(many=True, read_only=True)
    opened_by_details = UserSerializer(source='opened_by', read_only=True)
    assigned_to_details = UserSerializer(source='assigned_to', read_only=True)
    
    class Meta:
        model = Ticket
        fields = '__all__'
