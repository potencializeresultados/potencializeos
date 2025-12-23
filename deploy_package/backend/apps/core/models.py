from django.db import models
from django.contrib.auth.models import AbstractUser

class SystemPermission(models.Model):
    key = models.CharField(max_length=100, unique=True)
    label = models.CharField(max_length=255)
    module = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.module} - {self.label}"

class Role(models.Model):
    id = models.CharField(max_length=50, primary_key=True) # Using string ID to match frontend 'admin', 'consultant' etc
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    permissions = models.ManyToManyField(SystemPermission, blank=True)
    is_system = models.BooleanField(default=False)

    def __str__(self):
        return self.name

class User(AbstractUser):
    role = models.ForeignKey(Role, on_delete=models.SET_NULL, null=True, blank=True)
    avatar = models.URLField(max_length=500, blank=True, null=True)
    company_name = models.CharField(max_length=255, blank=True, null=True)
    
    # Resolver conflito do AbstractUser
    groups = models.ManyToManyField(
        'auth.Group',
        verbose_name='groups',
        blank=True,
        help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.',
        related_name="core_user_groups",
        related_query_name="user",
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        verbose_name='user permissions',
        blank=True,
        help_text='Specific permissions for this user.',
        related_name="core_user_permissions",
        related_query_name="user",
    )

    def __str__(self):
        return self.username
