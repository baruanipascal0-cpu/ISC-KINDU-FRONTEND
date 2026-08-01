function wpzf_submit(token) {
    // Check if required inputs are filled
    var allInputsFilled = true;
  
    jQuery('form.wpzoom-forms_form [required]').each(function() {
        var input = jQuery(this);
        if (input.is(':checkbox')) {
            // For checkboxes
            if (!input.is(':checked')) {
                allInputsFilled = false;
                input.focus();
                return false; // exit the loop if any required checkbox is not checked
            }
        } else {
            // For non-checkbox inputs (text, password, etc.)
            if ( ! input.val() ) {
                allInputsFilled = false;
                input.focus();
                return false; // exit the loop if any required input is not filled
            }
        }
    } );
  
    if ( allInputsFilled ) {
        // All required inputs are filled, trigger form submission
        jQuery('form.wpzoom-forms_form').trigger('submit');
    }
}

(function ($) {
    'use strict';

    $('.wp-block-wpzoom-forms-multi-checkbox-field').each(function() {

        var $this = $(this);
        var $checkboxes = $this.find('input[type="checkbox"]:required');
    
        // Check if any checkbox is initially checked
        var anyChecked = false;
        $checkboxes.each(function() {
            if ($(this).prop('checked')) {
                anyChecked = true;
                return false; // Exit the loop early since we found a checked checkbox
            }
        });
    
        // If any checkbox is initially checked, remove the required attribute
        if (anyChecked) {
            $checkboxes.removeAttr('required');
        }
    
        $checkboxes.on('change', function() {
            var atLeastOneChecked = false;
    
            // Check if at least one checkbox is checked
            $checkboxes.each(function() {
                if ($(this).prop('checked')) {
                    atLeastOneChecked = true;
                    return false; // Exit the loop early since we found a checked checkbox
                }
            });
    
            // If at least one checkbox is checked, remove the required attribute
            if (atLeastOneChecked) {
                $checkboxes.removeAttr('required');
            } else {
                // If no checkbox is checked, add the required attribute back
                $checkboxes.attr('required', 'required');
            }
        });
    
    });
    
    

})(jQuery);