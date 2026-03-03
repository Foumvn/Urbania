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
from django.http import HttpResponse
from .services.ai_service import AIService
import firebase_admin
from firebase_admin import auth, credentials
from django.conf import settings
import os
import random
import string


class IsAdminRole(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and 
                    getattr(request.user, 'profile', None) and 
                    request.user.profile.role == 'admin' and 
                    request.user.profile.is_approved)

class IsSuperAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_superuser)

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    authentication_classes = [] # Bypass CSRF for public registration
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
                details={"message": f"Nouvel utilisateur inscrit: {user.email}"},
                ip_address=request.META.get('REMOTE_ADDR')
            )
            
            # Force refresh to get updated profile (role) from DB
            from core.models import Profile
            profile, _ = Profile.objects.get_or_create(user=user)
            role = profile.role
            
            if role == 'admin':
                AdminNotification.objects.create(
                    title="Nouvel Administrateur",
                    message=f"L'administrateur {user.email} a été ajouté au système.",
                    notification_type="new_admin"
                )
            else:
                AdminNotification.objects.create(
                    title="Nouveau Client",
                    message=f"L'utilisateur {user.email} vient de s'inscrire.",
                    notification_type="new_user"
                )
            return Response({
                "user": UserSerializer(user).data,
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class GoogleAuthView(APIView):
    permission_classes = (permissions.AllowAny,)
    authentication_classes = [] # Bypass CSRF for Google authentication

    def post(self, request):
        id_token = request.data.get('id_token')
        mode = request.data.get('mode', 'register')  # default to register

        if not id_token:
            return Response({'error': 'No ID token provided'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Initialize Firebase Admin SDK if not already initialized
            if not firebase_admin._apps:
                cred_path = os.getenv('FIREBASE_CREDENTIALS_PATH')
                if not cred_path:
                     # Fallback to default path if env var not set correctly or accessible
                     cred_path = os.path.join(settings.BASE_DIR, 'firebase-credentials.json')

                if os.path.exists(cred_path):
                    cred = credentials.Certificate(cred_path)
                    firebase_admin.initialize_app(cred)
                else:
                    return Response({'error': 'Firebase credentials configuration missing'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            # Verify the ID token
            decoded_token = auth.verify_id_token(id_token)
            email = decoded_token.get('email')
            name = decoded_token.get('name', '')

            if not email:
                return Response({'error': 'Invalid token: No email found'}, status=status.HTTP_400_BAD_REQUEST)

            # Handle Login vs Register
            try:
                user = User.objects.get(email=email)
                # User exists - simple login flow
            except User.DoesNotExist:
                if mode == 'login':
                    return Response(
                        {'error': 'Compte non existant'}, 
                        status=status.HTTP_404_NOT_FOUND
                    )
                
                # Register mode - Create a new user
                username = email  # Use email as username
                # Generate a random password
                password = ''.join(random.choices(string.ascii_letters + string.digits, k=16))
                
                # Split name into first and last name
                if name:
                    parts = name.split(' ', 1)
                    first_name = parts[0]
                    last_name = parts[1] if len(parts) > 1 else ''
                else:
                    first_name = ''
                    last_name = ''

                user = User.objects.create_user(
                    username=username,
                    email=email,
                    password=password,
                    first_name=first_name,
                    last_name=last_name
                )
                
                # Create Profile
                if not Profile.objects.filter(user=user).exists():
                    Profile.objects.create(user=user, role='client')

                # Log creation
                ActivityLog.objects.create(
                    user=user,
                    activity_type="session_created",
                    details=f"Nouvel utilisateur Google inscrit: {email}",
                    ip_address=request.META.get('REMOTE_ADDR')
                )
                
                # Admin notification
                AdminNotification.objects.create(
                    title="Nouveau Client (Google)",
                    message=f"L'utilisateur {email} s'est inscrit via Google.",
                    notification_type="new_user"
                )

            # Generate tokens
            refresh = RefreshToken.for_user(user)

            # Log login
            ActivityLog.objects.create(
                user=user,
                activity_type="google_login",
                details=f"Connexion Google réussie: {email}",
                ip_address=request.META.get('REMOTE_ADDR')
            )

            return Response({
                "user": UserSerializer(user).data,
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            })

        except Exception as e:
            print(f"Google Auth Error: {str(e)}")
            return Response({'error': 'Invalid token or authentication failed'}, status=status.HTTP_401_UNAUTHORIZED)

class LoginView(APIView):
    permission_classes = (permissions.AllowAny,)
    authentication_classes = [] # Bypass CSRF/SessionAUTH for login

    def post(self, request):
        import sys
        print(f"DEBUG: Login attempt with data: {request.data}", file=sys.stderr)
        username = request.data.get('username') or request.data.get('email')
        password = request.data.get('password')
        
        # Try primary authentication
        user = authenticate(username=username, password=password)
        
        # If it fails, try to find user by email and then authenticate with their username
        if not user and username and '@' in username:
            try:
                user_obj = User.objects.get(email=username)
                user = authenticate(username=user_obj.username, password=password)
            except User.DoesNotExist:
                pass
        
        if user:
            # Safely get or create profile
            profile, _ = Profile.objects.get_or_create(user=user)
            print(f"DEBUG: User {user.email} authenticated. Role: {profile.role}, Approved: {profile.is_approved}, SuperUser: {user.is_superuser}", file=sys.stderr)
            
            # Check if admin is approved (Superusers are always approved)
            if profile.role == 'admin' and not profile.is_approved and not user.is_superuser:
                print(f"DEBUG: Login BLOCKED for {user.email}", file=sys.stderr)
                return Response({
                    "error": "Votre compte administrateur est en attente de validation par un super-administrateur."
                }, status=status.HTTP_403_FORBIDDEN)

            refresh = RefreshToken.for_user(user)
            print(f"DEBUG: Login SUCCESS for {user.email}", file=sys.stderr)
            
            # Log activity
            ActivityLog.objects.create(
                user=user,
                activity_type="admin_login" if profile.role == 'admin' else "user_login",
                details=f"Connexion réussie: {user.username}",
                ip_address=request.META.get('REMOTE_ADDR')
            )

            # --- USER REQUESTED NOTIFICATION UPON LOGIN ---
            # Use the "profile" object directly to avoid cached "user.profile" issues
            notif_type = "new_admin" if profile.role == "admin" else "new_user"
            notif_title = "Connexion Admin" if profile.role == "admin" else "Connexion Client"
            
            AdminNotification.objects.create(
                title=notif_title,
                message=f"{user.email} s'est connecté.",
                notification_type=notif_type
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

class AdminUserActionView(APIView):
    """
    Action pour approuver ou désactiver un utilisateur.
    Réservé au super-administrateur.
    POST /api/admin/users/action/
    """
    permission_classes = [IsSuperAdmin]

    def post(self, request):
        user_id = request.data.get('user_id')
        action = request.data.get('action') # 'approve', 'deactivate'
        
        try:
            user = User.objects.get(id=user_id)
            profile = user.profile
            
            if action == 'approve':
                profile.is_approved = True
                profile.save()
                return Response({"message": f"L'utilisateur {user.email} a été approuvé."})
            elif action == 'deactivate':
                profile.is_approved = False
                profile.save()
                return Response({"message": f"L'accès de l'utilisateur {user.email} a été révoqué."})
            
            return Response({"error": "Action non reconnue."}, status=status.HTTP_400_BAD_REQUEST)
        except User.DoesNotExist:
            return Response({"error": "Utilisateur introuvable."}, status=status.HTTP_404_NOT_FOUND)

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

class AIGenerateDescriptionView(APIView):
    """
    Génère une description automatique du projet.
    POST /api/ai/generate-description/
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        project_type = request.data.get('type_travaux', '')
        nature_travaux = request.data.get('nature_travaux', [])
        other_nature = request.data.get('autre_nature', '')
        
        description = AIService.generate_description(project_type, nature_travaux, other_nature)
        return Response({"description": description})


class AIGenerateNoticeView(APIView):
    """
    Génère la notice descriptive (DP11).
    POST /api/ai/generate-notice/
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        data = request.data.get('data', {})
        notice = AIService.generate_notice_descriptive(data)
        return Response({"notice": notice})


from rest_framework.decorators import api_view
from .services.cadastre_puppeteer_service import CadastrePuppeteerService
import base64
import asyncio

@api_view(['POST'])
def generate_cadastre_headless(request):
    """
    Génère la carte cadastrale en arrière-plan
    avec Puppeteer + votre code existant
    """
    try:
        commune = request.data.get('commune')
        section = request.data.get('section')
        parcelle = request.data.get('parcelle')
        
        if not all([commune, section, parcelle]):
            return Response({'error': 'Champs manquants'}, status=400)
        
        # Générer l'image avec Puppeteer
        try:
            loop = asyncio.get_event_loop()
        except RuntimeError:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            
        image_base64 = loop.run_until_complete(
            CadastrePuppeteerService.generate_cadastre_image(
                commune, section, parcelle
            )
        )
        
        # Retourner l'image
        image_data = base64.b64decode(image_base64)
        
        response = HttpResponse(image_data, content_type='image/png')
        response['Content-Disposition'] = f'inline; filename="cadastre-{commune}-{section}-{parcelle}.png"'
        
        return response
        
    except Exception as e:
        logger.error(f"Erreur génération Puppeteer: {str(e)}")
        return Response({'error': str(e)}, status=500)
