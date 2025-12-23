from django.contrib import admin
from .models import OnboardingItem, OnboardingTask, OnboardingNote

class OnboardingTaskInline(admin.TabularInline):
    model = OnboardingTask
    extra = 1

class OnboardingNoteInline(admin.TabularInline):
    model = OnboardingNote
    extra = 0

class OnboardingItemAdmin(admin.ModelAdmin):
    list_display = ('client', 'product_name', 'stage', 'consultant', 'start_date')
    list_filter = ('stage', 'start_date')
    inlines = [OnboardingTaskInline, OnboardingNoteInline]

admin.site.register(OnboardingItem, OnboardingItemAdmin)
