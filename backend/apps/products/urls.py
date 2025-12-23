from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductViewSet, WorkflowStepViewSet

router = DefaultRouter()
router.register(r'products', ProductViewSet)
router.register(r'workflow-steps', WorkflowStepViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
