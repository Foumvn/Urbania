from django.urls import path
from .views import (
    RegisterView, LoginView, CerfaSessionView, CerfaSessionListView,
    DossierListCreateView, DossierDetailView, AdminStatsView, ActivityLogView,
    CadastreParcellesView, CadastreBatimentsView, CadastreParcelleDetailView,
    CadastreGeocodeView, CadastreSectionsView, CadastreSearchView, CadastreParcelleByCoordinatesView,
    AdminNotificationListView, AdminNotificationMarkReadView, AdminUserListView,
    AIAnalyzeProjectView, AISuggestDocumentsView, AIConfigureProjectView, AIGenerateDescriptionView,
    AIGenerateDocumentView
)

from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    path('sessions/', CerfaSessionView.as_view(), name='sessions'),
    path('admin/sessions/', CerfaSessionListView.as_view(), name='admin_sessions'),
    path('dossiers/', DossierListCreateView.as_view(), name='dossiers'),
    path('dossiers/<int:pk>/', DossierDetailView.as_view(), name='dossier_detail'),
    
    path('stats/', AdminStatsView.as_view(), name='stats'),
    path('activity/', ActivityLogView.as_view(), name='activity'),
    
    # Cadastre API - API officielle cadastre.gouv.fr
    path('cadastre/parcelles/<str:code_insee>/', CadastreParcellesView.as_view(), name='cadastre_parcelles'),
    path('cadastre/batiments/<str:code_insee>/', CadastreBatimentsView.as_view(), name='cadastre_batiments'),
    path('cadastre/parcelle/<str:code_insee>/<str:section>/<str:numero>/', CadastreParcelleDetailView.as_view(), name='cadastre_parcelle_detail'),
    path('cadastre/geocode/', CadastreGeocodeView.as_view(), name='cadastre_geocode'),
    path('cadastre/sections/<str:code_insee>/', CadastreSectionsView.as_view(), name='cadastre_sections'),
    path('cadastre/search/', CadastreSearchView.as_view(), name='cadastre_search'),
    
    path('admin/notifications/', AdminNotificationListView.as_view(), name='admin_notifications'),
    path('admin/notifications/mark-read/', AdminNotificationMarkReadView.as_view(), name='admin_notifications_mark_read'),
    path('admin/users/', AdminUserListView.as_view(), name='admin_users'),
    
    # AI API
    path('ai/analyze-project/', AIAnalyzeProjectView.as_view(), name='ai_analyze'),
    path('ai/suggest-documents/', AISuggestDocumentsView.as_view(), name='ai_suggest_docs'),
    path('ai/configure-project/', AIConfigureProjectView.as_view(), name='ai_configure_project'),
    path('ai/generate-description/', AIGenerateDescriptionView.as_view(), name='ai_generate_description'),
    path('ai/generate-document/', AIGenerateDocumentView.as_view(), name='ai_generate_document'),
    
    path('cadastre/parcelle/coords/', CadastreParcelleByCoordinatesView.as_view(), name='cadastre_parcelle_coords'),
]


