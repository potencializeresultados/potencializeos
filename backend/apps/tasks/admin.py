from django.contrib import admin
from .models import Task, SubTask

class SubTaskInline(admin.TabularInline):
    model = SubTask
    extra = 1

class TaskAdmin(admin.ModelAdmin):
    list_display = ('title', 'status', 'due_date', 'assigned_to', 'project')
    list_filter = ('status', 'assignee_type')
    inlines = [SubTaskInline]

admin.site.register(Task, TaskAdmin)
