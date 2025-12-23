from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LeadViewSet, DealViewSet, ActivityViewSet

router = DefaultRouter()
router.register(r'leads', LeadViewSet)
router.register(r'deals', DealViewSet)
router.register(r'activities', ActivityViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
