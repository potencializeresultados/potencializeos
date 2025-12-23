from rest_framework import serializers
from .models import Project, ProjectMeeting, ProjectDocument, ProjectNote
from apps.clients.serializers import ClientProfileSerializer
from apps.core.serializers import UserSerializer

class ProjectMeetingSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectMeeting
        fields = '__all__'

class ProjectDocumentSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.ReadOnlyField(source='uploaded_by.username')

    class Meta:
        model = ProjectDocument
        fields = '__all__'

class ProjectNoteSerializer(serializers.ModelSerializer):
    author_name = serializers.ReadOnlyField(source='author.username')

    class Meta:
        model = ProjectNote
        fields = '__all__'

class ProjectSerializer(serializers.ModelSerializer):
    client_details = ClientProfileSerializer(source='client', read_only=True)
    manager_details = UserSerializer(source='manager', read_only=True)
    specialist_details = UserSerializer(source='specialist', read_only=True)
    
    meetings = ProjectMeetingSerializer(many=True, read_only=True)
    documents = ProjectDocumentSerializer(many=True, read_only=True)
    notes = ProjectNoteSerializer(many=True, read_only=True)

    class Meta:
        model = Project
        fields = '__all__'
