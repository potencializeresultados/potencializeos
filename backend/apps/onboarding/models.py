from django.db import models
from django.conf import settings
from apps.clients.models import ClientProfile
from apps.products.models import Product

class OnboardingItem(models.Model):
    STAGE_CHOICES = [
        ('Pendente de Kickoff', 'Pendente de Kickoff'),
        ('Em andamento', 'Em andamento'),
        ('Concluído', 'Concluído'),
    ]

    client = models.ForeignKey(ClientProfile, on_delete=models.CASCADE, related_name='onboardings')
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, related_name='onboardings')
    # Backup string if product is deleted or custom
    product_name = models.CharField(max_length=255, blank=True)
    
    stage = models.CharField(max_length=50, choices=STAGE_CHOICES, default='Pendente de Kickoff')
    start_date = models.DateField()
    consultant = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='onboarding_consultant')
    
    def __str__(self):
        return f"{self.client.company_name} - {self.product_name or self.product.title}"

    def save(self, *args, **kwargs):
        if self.product and not self.product_name:
            self.product_name = self.product.title
        super().save(*args, **kwargs)

class OnboardingTask(models.Model):
    onboarding = models.ForeignKey(OnboardingItem, on_delete=models.CASCADE, related_name='tasks')
    title = models.CharField(max_length=255)
    completed = models.BooleanField(default=False)
    due_date = models.DateField(null=True, blank=True)
    assigned_to = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='onboarding_tasks')

    def __str__(self):
        return self.title

class OnboardingNote(models.Model):
    onboarding = models.ForeignKey(OnboardingItem, on_delete=models.CASCADE, related_name='notes')
    text = models.TextField()
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Note on {self.onboarding}"
