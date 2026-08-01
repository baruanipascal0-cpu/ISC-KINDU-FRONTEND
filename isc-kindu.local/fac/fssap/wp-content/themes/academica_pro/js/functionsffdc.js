/**
 * Theme functions file
 */

jQuery(function( $ ) {

    var $document = $(document);
    var $window = $(window);


    /**
    * Document ready (jQuery)
    */
    $(function () {

        /**
         * Activate superfish menu.
         */
        $('.sf-menu').superfish({
            'speed': 'fast',
            'delay' : 1000,
            'animation': {
                'height': 'show'
            }
        });

    });

    $('#toggle').click(function() {
        $('#menu-main').slideToggle(400);
        $(this).toggleClass("active");

        return false;

    });

    function mobileadjust() {

        var windowWidth = $(window).width();

        if( typeof window.orientation === 'undefined' ) {
            $('#menu-main').removeAttr('style');
         }

        if( windowWidth < 769 ) {
            $('#menu-main').addClass('mobile-menu');
         }

    }

    mobileadjust();

    $(window).resize(function() {
        mobileadjust();
    });

});