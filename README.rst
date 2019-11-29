
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


Basic Usage
-----------

Sample usage in a template:

.. code:: html

    <script language="javascript">

        $(document).ready(function() {

            // Only for demonstration purposes, register to receive "created.dialog" notification;
            // this is fully optional
            $('#dialog_generic').on('created.dialog', function(event, arg1, arg2) {
                var target = $(event.target);
                console.log('Dialog created: target=%o, arg1=%o, arg2=%o', target, arg1, arg2);
            });

            // Build a Dialog object supplying custom parameters as needed
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


Open the Dialog with a custom "After load" callback
---------------------------------------------------

In the following example:

- we call open() with show=false, so the Dialog will remain hidden during loading
- after loading is completed, our callback onPopupLoaded is called
- in onPopupLoaded(dialog, event), we show the dialog, and hide it after a 2 seconds timeout

Sample usage in a template:

.. code:: html

    <script language="javascript">
        $(document).ready(function() {
            dialog1 = new Dialog('#dialog_generic', {
                url: "{% url 'frontend:j_object' %}"
            });
        });

        function onPopupLoaded(dialog, event) {
            console.log('onPopupLoaded(dialog: %o, event: %o;', dialog, event);
            dialog.show();
            setTimeout(function() {
                dialog.close();
            }, 3000);
        }
    </script>


    <a href="#" onclick="dialog1.open(cbAfterLoad=onPopupLoaded, user_data=event, show=false); return false;">
        <i class="fa fa-plus-circle"></i>
        Test Popup (2)
    </a> /


Dialog class public methods
---------------------------

    /**
     * Constructor
     *
     * @param {HTMLElement} element - the dialog box (defaults to "#dialog_generic")
     * @param {object} options - check "this._options" defaults for a full list of available options
     */

    constructor(element=null, options={})


    /**
     * Close (hide) the dialog
     */

    close()


    /**
     * Show the dialog
     */

    show()


    /**
     * Open the dialog
     *
     * 1. dialog body will be immediately loaded with static content "options.html"
     * 2. then the dialog is shown (unless the "show" parameter is false)
     * 3. finally, dynamic content will be loaded from remote address "options.url" (if supplied)
     *
     * @param {callback} cbAfterLoad - (optional) called after dynamic content has been loaded as follows: cbAfterLoad(dialog, user_data)
     * @param {object} user_data - (optional) blindly passed to cbAfterLoad() callback for whatever caller's need
     * @param {boolean} show - if false, the dialog will be loaded but not shown
     */

    open(cbAfterLoad=null, user_data=null, show=true)


Notifications
-------------

Sample usage client-side:

.. code:: javascript

    $('#dialog_generic').on('created.dialog', function(event, arg1, arg2) {
        var target = $(event.target);
        console.log('Dialog created: target=%o, arg1=%o, arg2=%o', target, arg1, arg2);
    });
