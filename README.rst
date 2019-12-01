
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

    {% include 'modal_forms/dialogs.html' %}

Basic Usage
-----------

In the following example, we build a Dialog() object providing some custom options;
then, we use it to open a modal dialog and load it from the specified url.

For demonstration purposes, we also subscribe the 'created' notification.

.. code:: html

    <script language="javascript">

        $(document).ready(function() {

            dialog1 = new Dialog({
                html: '<h1>Loading ...</h1>',
                url: '{% url 'frontend:j_object' %}',
                width: '400px',
                min_height: '200px',
                title: '<i class="fa fa-calculator"></i> Selezione Oggetto',
                footer_text: 'testing dialog ...',
                enable_trace: true,
                callback: function(event_name, dialog, params) {
                    switch (event_name) {
                        case "created":
                            console.log('Dialog created: dialog=%o, params=%o', dialog, params);
                            break;
                    }
                }
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

- we subscribe the 'loaded' event
- we call open() with show=false, so the Dialog will remain hidden during loading
- after loading is completed, our handle is called
- in this handle, we show the dialog and hide it after a 3 seconds timeout

Sample usage in a template:

.. code:: html

    <script language="javascript">
        $(document).ready(function() {

            dialog2 = new Dialog({
                url: "{% url 'frontend:j_object' %}",
                width: '400px',
                min_height: '200px',
                enable_trace: true,
                callback: dialog2_callback
            });

        });

        function dialog2_callback(event_name, dialog, params) {
            switch (event_name) {
                case "loaded":
                    dialog.show();
                    setTimeout(function() {
                        dialog.close();
                    }, 3000);
                    break;
            }
        }
    </script>


    <a href="#" onclick="dialog2.open(show=false); return false;">
        <i class="fa fa-plus-circle"></i>
        Test Popup (2)
    </a> /


Dialog class public methods
---------------------------

- constructor(options={})
- open(show=true)
- close()
- show()

Options (with default values)::

    self.options = {
        dialog_selector: '#dialog_generic',
        html: '',
        url: '',
        width: null,
        min_width: null,
        max_width: null,
        height: null,
        min_height: null,
        max_height: null,
        button_save_label: 'Save',
        button_close_label: 'Cancel',
        title: '',
        footer_text: '',
        enable_trace: false,
        callback: null
    };



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
event_name                    parameters
============================  ================================
created                       options
closed
initialized
shown
loading                       url
loaded                        url
open
submitting                    method, url, data
submitted                     method, url, data
============================  ================================

Settings
--------

MODAL_FORMS_FORM_LAYOUT_FLAVOR
    Default: "bs4"


Utilities (module ModalForms)
-----------------------------

- display_server_error(errorDetails)
- redirect(url, show_layer=false)
- gotourl(url, show_layer=false)
- reload_page(show_layer=false)
- overlay_show(element)
- overlay_hide(element)
- hide_mouse_cursor()
- isEmptyObject(obj)
- lookup(array, prop, value)
- adjust_canvas_size(id)
- getCookie(name)
- confirmRemoteAction(url, options, afterDoneCallback, data=null)
