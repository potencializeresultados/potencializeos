from django.contrib import admin
from .models import Lead, Deal, Activity

class ActivityInline(admin.TabularInline):
    model = Activity
    extra = 1

class DealAdmin(admin.ModelAdmin):
    list_display = ('title', 'value', 'stage', 'company', 'owner')
    list_filter = ('stage', 'owner')
    inlines = [ActivityInline]

admin.site.register(Lead)
admin.site.register(Deal, DealAdmin)
admin.site.register(Activity)
