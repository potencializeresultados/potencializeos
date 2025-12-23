from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Auth (JWT)
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Apps
    path('api/core/', include('apps.core.urls')),
    path('api/clients/', include('apps.clients.urls')),
    path('api/projects/', include('apps.projects.urls')),
    path('api/tasks/', include('apps.tasks.urls')),
    path('api/crm/', include('apps.crm.urls')),
    path('api/support/', include('apps.support.urls')),
    path('api/financial/', include('apps.financial.urls')),
    path('api/products/', include('apps.products.urls')),
    path('api/onboarding/', include('apps.onboarding.urls')),
]
