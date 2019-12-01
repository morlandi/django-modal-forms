
////////////////////////////////////////////////////////////////////////////////
// base Dialog

class Dialog {

    /**
     * Constructor
     *
     * @param {HTMLElement} element - the dialog box (if null, "#dialog_generic" is used as default)
     * @param {object} options - check "this.options" defaults for a full list of available options
     */

    constructor(options={}) {

        self = this;

        // Default options
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

        // Override with user-supplied custom options
        if (options) {
            Object.assign(self.options, options);
        }

        self.element = $(self.options.dialog_selector);
        if (self.element.length <= 0) {
            var message = 'ERROR: dialog "' + self.options.dialog_selector + '" not found';
            console.log(message);
            ModalForms.display_server_error(message);
        }

        self._notify("created", {options: self.options});
    }

    /**
     * Fire a custom "Dialog" event.
     *
     * Sample usage in this class:
     *    this._notify("created", ['foo', 'bar']);
     *
     * Sample usage client-side:
     *
     *  $('#dialog_generic').on('created.dialog', function(event, arg1, arg2) {
     *      var target = $(event.target);
     *      console.log('Dialog created: target=%o, arg1=%o, arg2=%o', target, arg1, arg2);
     *  });
     */

    // _notify(event_name, event_info=[]) {
    //     var self = this;
    //     if (self.options.enable_trace) {
    //         console.log('[Dialog] ' + event_name + ' %o', event_info);
    //     }
    //     self.element.trigger(event_name + ".dialog", [self].concat(event_info));
    // }

    _notify(event_name, params={}) {
        var self = this;
        if (self.options.enable_trace) {
            console.log('[Dialog ' + event_name + '] dialog: %o; params:%o', self, params);
        }
        if (self.options.callback) {
            self.options.callback(event_name, self, params);
        }
    }

    /**
     * Getters and setters
     */

    //get element() { return this._element; }
    //get options() { return this._options; }

    /**
     * Close (hide) the dialog
     */

    close() {
        var self = this;

        self.element.find('.close').off();
        //$(window).off();
        self.element.hide();

        // Restore normal page scrolling in case the recently opened modal
        // had disable it to scroll it's own contents instead
        $('body').css('overflow', 'auto');

        self._notify('closed');
    }

    _initialize() {
        var self = this;

        var content = self.element.find('.dialog-content');
        var header = content.find('.dialog-header');
        var body = content.find('.dialog-body');
        var footer = content.find('.dialog-footer');

        if (self.options.width) { content.css('width', self.options.width); }
        if (self.options.min_width) { content.css('min-width', self.options.min_width); }
        if (self.options.max_width) { content.css('max-width', self.options.max_width); }
        if (self.options.height) { body.css('height', self.options.height); }
        if (self.options.min_height) { body.css('min-height', self.options.min_height); }
        if (self.options.max_height) { body.css('max-height', self.options.max_height); }

        header.find('.title').html('&nbsp;' + self.options.title);
        footer.find('.btn-save').val(self.options.button_save_label);
        footer.find('.btn-close').val(self.options.button_close_label);
        footer.find('.text').html('&nbsp;' + self.options.footer_text);

        self._notify('initialized');
    }

    /**
     * Show the dialog
     */

    show() {
        var self = this;
        self.element.show();
        self._notify('shown');
    }

    _load() {

        var self = this;
        var header = self.element.find('.dialog-header');

        self._notify('loading', {url: self.options.url});
        header.addClass('loading');
        var promise = $.ajax({
            type: 'GET',
            url: self.options.url,
            cache: false,
            crossDomain: true,
            headers: {
                // make sure request.is_ajax() return True on the server
                'X-Requested-With': 'XMLHttpRequest'
            }
        }).done(function(data, textStatus, jqXHR) {
            self.element.find('.dialog-body').html(data);
            self._notify('loaded', {url: self.options.url});
        }).fail(function(jqXHR, textStatus, errorThrown) {
            console.log('ERROR: errorThrown=%o, textStatus=%o, jqXHR=%o', errorThrown, textStatus, jqXHR);
            ModalForms.display_server_error(errorThrown);
        }).always(function() {
            header.removeClass('loading');
        });

        return promise;
    }

    /**
     * Open the dialog
     *
     * 1. dialog body will be immediately loaded with static content "options.html"
     * 2. then the dialog is shown (unless the "show" parameter is false)
     * 3. finally, dynamic content will be loaded from remote address "options.url" (if supplied)
     * 4. if successfull, a 'loaded.dialog' event is fired; you can use it to perform any action required after loading
     */

