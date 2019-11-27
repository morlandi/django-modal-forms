from django.conf import settings
from .app_settings import USE_SWEETALERT2


def modal_forms_settings(request):
    return {
        'USE_SWEETALERT2': USE_SWEETALERT2,
    }
