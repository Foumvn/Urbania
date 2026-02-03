from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from core.models import CerfaSession, Dossier, ActivityLog, AdminNotification, Profile
from .serializers import (
    UserSerializer, RegisterSerializer, 
    CerfaSessionSerializer, CerfaSessionAdminSerializer,
    DossierSerializer, ActivityLogSerializer, AdminNotificationSerializer
)
from django.db.models import Count, Q
from django.utils import timezone
from datetime import datetime, timedelta
from .services.ai_service import AIService


class IsAdminRole(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and 
                    getattr(request.user, 'profile', None) and request.user.profile.role == 'admin')

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            
            # Log activity
            ActivityLog.objects.create(
                user=user,
                activity_type="session_created",
                details=f"Nouvel utilisateur inscrit: {user.email}",
                ip_address=request.META.get('REMOTE_ADDR')
            )
            
            # Create Admin Notification
            role = user.profile.role
            if role == 'client':
                AdminNotification.objects.create(
                    title="Nouveau Client",
                    message=f"L'utilisateur {user.email} vient de s'inscrire.",
                    notification_type="new_user"
                )
            elif role == 'admin':
                AdminNotification.objects.create(
                    title="Nouvel Administrateur",
                    message=f"L'administrateur {user.email} a été ajouté au système.",
                    notification_type="new_admin"
                )
            
            return Response({
                "user": UserSerializer(user).data,
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
        
        if user:
            refresh = RefreshToken.for_user(user)
            
            # Log activity
            ActivityLog.objects.create(
                user=user,
                activity_type="admin_login",
                details=f"Connexion réussie: {user.username}",
                ip_address=request.META.get('REMOTE_ADDR')
            )
            
            return Response({
                "user": UserSerializer(user).data,
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            })
        return Response({"error": "Identifiants invalides"}, status=status.HTTP_401_UNAUTHORIZED)

class CerfaSessionView(APIView):
    def get(self, request):
        session, created = CerfaSession.objects.get_or_create(user=request.user)
        serializer = CerfaSessionSerializer(session)
        return Response(serializer.data)

    def post(self, request):
        session, created = CerfaSession.objects.get_or_create(user=request.user)
        session.data = request.data.get('data', session.data)
        session.current_step = request.data.get('currentStep', session.current_step)
        session.save()
        
        # Log activity periodically or on specific changes if needed
        return Response(CerfaSessionSerializer(session).data)

class CerfaSessionListView(generics.ListAPIView):
    queryset = CerfaSession.objects.all().order_by('-updated_at')
    serializer_class = CerfaSessionAdminSerializer
    permission_classes = [IsAdminRole]

class DossierListCreateView(generics.ListCreateAPIView):
    serializer_class = DossierSerializer

    def get_queryset(self):
        return Dossier.objects.filter(user=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        dossier = serializer.save(user=self.request.user)
        
        # When a dossier is submitted, clear the session draft
        CerfaSession.objects.filter(user=self.request.user).update(data={}, current_step=0)
        
        # Log activity
        ActivityLog.objects.create(
            user=self.request.user,
            activity_type="session_completed",
            details=f"Dossier {dossier.id} créé par {self.request.user.username}",
            ip_address=self.request.META.get('REMOTE_ADDR')
        )

class DossierDetailView(generics.RetrieveAPIView):
    serializer_class = DossierSerializer
    
    def get_queryset(self):
        return Dossier.objects.filter(user=self.request.user)

class AdminStatsView(APIView):
    permission_classes = [IsAdminRole]

    def get(self, request):
        total_dossiers = Dossier.objects.count()
        completed = Dossier.objects.filter(status='completed').count()
        in_progress = CerfaSession.objects.exclude(data={}).count()
        abandoned = Dossier.objects.filter(status='abandoned').count()
        
        # Today's new dossiers
        now = timezone.now()
        start_of_day = now.replace(hour=0, minute=0, second=0, microsecond=0)
        today_new = Dossier.objects.filter(created_at__gte=start_of_day).count()
        
        # Real weekly growth
        seven_days_ago = now - timedelta(days=7)
        fourteen_days_ago = now - timedelta(days=14)
        last_week_count = Dossier.objects.filter(created_at__gte=seven_days_ago).count()
        prev_week_count = Dossier.objects.filter(created_at__gte=fourteen_days_ago, created_at__lt=seven_days_ago).count()
        
        weekly_growth = 0
        if prev_week_count > 0:
            weekly_growth = int(((last_week_count - prev_week_count) / prev_week_count) * 100)
        elif last_week_count > 0:
            weekly_growth = 100

        # Distributions aggregation
        from collections import Counter
        by_type = Counter({'particulier': 0, 'personne_morale': 0})
        by_nature = Counter()

        # Combine data from Dossiers and active Sessions
        all_data_sources = list(Dossier.objects.values_list('data', flat=True)) + \
                          list(CerfaSession.objects.exclude(data={}).values_list('data', flat=True))

        for data in all_data_sources:
            if not data: continue
            
            t = data.get('typeDeclarant')
            if t: by_type[t] += 1
            
            natures = data.get('natureTravaux', [])
            if isinstance(natures, list):
                for n in natures: by_nature[n] += 1
        
        # Weekly activity (last 7 days)
        weekly = []
        days_map = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"]
        for i in range(6, -1, -1):
            target_date = now - timedelta(days=i)
            day_start = target_date.replace(hour=0, minute=0, second=0, microsecond=0)
            day_end = day_start + timedelta(days=1)
            
            count = Dossier.objects.filter(created_at__gte=day_start, created_at__lt=day_end).count()
            weekly.append({
                "day": days_map[day_start.weekday()],
                "count": count
            })

        # Monthly activity (last 4 months)
        monthly = []
        months_map = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sept", "Oct", "Nov", "Déc"]
        curr_date = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        
        for _ in range(4):
            # Calculate next month for the upper bound
            if curr_date.month == 12:
                next_month = curr_date.replace(year=curr_date.year + 1, month=1)
            else:
                next_month = curr_date.replace(month=curr_date.month + 1)
            
            dossiers = Dossier.objects.filter(created_at__gte=curr_date, created_at__lt=next_month)
            p_count = 0
            pm_count = 0
            for d in dossiers:
                t = (d.data or {}).get('typeDeclarant')
                if t == 'particulier': p_count += 1
                elif t == 'personne_morale': pm_count += 1
            
            monthly.insert(0, {
                "month": months_map[curr_date.month-1],
                "particulier": p_count,
                "personne_morale": pm_count
            })
            
            # Move to previous month
            if curr_date.month == 1:
                curr_date = curr_date.replace(year=curr_date.year - 1, month=12)
            else:
                curr_date = curr_date.replace(month=curr_date.month - 1)
        
        return Response({
            "total": total_dossiers + in_progress,
            "completed": completed,
            "inProgress": in_progress,
            "abandoned": abandoned,
            "todayNew": today_new,
            "weeklyGrowth": weekly_growth,
            "byType": dict(by_type),
            "byNature": dict(by_nature),
            "weekly": weekly,
            "monthly": monthly
        })

class ActivityLogView(generics.ListAPIView):
    serializer_class = ActivityLogSerializer
    permission_classes = [IsAdminRole]

    def get_queryset(self):
        return ActivityLog.objects.all()[:50]


# ============================================
# CADASTRE API VIEWS - API officielle .gouv.fr
# ============================================

from .services.cadastre_service import cadastre_service
import logging

logger = logging.getLogger(__name__)


class CadastreParcellesView(APIView):
    """
    Récupère les parcelles cadastrales d'une commune.
    GET /api/cadastre/parcelles/{code_insee}/
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request, code_insee):
        try:
            data = cadastre_service.get_parcelles_commune(code_insee)
            return Response(data)
        except Exception as e:
            logger.error(f"Error fetching parcelles: {e}")
            return Response(
                {"error": "Impossible de récupérer les parcelles cadastrales"},
                status=status.HTTP_502_BAD_GATEWAY
            )


class CadastreBatimentsView(APIView):
    """
    Récupère les bâtiments cadastraux d'une commune.
    GET /api/cadastre/batiments/{code_insee}/
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request, code_insee):
        try:
            data = cadastre_service.get_batiments_commune(code_insee)
            return Response(data)
        except Exception as e:
            logger.error(f"Error fetching batiments: {e}")
            return Response(
                {"error": "Impossible de récupérer les bâtiments"},
                status=status.HTTP_502_BAD_GATEWAY
            )


class CadastreParcelleDetailView(APIView):
    """
    Récupère une parcelle spécifique.
    GET /api/cadastre/parcelle/{code_insee}/{section}/{numero}/
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request, code_insee, section, numero):
        try:
            parcelle = cadastre_service.get_parcelle_by_id(code_insee, section, numero)
            if parcelle:
                return Response(parcelle)
            return Response(
                {"error": "Parcelle non trouvée"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error fetching parcelle: {e}")
            return Response(
                {"error": "Erreur lors de la recherche de parcelle"},
                status=status.HTTP_502_BAD_GATEWAY
            )


class CadastreGeocodeView(APIView):
    """
    Géocode une adresse pour obtenir les coordonnées et le code INSEE.
    GET /api/cadastre/geocode/?q={address}
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        address = request.query_params.get('q', '')
        if not address:
            return Response(
                {"error": "Paramètre 'q' requis"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            results = cadastre_service.geocode_address(address)
            return Response({"results": results})
        except Exception as e:
            logger.error(f"Error geocoding: {e}")
            return Response(
                {"error": "Erreur lors du géocodage"},
                status=status.HTTP_502_BAD_GATEWAY
            )


class CadastreSectionsView(APIView):
    """
    Récupère les sections cadastrales d'une commune.
    GET /api/cadastre/sections/{code_insee}/
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request, code_insee):
        try:
            sections = cadastre_service.get_sections_commune(code_insee)
            return Response({"sections": sections})
        except Exception as e:
            logger.error(f"Error fetching sections: {e}")
            return Response(
                {"error": "Impossible de récupérer les sections"},
                status=status.HTTP_502_BAD_GATEWAY
            )


class CadastreSearchView(APIView):
    """
    Recherche des parcelles par commune et section optionnelle.
    GET /api/cadastre/search/?code_insee={code}&section={section}
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        code_insee = request.query_params.get('code_insee', '')
        section = request.query_params.get('section', None)
        
        if not code_insee:
            return Response(
                {"error": "Paramètre 'code_insee' requis"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            data = cadastre_service.search_parcelles(code_insee, section)
            return Response(data)
        except Exception as e:
            logger.error(f"Error searching parcelles: {e}")
            return Response(
                {"error": "Erreur lors de la recherche"},
                status=status.HTTP_502_BAD_GATEWAY
            )

class CadastreParcelleByCoordinatesView(APIView):
    """
    Trouve une parcelle spécifique par coordonnées GPS.
    GET /api/cadastre/parcelle/coords/?lat={lat}&lon={lon}
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        lat = request.query_params.get('lat')
        lon = request.query_params.get('lon')
        
        if not lat or not lon:
            return Response(
                {"error": "Paramètres 'lat' et 'lon' requis"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            parcelle = cadastre_service.get_parcelle_by_coordinates(float(lat), float(lon))
            if parcelle:
                return Response(parcelle)
            return Response(
                {"error": "Aucune parcelle trouvée à ces coordonnées"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error fetching parcelle by coordinates: {e}")
            return Response(
                {"error": "Erreur lors de la recherche de parcelle"},
                status=status.HTTP_502_BAD_GATEWAY
            )

class AdminNotificationListView(generics.ListAPIView):
    queryset = AdminNotification.objects.all()
    serializer_class = AdminNotificationSerializer
    permission_classes = [IsAdminRole]

    def get_queryset(self):
        return AdminNotification.objects.all()[:50]

class AdminNotificationMarkReadView(APIView):
    permission_classes = [IsAdminRole]

    def post(self, request):
        AdminNotification.objects.filter(is_read=False).update(is_read=True)
        return Response({"message": "Toutes les notifications ont été marquées comme lues."})

class AdminUserListView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAdminRole]

    def get_queryset(self):
        role = self.request.query_params.get('role', None)
        if role:
            # Safer way for Djongo: filter profiles first
            profile_user_ids = Profile.objects.filter(role=role).values_list('user_id', flat=True)
            return User.objects.filter(id__in=list(profile_user_ids)).order_by('-date_joined')
        return User.objects.all().order_by('-date_joined')

# ============================================
# AI API VIEWS - Assistance intelligente
# ============================================

class AIAnalyzeProjectView(APIView):
    """
    Analyse la description du projet pour suggérer des champs.
    POST /api/ai/analyze-project/
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        description = request.data.get('description', '')
        if not description:
            return Response({"error": "Description requise"}, status=status.HTTP_400_BAD_REQUEST)
        
        suggestions = AIService.analyze_project(description)
        if suggestions:
            return Response(suggestions)
        return Response({"error": "L'IA n'a pas pu analyser le projet"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class AISuggestDocumentsView(APIView):
    """
    Suggère les documents DP requis selon le projet.
    POST /api/ai/suggest-documents/
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        description = request.data.get('description', '')
        if not description:
            return Response({"error": "Description requise"}, status=status.HTTP_400_BAD_REQUEST)
        
        suggestions = AIService.suggest_documents(description)
        if suggestions:
            return Response(suggestions)
        return Response({"error": "L'IA n'a pas pu suggérer de documents"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AIConfigureProjectView(APIView):
    """
    Configure dynamiquement un projet de type 'Autre'.
    POST /api/ai/configure-project/
    
    Retourne les champs requis, documents obligatoires et questions spécifiques.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        description = request.data.get('description', '')
        if not description:
            return Response({"error": "Description requise"}, status=status.HTTP_400_BAD_REQUEST)
        
        config = AIService.configure_custom_project(description)
        return Response(config)
