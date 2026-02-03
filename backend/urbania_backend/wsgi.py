"""
WSGI config for urbania_backend project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/3.2/howto/deployment/wsgi/
"""

import os

from django.core.wsgi import get_wsgi_application
from utils.keep_alive import start_keep_alive

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'urbania_backend.settings')

application = get_wsgi_application()

# Démarrer la boucle de maintien en éveil pour Render
start_keep_alive()
