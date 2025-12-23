from django.contrib import admin
from .models import LedgerEntry

class LedgerEntryAdmin(admin.ModelAdmin):
    list_display = ('description', 'ledger_type', 'amount', 'date', 'consultant')
    list_filter = ('ledger_type', 'date')

admin.site.register(LedgerEntry, LedgerEntryAdmin)
