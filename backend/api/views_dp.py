from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from .services.dp_generator_service import DPGeneratorService
import logging

logger = logging.getLogger(__name__)

class GeneratePlanView(APIView):
    """
    Endpoint dedicated to generating specific architectural plans (DP1, DP2, DP3, DP4)
    using advanced AI models (Flux).
    """
    permission_classes = [AllowAny] # Or IsAuthenticated depending on requirements

    def post(self, request):
        try:
            # Extract parameters
            plan_type = request.data.get('type') # 'dp1', 'dp2', 'dp3', 'dp4'
            data = request.data.get('data', {}) # Full form data context
            provider = request.data.get('provider', 'HUGGINGFACE') # Default to Flux as it is "excellent"
            
            if not plan_type:
                return Response({"error": "Le type de plan (type) est requis (dp1, dp2, dp3, dp4)."}, status=400)

            # Log the request
            logger.info(f"Generating {plan_type} for user with provider {provider}")

            # Call the service
            result = DPGeneratorService.generate_plan(data, plan_type, provider)
            
            return Response(result)

        except ValueError as ve:
            return Response({"error": str(ve)}, status=400)
        except Exception as e:
            logger.error(f"Error generating plan: {str(e)}")
            return Response({"error": "Erreur interne lors de la génération du plan."}, status=500)
