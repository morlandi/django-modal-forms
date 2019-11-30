
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


In your base template, add:

.. code:: html

    <link rel='stylesheet' href="{% static 'modal_forms/css/modal_forms.css' %}">

    <script src="{% static 'modal_forms/js/modal_forms.jsx' %}" type="text/jsx"></script>


Basic Usage
-----------

In the following example, we build a Dialog() object providing some custom options;
then, we use it to open a modal dialog and load it from the specified url.

For demonstration purposes, we also subscribe the 'created.dialog' notification.

.. code:: html

    <script language="javascript">

        $(document).ready(function() {

            // Only for demonstration purposes, register to receive "created.dialog" notification;
            // this is fully optional
            $('#dialog_generic').on('created.dialog', function(event, dialog, options) {
                var target = $(event.target);
                console.log('Dialog created: event=%o (with target=%o), dialog=%o, options=%o', event, target, dialog, options);
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


Open the Dialog and perform some actions after content has been loaded
----------------------------------------------------------------------

In the following example:

- we subscribe the 'loaded.dialog' event
- we call open() with show=false, so the Dialog will remain hidden during loading
- after loading is completed, our handle is called
- in this handle, we show the dialog and hide it after a 3 seconds timeout

Sample usage in a template:

.. code:: html

    <script language="javascript">
        $(document).ready(function() {

            dialog1 = new Dialog('#dialog_generic', {
                url: "{% url 'frontend:j_object' %}"
            });

            dialog1.element.on('loaded.dialog', function(event, dialog, url) {
                dialog.show();
                setTimeout(function() {
                    dialog.close();
                }, 3000);
            });
        });

    </script>

    <a href="#" onclick="dialog1.open(show=false); return false;">
        <i class="fa fa-plus-circle"></i>
        Test Popup (2)
    </a> /


Dialog class public methods
---------------------------

TODO: extract doc from js source ...


constructor(element=null, options={})
    ...

close()
    ...

show()
    ...

open(show=true)
    ...


Notifications
-------------

Sample usages client-side:

.. code:: javascript

    $('#dialog_generic').on('created.dialog', function(event, dialog, options) {
        var target = $(event.target);
        console.log('Dialog created: event=%o (with target=%o), dialog=%o, options=%o', event, target, dialog, options);
    });

or

.. code:: javascript


    dialog1.element.on('loaded.dialog', function(event, dialog, url) {
        var target = $(event.target);
        console.log('Dialog loaded: event=%o (with target=%o), dialog=%o, url=%o', event, target, dialog, url);
        dialog.show();
        setTimeout(function() {
            dialog.close();
        }, 3000);
    });

Supplied events:

============================  ================================
events                        parameters
============================  ================================
created.dialog                event, dialog, options
closed.dialog                 event, dialog
initializeds.dialog           event, dialog
shown.dialog                  event, dialog
loading.dialog                event, dialog, url
loaded.dialog                 event, dialog, url
open.dialog                   event, dialog
============================  ================================

Settings
--------

MODAL_FORMS_FORM_LAYOUT_FLAVOR
    Default: "bs4"

