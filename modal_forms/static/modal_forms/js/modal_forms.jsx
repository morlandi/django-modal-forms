
////////////////////////////////////////////////////////////////////////////////
// base Dialog

class Dialog {

    /**
     * Constructor
     *
     * @param {HTMLElement} element - HTMLElement (normally a <div>) to be used as canvas container
     * @param {string[]} labels - the list of labels (X-axis, then all Y-axis)
     * @param {integer} max_points - if > 0, chart keeps only the most recently received data
     * @param {object} extra_options - a dictionary of extra options
     */

    constructor(element, options) {

        self = this;

        // Check and save "element"
        self._element = $(element);
        if (self._element.length <= 0) {
            var message = 'ERROR: dialog "' + element + '" not found';
            console.log(message);
            ModalForms.display_server_error(message);
        }

        // Setup options
        this._options = {
            width: '600px',
            height: '400px',
            max_width: null,
            max_height: null,
            button_save_label: 'Save',
            button_close_label: 'Cancel',
            title: 'Dialog title',
            footer_text: 'Footer',
            enable_trace: false
        };
        if (options) {
            Object.assign(this._options, options);
        }

        this.notify("created");
    }

    /**
     * Debugging
     */

    trace(message) {
        if (this.options.enable_trace) {
            console.log('[Dialog] ' + message);
        }
    }

    /**
     * Getters and setters
     */

    get modal() { return this._element; }
    get options() { return this._options; }

    /**
     * Fire a custom "chart" event.
     *
     * Sample usage in this class:
     *    this.notify("feed-completed", ['foo', 'bar']);
     *
     * Sample usage client-side:
     *
     *  chart.element.on('feed-completed.real-time-chart', onFeedCompleted);
     *
     *  function onFeedCompleted(event, arg1, arg2) {
     *      var target = $(event.target);
     *      console.log('onFeedCompleted(), taget=%o arg1=%o, arg2=%o', target, arg1, arg2);
     *  }
     *
     */

    notify(event_name, event_info=[]) {
        this.modal.trigger(event_name + ".dialog", event_info);
    }

    close() {
        self = this;

        self.modal.find('.close').off();
        //$(window).off();
        self.modal.hide();

        // Restore normal page scrolling in case the recently opened modal
        // had disable it to scroll it's own contents instead
        $('body').css('overflow', 'auto');
    }

    initialize() {
        self = this;

        var content = self.modal.find('.dialog-content');
        var header = content.find('.dialog-header');
        var body = content.find('.dialog-body');
        var footer = content.find('.dialog-footer');

        content.css('width', self.options.width);
        if (self.options.max_width) {
            content.css('max-width', self.options.max_width);
        }
        body.css('height', self.options.height);
        if (self.options.max_height) {
            body.css('max-height', self.options.max_height);
        }

        header.find('.title').html('&nbsp;' + self.options.title);
        footer.find('.btn-save').val(self.options.button_save_label);
        footer.find('.btn-close').val(self.options.button_close_label);
        footer.find('.text').html('&nbsp;' + self.options.footer_text);
    }

    open(event, show=true) {

        self = this;

        // // If "modal" is a selector, initialize a modal object,
        // // otherwise just use it
        // if ($.type(modal) == 'string') {
        //     modal = initModalDialog(event, modal);
        // }

        self.initialize();

        // When the user clicks on <span> (x), close the modal
        this.modal.find('.btn-close').off().on('click', function() {
            self.close();
        });

        /*
        // When the user clicks anywhere outside of the modal, close it
        $(window).off().on('click', function(event) {
            //if (event.target.id == modal.attr('id')) {
            if (event.target == self.modal.get(0)) {
                self.close();
            }
        });
        */

        // Close botton in the footer, if any
        /*
        var btn_close = self.modal.find('.dialog-footer .btn-close');
        if (btn_close.length) {
            btn_close.off().on('click', function(event) {
                self.close();
            });
        }
        */

        if (self.modal.hasClass('draggable')) {
            self.modal.find('.dialog-content').draggable({
                handle: '.dialog-header'
            });
        }

        // Show the modal
        if (show) {
            this._element.show();
        }
    }

}


////////////////////////////////////////////////////////////////////////////////
// Helpers

