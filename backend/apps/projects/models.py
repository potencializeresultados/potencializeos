from django.db import models
from django.conf import settings
from apps.clients.models import ClientProfile

class Project(models.Model):
    PROJECT_TYPES = [
        ('Diagnóstico', 'Diagnóstico'),
        ('Assessoria', 'Assessoria'),
        ('Recorrência', 'Recorrência'),
        ('Implementação', 'Implementação'),
        ('Club', 'Club'),
    ]
    STATUS_CHOICES = [
        ('Em Andamento', 'Em Andamento'),
        ('Aguardando Aprovação', 'Aguardando Aprovação'),
        ('Concluído', 'Concluído'),
        ('Coleta de Dados', 'Coleta de Dados'),
        ('Atrasado', 'Atrasado'),
        ('Pausado', 'Pausado'),
    ]
    SLA_STATUS_CHOICES = [
        ('ok', 'OK'),
        ('warning', 'Atenção'),
        ('delay', 'Atrasado'),
    ]

    code = models.CharField(max_length=50, unique=True, blank=True)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    project_type = models.CharField(max_length=50, choices=PROJECT_TYPES)
    
    client = models.ForeignKey(ClientProfile, on_delete=models.CASCADE, related_name='projects')
    manager = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='managed_projects')
    specialist = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='specialist_projects')

    # Interlocutor
    interlocutor_name = models.CharField(max_length=255, blank=True)
    interlocutor_contact = models.CharField(max_length=50, blank=True)
    interlocutor_email = models.EmailField(blank=True)

    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='Em Andamento')
    sla_status = models.CharField(max_length=20, choices=SLA_STATUS_CHOICES, default='ok')
    progress = models.IntegerField(default=0)
    last_update = models.DateTimeField(auto_now=True)

    # Dates
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    contract_start = models.DateField(null=True, blank=True)
    contract_end = models.DateField(null=True, blank=True)

    # Details
    delivery_model = models.CharField(max_length=50, blank=True) # Online, Híbrido
    
    # Financeiro
    financial_value = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    hours_sold = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    hours_spent = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    def __str__(self):
        return f"{self.code} - {self.title}"

class ProjectMeeting(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='meetings')
    title = models.CharField(max_length=255)
    date = models.DateTimeField()
    duration_minutes = models.IntegerField()
    link = models.URLField(blank=True)
    recording_link = models.URLField(blank=True)
    attendees = models.TextField(help_text="Comma-separated list of attendees names")

    def __str__(self):
        return self.title

class ProjectDocument(models.Model):
    DOC_TYPES = [
        ('POP', 'POP'),
        ('Planilha', 'Planilha'),
        ('Contrato', 'Contrato'),
        ('Relatório', 'Relatório'),
        ('Diagnóstico', 'Diagnóstico'),
    ]
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='documents')
    title = models.CharField(max_length=255)
    doc_type = models.CharField(max_length=50, choices=DOC_TYPES)
    url = models.URLField() # Or FileField if hosting locally
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    version = models.CharField(max_length=20, default='1.0')

    def __str__(self):
        return self.title

class ProjectNote(models.Model):
    NOTE_TYPES = [
        ('internal', 'Interno'),
        ('external', 'Externo'),
        ('risk', 'Risco'),
        ('highlight', 'Destaque'),
    ]
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='notes')
    text = models.TextField()
    note_type = models.CharField(max_length=50, choices=NOTE_TYPES)
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.note_type} - {self.project.title}"
