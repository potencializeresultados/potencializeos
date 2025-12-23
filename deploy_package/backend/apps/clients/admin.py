from django.contrib import admin
from .models import ClientProfile

class ClientProfileAdmin(admin.ModelAdmin):
    list_display = ('company_name', 'cnpj', 'status', 'city', 'state')
    search_fields = ('company_name', 'cnpj')
    list_filter = ('status', 'state')

admin.site.register(ClientProfile, ClientProfileAdmin)
