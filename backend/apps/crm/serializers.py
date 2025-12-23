from rest_framework import serializers
from .models import Lead, Deal, Activity
from apps.core.serializers import UserSerializer

class LeadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lead
        fields = '__all__'

class ActivitySerializer(serializers.ModelSerializer):
    user_name = serializers.ReadOnlyField(source='user.username')
    
    class Meta:
        model = Activity
        fields = '__all__'

class DealSerializer(serializers.ModelSerializer):
    owner_details = UserSerializer(source='owner', read_only=True)
    activities = ActivitySerializer(many=True, read_only=True)
    
    class Meta:
        model = Deal
        fields = '__all__'
