from django.db import models
from django.conf import settings

class Lead(models.Model):
    STATUS_CHOICES = [
        ('Novo', 'Novo'),
        ('Contatado', 'Contatado'),
        ('Qualificado', 'Qualificado'),
    ]

    name = models.CharField(max_length=255)
    company = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Novo')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Deal(models.Model):
    STAGE_CHOICES = [
        ('Lead', 'Lead'),
        ('Contato', 'Contato'),
        ('Proposta', 'Proposta'),
        ('Negociação', 'Negociação'),
        ('Ganho', 'Ganho'),
        ('Perdido', 'Perdido'),
    ]

    title = models.CharField(max_length=255)
    value = models.DecimalField(max_digits=12, decimal_places=2)
    stage = models.CharField(max_length=20, choices=STAGE_CHOICES, default='Lead')
    product_interest = models.CharField(max_length=255)
    company = models.CharField(max_length=255) # Or ForeignKey to ClientProfile if converted
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class Activity(models.Model):
    TYPE_CHOICES = [
        ('Prospecção Novo Lead', 'Prospecção Novo Lead'),
        ('Follow Up', 'Follow Up'),
        ('Ligação', 'Ligação'),
        ('Reunião externa', 'Reunião externa'),
        ('Visita', 'Visita'),
        ('Google Event', 'Google Event'),
    ]
    STATUS_CHOICES = [
        ('pending', 'Pendente'),
        ('done', 'Realizado'),
    ]

    activity_type = models.CharField(max_length=50, choices=TYPE_CHOICES)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    date = models.DateTimeField()
    duration_minutes = models.IntegerField(default=30)
    
    deal = models.ForeignKey(Deal, on_delete=models.CASCADE, null=True, blank=True, related_name='activities')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    is_google_event = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.activity_type} - {self.title}"
