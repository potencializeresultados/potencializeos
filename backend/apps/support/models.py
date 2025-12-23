from django.db import models
from django.conf import settings
from apps.projects.models import Project

class TicketCategory(models.Model):
    name = models.CharField(max_length=100)
    
    def __str__(self):
        return self.name

class Ticket(models.Model):
    PRIORITY_CHOICES = [
        ('Baixa', 'Baixa'),
        ('Média', 'Média'),
        ('Alta', 'Alta'),
        ('Urgente', 'Urgente'),
    ]
    STATUS_CHOICES = [
        ('Aberto', 'Aberto'),
        ('Em Análise', 'Em Análise'),
        ('Respondido Pelo Consultor', 'Respondido Pelo Consultor'),
        ('Respondido pelo Cliente', 'Respondido pelo Cliente'),
        ('Em Andamento', 'Em Andamento'),
        ('Aguardando Cliente', 'Aguardando Cliente'),
        ('Resolvido', 'Resolvido'),
        ('Concluído', 'Concluído'),
    ]
    AREA_CHOICES = [
        ('Fiscal', 'Fiscal'),
        ('Contábil', 'Contábil'),
        ('Pessoal', 'Pessoal'),
        ('Domínio', 'Domínio'),
        ('Financeiro', 'Financeiro'),
        ('TI', 'TI'),
        ('Sucesso do Cliente', 'Sucesso do Cliente'),
    ]

    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='tickets')
    title = models.CharField(max_length=255)
    description = models.TextField()
    ticket_type = models.CharField(max_length=100) # Can be FK to TicketCategory, but keeping flexible string per types.ts
    area = models.CharField(max_length=50, choices=AREA_CHOICES)
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='Aberto')
    
    opened_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='opened_tickets')
    assigned_to = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_tickets')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    sla_deadline = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"#{self.id} - {self.title}"

class TicketInteraction(models.Model):
    ROLE_CHOICES = [
        ('client', 'Cliente'),
        ('support', 'Suporte'),
        ('system', 'Sistema'),
    ]
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name='interactions')
    text = models.TextField()
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Interaction on {self.ticket.id}"
