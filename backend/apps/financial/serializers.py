from rest_framework import serializers
from .models import LedgerEntry

class LedgerEntrySerializer(serializers.ModelSerializer):
    consultant_name = serializers.ReadOnlyField(source='consultant.username')

    class Meta:
        model = LedgerEntry
        fields = '__all__'
