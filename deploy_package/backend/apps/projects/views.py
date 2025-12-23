from rest_framework import viewsets, permissions
from .models import Project, ProjectMeeting, ProjectDocument, ProjectNote
from .serializers import ProjectSerializer, ProjectMeetingSerializer, ProjectDocumentSerializer, ProjectNoteSerializer

class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['status', 'project_type', 'client', 'manager']
    search_fields = ['title', 'code', 'client__company_name']

class ProjectMeetingViewSet(viewsets.ModelViewSet):
    queryset = ProjectMeeting.objects.all()
    serializer_class = ProjectMeetingSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['project']

class ProjectDocumentViewSet(viewsets.ModelViewSet):
    queryset = ProjectDocument.objects.all()
    serializer_class = ProjectDocumentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['project', 'type']

class ProjectNoteViewSet(viewsets.ModelViewSet):
    queryset = ProjectNote.objects.all()
    serializer_class = ProjectNoteSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['project', 'type']
