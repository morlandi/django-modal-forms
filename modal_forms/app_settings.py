from django.conf import settings

FORM_LAYOUT_FLAVOR = getattr(settings, 'MODAL_FORMS_FORM_LAYOUT_FLAVOR', "generic")