    open(show=true) {

        var self = this;
        self._initialize();

        // When the user clicks on any '.btn-close' element, close the modal
        self.element.find('.dialog-header .close').off().on('click', function() {
            self.close();
        });

        // Close botton in the footer, if any
        var btn_close = self.element.find('.dialog-footer .btn-close');
        if (btn_close.length) {
            btn_close.off().on('click', function(event) {
                self.close();
            });
        }

        /*
        // When the user clicks anywhere outside of the modal, close it
        $(window).off().on('click', function(event) {
            //if (event.target.id == modal.attr('id')) {
            if (event.target == self.element.get(0)) {
                self.close();
            }
        });
        */

        if (self.element.hasClass('draggable')) {
            self.element.find('.dialog-content').draggable({
                handle: '.dialog-header'
            });
        }

        // Load static content
        self.element.find('.dialog-body').html(self.options.html);
        self._notify('open');

        // Show the dialog
        if (show) {
            self.show();
        }

        // Load remote content
        if (self.options.url) {
            self._load().done(function(data, textStatus, jqXHR) {
                var form = self.element.find('.dialog-content .dialog-body form');
                if (form.length == 1) {
                    // Manage form
                    self._form_ajax_submit();
                }
            });
        }
    }

    _form_ajax_submit() {
        var self = this;

        var content = self.element.find('.dialog-content');
        var header = content.find('.dialog-header');
        var body = content.find('.dialog-body');
        var footer = content.find('.dialog-footer');
        var form = content.find('.dialog-body form');

        // use footer save button, if available
        var btn_save = footer.find('.btn-save');
        if (btn_save) {
            form.find('.form-submit-row').hide();
            btn_save.off().on('click', function(event) {
                form.submit();
            });
        }

        // Give focus to first visible form field
        form.find('input:visible').first().focus().select();

        // bind to the form’s submit event
        form.on('submit', function(event) {

            // prevent the form from performing its default submit action
            event.preventDefault();
            header.addClass('loading');

            // serialize the form’s content and send via an AJAX call
            // using the form’s defined method and action
            var url = form.attr('action') || self.options.url;
            var method = form.attr('method') || 'post';
            var data = form.serialize();

            self._notify('submitting', {method: method, url: url, data:data});
            $.ajax({
                type: method,
                url: url,
                data: data,
                cache: false,
                crossDomain: true,
                headers: {
                    // make sure request.is_ajax() return True on the server
                    'X-Requested-With': 'XMLHttpRequest'
                }
            }).done(function(xhr, textStatus, jqXHR) {

                // update the modal body with the new form
                body.html(xhr);

                // If the server sends back a successful response,
                // we need to further check the HTML received

                // If xhr contains any field errors,
                // the form did not validate successfully,
                // so we keep it open for further editing
                //if ($(xhr).find('.has-error').length > 0) {
                if ($(xhr).find('.has-error').length > 0 || $(xhr).find('.errorlist').length > 0) {
                    self._form_ajax_submit();
                } else {
                    // otherwise, we've done and can close the modal
                    self._notify('submitted', {method: method, url: url, data: data});
                    self.close();
                }

            }).fail(function(jqXHR, textStatus, errorThrown) {
                console.log('ERROR: errorThrown=%o, textStatus=%o, jqXHR=%o', errorThrown, textStatus, jqXHR);
                ModalForms.display_server_error(errorThrown);
            }).always(function() {
                header.removeClass('loading');
            });
        });
    }

}

////////////////////////////////////////////////////////////////////////////////
// Helpers

