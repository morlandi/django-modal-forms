from django.conf import settings

FORM_LAYOUT_FLAVOR = getattr(settings, 'MODAL_FORMS_FORM_LAYOUT_FLAVOR', "generic")
MODEL_FORMS_MODULES = getattr(settings, 'MODAL_FORMS_MODEL_FORMS_MODULES', ['frontend.forms', ])
