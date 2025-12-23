from django.contrib import admin
from .models import Project, ProjectMeeting, ProjectDocument, ProjectNote

class ProjectAdmin(admin.ModelAdmin):
    list_display = ('code', 'title', 'client', 'status', 'manager')
    list_filter = ('status', 'project_type', 'manager')
    search_fields = ('title', 'code', 'client__company_name')

admin.site.register(Project, ProjectAdmin)
admin.site.register(ProjectMeeting)
admin.site.register(ProjectDocument)
admin.site.register(ProjectNote)
