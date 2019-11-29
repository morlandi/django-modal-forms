
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

    <link rel='stylesheet' href="{% static 'modal_forms/css/modal_forms.css' %}">

    <script src="{% static 'modal_forms/js/modal_forms.jsx' %}" type="text/jsx"></script>

    <script language="javascript">
        {% include 'modal_forms/init.js' %}
    </script>

The last inclusion has the purpose to share some Django settings with Javascript
by calling ModalForms.init() and passing by the list of all `django-modal-forms`
specific settings.

One day I might find a simpler solution for this need, possibly without including
extra dependencies to the app.

Sample usage in a template:

.. code:: html

    <script language="javascript">

        $(document).ready(function() {

            $('#dialog_generic').on('created.dialog', function(event, arg1, arg2) {
                var target = $(event.target);
                console.log('Dialog created: target=%o, arg1=%o, arg2=%o', target, arg1, arg2);
            });

            dialog1 = new Dialog('#dialog_generic', {
                html: '<h1>hello</h1>',
                url: "{% url 'frontend:j_object' %}",
                width: '80%',
                // height: '400px',
                // max_width: null,
                // max_height: null,
                button_save_label: 'Salva',
                button_close_label: 'Annulla',
                title: '<i class="fa fa-calculator"></i> Selezione Oggetto',
                footer_text: '',
                enable_trace: true
            });

        });

    </script>


    <a href="#" class="btn btn-primary pull-right" onclick="dialog1.open(); return false;">
        <i class="fa fa-plus-circle"></i>
        Test Popup
    </a>
