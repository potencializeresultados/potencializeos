from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TicketViewSet, TicketInteractionViewSet, TicketCategoryViewSet

router = DefaultRouter()
router.register(r'tickets', TicketViewSet)
router.register(r'interactions', TicketInteractionViewSet)
router.register(r'categories', TicketCategoryViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
