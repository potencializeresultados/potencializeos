from django.contrib import admin
from .models import Product, WorkflowStep

class WorkflowStepInline(admin.TabularInline):
    model = WorkflowStep
    extra = 1

class ProductAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'price', 'price_model')
    list_filter = ('category', 'price_model')
    inlines = [WorkflowStepInline]

admin.site.register(Product, ProductAdmin)