window.ModalForms = (function() {

    function display_server_error(errorDetails) {

        // Try with SweetAlert2
        try {
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
        // failing that, we fallback to a simple alert
        catch (err) {
            alert(errorDetails);
        }
    }

    /*
     * Routing
     */

    function redirect(url, show_layer=false) {
        // see: http://stackoverflow.com/questions/503093/how-can-i-make-a-redirect-page-in-jquery-javascript
        // similar behavior as an HTTP redirect
        console.log('redirect(): ' + url);
        if (show_layer) {
            overlay_show('body');
        }
        window.location.replace(url);
    }

    function gotourl(url, show_layer=false) {
        // see: http://stackoverflow.com/questions/503093/how-can-i-make-a-redirect-page-in-jquery-javascript
        // similar behavior as clicking on a link
        console.log('gotourl(): ' + url);
        if (show_layer) {
            overlay_show('body');
        }
        window.location.href = url;
    }

    function reload_page(show_layer=false) {
        if (show_layer) {
            overlay_show('body');
        }
        window.location.reload(true);
    }


    /*
     *  Overlay
     *
     *  Requires: gasparesganga-jquery-loading-overlay
     */

    function overlay_show(element) {
        $(element).LoadingOverlay(
            'show', {
                //background: 'rgba(0, 167, 140, 0.2)',
                background: 'rgba(0, 0, 0, 0.3)',
                image: '',
                fontawesome: 'fa fa-cog fa-spin'
            }
        );
    }

    function overlay_hide(element) {
        $(element).LoadingOverlay('hide');
    }

    function hide_mouse_cursor() {
        // https://stackoverflow.com/questions/9681080/changing-cursor-to-waiting-in-javascript-jquery#25207986
        //$('body').css('cursor', 'none');
        //$('body').addClass('waiting');
        $("body").css("cursor", "none");
    }

    // Speed up calls to hasOwnProperty
    var hasOwnProperty = Object.prototype.hasOwnProperty;


    // http://stackoverflow.com/questions/4994201/is-object-empty
    function isEmptyObject(obj) {

        // null and undefined are "empty"
        if (obj == null) return true;

        // Assume if it has a length property with a non-zero value
        // that that property is correct.
        if (obj.length > 0)    return false;
        if (obj.length === 0)  return true;

        // If it isn't an object at this point
        // it is empty, but it can't be anything *but* empty
        // Is it empty?  Depends on your application.
        if (typeof obj !== "object") return true;

        // Otherwise, does it have any properties of its own?
        // Note that this doesn't handle
        // toString and valueOf enumeration bugs in IE < 9
        for (var key in obj) {
            if (hasOwnProperty.call(obj, key)) return false;
        }

        return true;
    }


    // Find an Object by attribute in an Array
    // http://stackoverflow.com/questions/5579678/jquery-how-to-find-an-object-by-attribute-in-an-array#19154349
    function lookup(array, prop, value) {
        for (var i = 0, len = array.length; i < len; i++)
            if (array[i] && array[i][prop] === value) return array[i];
        return null;
    }


    // Adapts canvas size to desired size;
    function adjust_canvas_size(id) {
    /*
        Usage:

            <canvas id="{{client.id}}-chart1" style="width: 100%; height:200px;">
            </canvas>

            ...

            <script type="text/javascript">
                adjust_canvas_size("{{client.id}}-chart1");
            < /script>

        Adapted from:
        https://stackoverflow.com/questions/18679414/how-put-percentage-width-into-html-canvas-no-css#18680851
    */

        /// get computed style for canvas
        var canvas = document.getElementById(id);
        var cs = getComputedStyle(canvas);

        /// these will return dimensions in *pixel* regardless of what
        /// you originally specified for image:
        var width = parseInt(cs.getPropertyValue('width'), 10);
        var height = parseInt(cs.getPropertyValue('height'), 10);

        // /// now use this as width and height for your canvas element:
        // var canvas = document.getElementById(id);

        canvas.width = width;
        canvas.height = height;
    }


    function getCookie(name) {
        var value = '; ' + document.cookie,
            parts = value.split('; ' + name + '=');
        if (parts.length == 2) return parts.pop().split(';').shift();
    }


    /**
     * Invoke remote action upon user confirmation.
     *
     * Display a dialog to ask for user confirmation, then invoke remote action;
     * after successfull execution, call supplied callback with server result.
     *
     * @param {string}              url                 Server action to be invoked.
     * @param {object}              options             Display options.
     * @param {afterDoneCallback}   [function]          Callback to be invoked after successfull execution.
     * @param {object}              data (optional)     If supplied, call server action via POST (instead of get) passing by data
     *
     * @return {none}
     *
     *  Requires: sweetalert2
     *
     */

    function confirmRemoteAction(url, options, afterDoneCallback, data=null) {

        var options = {
            confirmButtonClass: 'btn-success',
            cancelButtonClass: 'btn-default',
            buttonsStyling: false,
            reverseButtons: true,
            title: 'Are you sure ?',
            text: '',
            type: 'warning',
            showCancelButton: true,
            cancelButtonText: 'Cancel',
            confirmButtonText: 'Confirm'
        };
        Object.assign(options, options);

        swal.fire({
            confirmButtonClass: 'btn btn-lg ' + options.confirmButtonClass,
            cancelButtonClass: 'btn btn-lg ' + options.cancelButtonClass,
            buttonsStyling: options.buttonsStyling,
            reverseButtons: options.reverseButtons,
            title: options.title,
            text: options.text,
            type: options.type,
            showCancelButton: options.showCancelButton,
            cancelButtonText: options.cancelButtonText,
            confirmButtonText: options.confirmButtonText
        }).then((result) => {
            if (result.value) {
                // User selected "Yes", so proceed with remote call
                var promise = null;
                if (data === null) {
                    promise = $.ajax({
                        type: 'GET',
                        url: url
                    });
                }
                else {
                    promise = $.ajax({
                        type: 'POST',
                        url: url,
                        data: data,
                        cache: false,
                        crossDomain: true,
                        dataType: 'json',
                        headers: {'X-CSRFToken': getCookie('csrftoken')}
                    });
                }
                promise.done(function(data) {
                    if (afterDoneCallback) {
                        afterDoneCallback(data);
                    }
                }).fail(function(jqXHR, textStatus, errorThrown) {
                    console.log('ERROR: ' + jqXHR.responseText);
                    display_server_error(errorThrown);
                });
            } else if (result.dismiss === swal.DismissReason.cancel) {
                // Read more about handling dismissals
            }
        });
    }

    return {
        hide_mouse_cursor: hide_mouse_cursor,
        reload_page: reload_page,
        display_server_error: display_server_error
    };

})();

