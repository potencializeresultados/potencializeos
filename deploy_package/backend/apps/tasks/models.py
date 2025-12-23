from django.db import models
from django.conf import settings
from apps.projects.models import Project

class Task(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pendente'),
        ('in_progress', 'Em Andamento'),
        ('completed', 'Concluído'),
        ('overdue', 'Atrasado'),
    ]
    ASSIGNEE_TYPE_CHOICES = [
        ('consultant', 'Consultor'),
        ('client', 'Cliente'),
    ]

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    due_date = models.DateField(null=True, blank=True)
    
    assigned_to = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='tasks')
    assignee_type = models.CharField(max_length=20, choices=ASSIGNEE_TYPE_CHOICES, default='consultant')
    
    project = models.ForeignKey(Project, on_delete=models.CASCADE, null=True, blank=True, related_name='tasks')
    
    google_synced = models.BooleanField(default=False)
    google_task_id = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return self.title

class SubTask(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='subtasks')
    title = models.CharField(max_length=255)
    completed = models.BooleanField(default=False)

    def __str__(self):
        return self.title
