"""
WSGI config for pelitaProject project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/wsgi/
"""

import os
import sys

sys.path.append('/var/www/html/DevOps')  # Tambahkan root project kamu
sys.path.append('/var/www/html/DevOps/pelitaProject')  # Tambahkan juga folder project Django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pelitaProject.settings')

from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
