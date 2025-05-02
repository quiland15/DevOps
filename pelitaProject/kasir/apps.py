from django.apps import AppConfig


class KasirConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'kasir'

def ready(self):
    import kasir.signals
