from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Role, SystemPermission

class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'role', 'is_staff')
    fieldsets = UserAdmin.fieldsets + (
        ('Custom Fields', {'fields': ('role', 'avatar', 'company_name')}),
    )

admin.site.register(User, CustomUserAdmin)
admin.site.register(Role)
admin.site.register(SystemPermission)
