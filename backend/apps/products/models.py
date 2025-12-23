from django.db import models

class Product(models.Model):
    PRICE_MODEL_CHOICES = [
        ('fixed', 'Fixo'),
        ('hourly', 'Por Hora'),
        ('monthly', 'Mensal'),
        ('yearly', 'Anual'),
    ]
    CATEGORY_CHOICES = [
        ('Curso', 'Curso'),
        ('Diagnóstico', 'Diagnóstico'),
        ('Assessoria', 'Assessoria'),
        ('Horas', 'Horas'),
        ('Club', 'Club'),
    ]

    title = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    price_model = models.CharField(max_length=20, choices=PRICE_MODEL_CHOICES)
    description = models.TextField()
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    payment_methods = models.CharField(max_length=255, help_text="Comma-separated payment methods")
    onboarding_process = models.TextField(blank=True)
    automation_desc = models.TextField(blank=True)

    def __str__(self):
        return self.title

class WorkflowStep(models.Model):
    TYPE_CHOICES = [
        ('meeting', 'Reunião'),
        ('task', 'Tarefa'),
        ('milestone', 'Marco'),
    ]
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='workflow_steps')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    step_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    relative_days = models.IntegerField(default=0)
    duration_hours = models.IntegerField(default=1)

    def __str__(self):
        return f"{self.product.title} - {self.title}"
