from django.db import models

class ClientProfile(models.Model):
    STATUS_CHOICES = [
        ('Ativo', 'Ativo'),
        ('Inativo', 'Inativo'),
        ('Churn', 'Churn'),
    ]

    company_name = models.CharField(max_length=255)
    cnpj = models.CharField(max_length=20, unique=True)
    responsible_name = models.CharField(max_length=255)
    responsible_phone = models.CharField(max_length=20)
    owner_phone = models.CharField(max_length=20, blank=True)
    instagram = models.CharField(max_length=100, blank=True)
    
    # Address
    address = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=2, blank=True)
    zip_code = models.CharField(max_length=10, blank=True)

    # Metrics
    employee_count = models.IntegerField(default=0)
    client_count = models.IntegerField(default=0)

    # Operacional
    has_mapped_processes = models.BooleanField(default=False)
    is_reference = models.BooleanField(default=False)

    # Stack Tecnológico
    software_accounting = models.CharField(max_length=100, blank=True)
    software_note_capture = models.CharField(max_length=100, blank=True)
    software_file_converter = models.CharField(max_length=100, blank=True)
    software_whatsapp = models.CharField(max_length=100, blank=True)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Ativo')
    joined_at = models.DateField(auto_now_add=True)

    def __str__(self):
        return self.company_name
