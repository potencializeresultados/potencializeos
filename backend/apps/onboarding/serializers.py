from rest_framework import serializers
from .models import OnboardingItem, OnboardingTask, OnboardingNote
from apps.core.serializers import UserSerializer
from apps.clients.serializers import ClientProfileSerializer

class OnboardingTaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = OnboardingTask
        fields = '__all__'

class OnboardingNoteSerializer(serializers.ModelSerializer):
    user_name = serializers.ReadOnlyField(source='user.username')
    
    class Meta:
        model = OnboardingNote
        fields = '__all__'

class OnboardingItemSerializer(serializers.ModelSerializer):
    tasks = OnboardingTaskSerializer(many=True, read_only=True)
    notes = OnboardingNoteSerializer(many=True, read_only=True)
    client_details = ClientProfileSerializer(source='client', read_only=True)
    consultant_details = UserSerializer(source='consultant', read_only=True)

    class Meta:
        model = OnboardingItem
        fields = '__all__'
