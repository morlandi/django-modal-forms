
django-modal-forms
==================

A Django helper app to add editing capabilities to the frontend using modal forms.

.. contents::

.. sectnum::

Installation
------------

Install the package by running:

.. code:: bash

    pip install git+https://github.com/morlandi/django-modal-forms

In your settings, add:

.. code:: python

    INSTALLED_APPS = [
        ...
        'modal_forms',
    ]

    ...

    TEMPLATES = [
        {
            'OPTIONS': {
                'context_processors': [
                    'modal_forms.context_processors.modal_forms_settings',
                ],
            },
        },
    ]


In your base templates, add:

.. code:: html

    <script src="{% static 'modal_forms/js/modals.js' %}"></script>

    <script language="javascript">
        {% include 'modal_forms/init.js' %}
    </script>

The last inclusion has the purpose to share some Django settings with Javascript
by calling ModalForms.init() and passing by the list of all `django-modal-forms`
specific settings.

One day I might find a simpler solution for this need, possibly without including
extra dependencies to the app.
