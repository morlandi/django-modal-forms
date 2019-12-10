
django-modal-forms
==================

A Django helper app to add editing capabilities to the frontend using modal forms.

Bases on my previous research as documented here: `Editing Django models in the front end <https://editing-django-models-in-the-frontend.readthedocs.io/en/latest/>`_

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

Also, setup handling of ".jsx" files; for example using Babel::

    COMPRESS_PRECOMPILERS = (
        ...
        ('text/jsx', 'cat {infile} | ./node_modules/babel-cli/bin/babel.js --presets babel-preset-es2015 > {outfile}'),
    )

and for local debugging::

    # Remove js tranpiling for easier debugging
    COMPRESS_PRECOMPILERS = (
        ...
        # !!! ('text/jsx', 'cat {infile} | ./node_modules/babel-cli/bin/babel.js --presets babel-preset-es2015 > {outfile}'),
        ('text/jsx', 'cat {infile} | ./node_modules/babel-cli/bin/babel.js > {outfile}'),
    )

then:

.. code:: bash

    npm install babel-cli
    npm install babel-preset-es2015
    npm install babel-preset-stage-2


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


Default dialog layout
---------------------

When contructing a Dialog, you can use the `dialog_selector` option to select which
HTML fragment of the page will be treated as the dialog to work with.

It is advisable to use an HTML structure similar to the default layout:

.. code:: html

    <div id="dialog_generic" class="dialog draggable">
        <div class="dialog-dialog">
            <div class="dialog-content">
                <div class="dialog-header">
                    <span class="spinner">
                        <i class="fa fa-spinner fa-spin"></i>
                    </span>
                    <span class="close">&times;</span>
                    <div class="title">Title</div>
                </div>
                <div class="dialog-body ui-front">

                </div>
                <div class="dialog-footer">
                    <input type="submit" value="Close" class="btn btn-close" />
                    <input type="submit" value="Save" class="btn btn-save" />
                    <div class="text">footer</div>
                </div>
            </div>
        </div>
    </div>

Notes:

- ".draggable" make the Dialog draggable
- adding ".ui-front" to the ".dialog-box" element helps improving the behaviour of the dialog on a mobile client


Notifications
-------------

During it's lifetime, the Dialog will notify all interesting events to the caller,
provided he supplies a suitable callback in the contructor:

    self.options.callback(event_name, dialog, params)

Example:

.. code:: javascript

    dialog1 = new Dialog({
        ...
        callback: function(event_name, dialog, params) {
            console.log('event_name: %o, dialog: %o, params: %o', event_name, dialog, params);
        }
    });

Result::

    event_name: "created", dialog: Dialog {options: {…}, element: …}, params: {options: {…}}
    event_name: "initialized", dialog: Dialog {options: {…}, element: …}, params: {}
    event_name: "open", dialog: Dialog {options: {…}, element: …}, params: {}
    event_name: "shown", dialog: Dialog {options: {…}, element: …}, params: {}
    event_name: "loading", dialog: Dialog {options: {…}, element: …}, params: {url: "/admin_ex/popup/"}
    event_name: "loaded", dialog: Dialog {options: {…}, element: …}, params: {url: "/admin_ex/popup/"}
    event_name: "submitting", dialog: Dialog {options: {…}, element: …}, params: {method: "post", url: "/admin_ex/popup/", data: "text=&number=aaa"}
    event_name: "submitted", dialog: Dialog {options: {…}, element: …}, params: {method: "post", url: "/admin_ex/popup/", data: "text=111&number=111"}
    event_name: "closed", dialog: Dialog {options: {…}, element: …}, params: {}

You can also trace all events in the console setting the boolean flag `enable_trace`.


Event list:

============================  ================================
event_name                    params
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
- querystring_parse(qs, sep, eq, options)

Form rendering helpers
----------------------

`generic_form_inner.html`:

.. code:: html

    {% load i18n modal_forms_tags %}

    <style>
    .modal .grp-module {
        border: none;
        background-color: transparent;
    }
    </style>

    <div class="row">
        <div class="col-sm-12">
            <form action="{{ action }}" method="post" class="form" autocomplete="off">
                {% csrf_token %}
                {% render_form form %}
                <input type="hidden" name="object_id" value="{{ object.id|default:'' }}">
                <div class="form-submit-row">
                    <input type="submit" value="Save" />
                </div>
            </form>
        </div>
    </div>

As a convenience when editing a Django Model, we've added an hidden field "object_id";
in other occasions, this is useless (but also armless, as long as the form doesn't
contain a field called "object").

Template tags:

**render_form_field(field)** renders:

.. code:: html

    <div class="form-row {% if field.errors %}errors{% endif %} {{ field.html_name }}">
        <div>
            <div>
                <label {% if field.field.required %}class="required"{% endif %} for="{{ field.id_for_label }}">{{ field.label }}:</label>
            </div>
            <div>
                {{ field }}
                {% if field.help_text %}
                <p class="help">{{ field.help_text }}</p>
                {% endif %}
                {% if field.errors %}
                    <ul class="errorlist">
                        {% for error in field.errors %}
                            <li>{{ error }}</li>
                        {% endfor %}
                    </ul>
                {% endif %}
            </div>
        </div>
    </div>

**render_form(form)** renders:

.. code:: html

    {% load modal_forms_tags %}

    {% if form.non_field_errors %}
        <ul class="errorlist">
            {% for error in form.non_field_errors %}
                <li>{{ error }}</li>
            {% endfor %}
        </ul>
    {% endif %}

    {% for hidden_field in form.hidden_fields %}
        {% if hidden_field.errors %}
            <ul class="errorlist">
                {% for error in hidden_field.errors %}
                    <li>(Hidden field {{ hidden_field.name }}) {{ error }}</li>
                {% endfor %}
            </ul>
        {% endif %}
        {{ hidden_field }}
    {% endfor %}

    <fieldset class="module grp-module" style="Xwidth: 100%">
        {% for field in form.visible_fields %}
            {% render_form_field field %}
        {% endfor %}
    </fieldset>
