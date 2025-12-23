from django.contrib import admin
from .models import Ticket, TicketInteraction, TicketCategory

class TicketInteractionInline(admin.TabularInline):
    model = TicketInteraction
    extra = 0

class TicketAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'status', 'priority', 'project', 'assigned_to')
    list_filter = ('status', 'priority', 'area')
    inlines = [TicketInteractionInline]

admin.site.register(Ticket, TicketAdmin)
admin.site.register(TicketCategory)