window.ModalForms = (function() {

    var _options = {};

    function init(options) {
        _options = options;
    }

    function get_option(key) {
        if (_options.hasOwnProperty(key)) {
            return _options[key];
        }
        console.log('ERROR: "' + key + '" not found in ModalForms._options. Did you forget to call ModalForms.init() ???' )
    }

    function initModalDialog(event, modal_element) {
        /*
            You can customize the modal layout specifing optional "data" attributes
            in the element (either <a> or <button>) which triggered the event;
            "modal_element" identifies the modal HTML element.

            Sample call:

            <a href=""
               data-title="Set value"
               data-subtitle="Insert the new value to be assigned to the Register"
               data-dialog-class="modal-lg"
               data-icon="fa-keyboard-o"
               data-button-save-label="Save"
               onclick="openModalDialog(event, '#modal_generic'); return false;">
                <i class="fa fa-keyboard-o"></i> Open generic modal (no contents)
            </a>
        */
        var modal = $(modal_element);
        if (modal.length <= 0) {
            console.log('ERROR: modal "%o" not found', modal_element);
            display_server_error(sprintf('ERROR: modal "%s" not found', modal_element));
        }
        var target = $(event.target);

        var title = target.data('title') || '';
        var subtitle = target.data('subtitle') || '';
        // either "modal-lg" or "modal-sm" or nothing
        var dialog_class = (target.data('dialog-class') || '') + ' modal-dialog';
        var icon_class = (target.data('icon') || 'fa-laptop') + ' fa modal-icon';
        var button_save_label = target.data('button-save-label') || 'Salva';

        modal.find('.modal-dialog').attr('class', dialog_class);
        modal.find('.modal-title').text(title);
        modal.find('.modal-subtitle').text(subtitle);
        modal.find('.modal-header .title-wrapper i').attr('class', icon_class);
        modal.find('.modal-footer .btn-save').text(button_save_label);
        modal.find('.modal-body').html('');

        // Annotate with target (just in case)
        modal.data('target', target);

        if (modal.hasClass('draggable')) {
            modal.find('.xmodal-dialog').draggable({
                handle: '.xmodal-header'
            });
        }

        return modal;
    }

    /*
    function openModalDialog(event, modal) {
        // If "modal" is a selector, initialize a modal object,
        // otherwise just use it
        if ($.type(modal) == 'string') {
            modal = initModalDialog(event, modal);
        }
        modal.modal('show');
    }
    */


    function getCookie(name) {
        var value = '; ' + document.cookie,
            parts = value.split('; ' + name + '=');
        if (parts.length == 2) return parts.pop().split(';').shift();
    }


    function formAjaxSubmit(caller_event, modal, action, cbAfterLoad, cbAfterSuccess) {
        var form = modal.find('.modal-body form');
        var header = $(modal).find('.modal-header');

        // use footer save button, if available
        var btn_save = modal.find('.modal-footer .btn-save');
        if (btn_save) {
            modal.find('.modal-body form .form-submit-row').hide();
            btn_save.off().on('click', function(event) {
                modal.find('.modal-body form').submit();
            });
        }
        if (cbAfterLoad) { cbAfterLoad(caller_event, modal); }

        // Give focus to first visible form field
        modal.find('form input:visible').first().focus().select();

        // bind to the form’s submit event
        $(form).on('submit', function(event) {

            // prevent the form from performing its default submit action
            event.preventDefault();
            header.addClass('loading');

            var url = $(this).attr('action') || action;

            // serialize the form’s content and send via an AJAX call
            // using the form’s defined action and method
            $.ajax({
                type: $(this).attr('method'),
                url: url,
                data: $(this).serialize(),
                success: function(xhr, ajaxOptions, thrownError) {

                    // update the modal body with the new form
                    $(modal).find('.modal-body').html(xhr);

                    // If the server sends back a successful response,
                    // we need to further check the HTML received

                    // If xhr contains any field errors,
                    // the form did not validate successfully,
                    // so we keep it open for further editing
                    //if ($(xhr).find('.has-error').length > 0) {
                    if ($(xhr).find('.has-error').length > 0 || $(xhr).find('.errorlist').length > 0) {
                        formAjaxSubmit(caller_event, modal, url, cbAfterLoad, cbAfterSuccess);
                    } else {
                        // otherwise, we've done and can close the modal
                        $(modal).modal('hide');
                        if (cbAfterSuccess) { cbAfterSuccess(caller_event, modal); }
                    }
                },
                error: function(xhr, ajaxOptions, thrownError) {
                    console.log('SERVER ERROR: ' + thrownError);
                },
                complete: function() {
                    header.removeClass('loading');
                }
            });
        });
    }


    function openModalDialogWithForm(event, modal, cbAfterLoad, cbAfterSuccess) {
        /*
            Example:

            <div class="tools">
                {% ifhasperm model 'change' %}

                    <a href=""
                       class="pull-right btn btn-xs btn-primary"
                       data-action="{{object|change_object_url}}"
                       data-title="{% trans 'Change' %} {{ model|model_verbose_name }}"
                       data-subtitle=""
                       data-dialog-class="modal-lg"
                       data-icon="fa-edit"
                       onclick="openModalDialogWithForm(event, '#modal_generic', null, function() {
                          redraw_table(event.target);
                       }); return false;"
                    >
                        <i class="fa fa-edit" style="pointer-events: none;"></i>
                        {% trans 'Change' %}
                    </a>

                {% endifhasperm %}
                ...

        */

        // If "modal" is a selector, initialize a modal object,
        // otherwise just use it
        if ($.type(modal) == 'string') {
            modal = initModalDialog(event, modal);
        }

        //var url = $(event.target).data('action');
        var url = $(event.target).data('action') || $(event.target).attr('href');
        if (!url) {
            console.log('ERROR: openModalDialogWithForm() could not retrieve action from event');
            return;
        }

        $.ajax({
            type: 'GET',
            url: url
        }).done(function(data, textStatus, jqXHR) {
            modal.find('.modal-body').html(data);
            modal.modal('show');
            formAjaxSubmit(event, modal, url, cbAfterLoad, cbAfterSuccess);
        }).fail(function(jqXHR, textStatus, errorThrown) {
            console.log('jqXHR: %o', jqXHR);
            console.log('textStatus: %o', textStatus);
            console.log('errorThrown: %o', errorThrown);
            //alert('SERVER ERROR: ' + errorThrown);
            display_server_error(errorThrown);
        });
    }

    /*
     * UI helpers
     */

    function display_server_error(errorDetails) {

        if (get_option('use_sweetalert2')) {
            swal.fire({
                confirmButtonClass: 'btn btn-lg btn-primary',
                cancelButtonClass: 'btn btn-lg btn-default',
                buttonsStyling: false,
                reverseButtons: true,
                title: 'ERRORE',
                text: errorDetails,
                type: 'error',
                confirmButtonClass: 'btn btn-lg btn-danger',
                confirmButtonText: 'Chiudi'
            });
        }
        else {
            alert(errorDetails);
        }
    }

    return {
        init: init,
        //openModalDialog: openModalDialog,
        openModalDialogWithForm: openModalDialogWithForm,
        display_server_error: display_server_error
    };

})();

