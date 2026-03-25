from django.urls import path
from .views import (
    RegisterView, LoginView, GoogleAuthView, CerfaSessionView, CerfaSessionListView,
    DossierListCreateView, DossierDetailView, AdminStatsView, ActivityLogView,
    CadastreParcellesView, CadastreBatimentsView, CadastreParcelleDetailView,
    CadastreGeocodeView, CadastreSectionsView, CadastreSearchView, CadastreParcelleByCoordinatesView,
    CadastreFromAddressView,
    AdminNotificationListView, AdminNotificationMarkReadView, AdminUserListView, AdminUserActionView,
    AIAnalyzeProjectView, AISuggestDocumentsView, AIConfigureProjectView,
    AIGenerateDescriptionView, AIGenerateNoticeView, AIAnalyzePLUView, PLUAnalysisRecordView, 
    GenerateCerfaView, AISuggestCerfaFieldsView, generate_cadastre_headless
)
from .views_dp import GeneratePlanView

from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/google/', GoogleAuthView.as_view(), name='google_login'),
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
    path('cadastre/from-address/', CadastreFromAddressView.as_view(), name='cadastre_from_address'),
    
    path('admin/notifications/', AdminNotificationListView.as_view(), name='admin_notifications'),
    path('admin/notifications/mark-read/', AdminNotificationMarkReadView.as_view(), name='admin_notifications_mark_read'),
    path('admin/users/', AdminUserListView.as_view(), name='admin_users'),
    path('admin/users/action/', AdminUserActionView.as_view(), name='admin_user_action'),
    
    # AI API
    path('ai/analyze-project/', AIAnalyzeProjectView.as_view(), name='ai_analyze'),
    path('ai/suggest-documents/', AISuggestDocumentsView.as_view(), name='ai_suggest_docs'),
    path('ai/configure-project/', AIConfigureProjectView.as_view(), name='ai_configure_project'),
    path('ai/generate-description/', AIGenerateDescriptionView.as_view(), name='ai_generate_description'),
    path('ai/generate-notice/', AIGenerateNoticeView.as_view(), name='ai_generate_notice'),
    path('ai/analyze-plu/', AIAnalyzePLUView.as_view(), name='ai_analyze_plu'),
    path('ai/plu-history/', PLUAnalysisRecordView.as_view(), name='ai_plu_history'),
    path('ai/generate-plan/', GeneratePlanView.as_view(), name='ai_generate_plan'),
    path('ai/generate-cerfa/', GenerateCerfaView.as_view(), name='ai_generate_cerfa'),
    path('ai/suggest-cerfa-fields/', AISuggestCerfaFieldsView.as_view(), name='ai_suggest_cerfa_fields'),
    path('cadastre/parcelle/coords/', CadastreParcelleByCoordinatesView.as_view(), name='cadastre_parcelle_coords'),
    path('cadastre/generate/', generate_cadastre_headless, name='cadastre_generate'),
]


