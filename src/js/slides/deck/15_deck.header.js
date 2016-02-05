/*!
Deck JS - deck.header
Guru
*/

/**
 * Follows the same layout as deck.goto.
 * Many unnecessary functions have been cleaned up and left blank.
 * These may be removed.
 *
 * This plugin adds two fields to a new div that has been added to slides.hbt.
 * The parent div is '#deck-header'. The two fields are:
 *   - '#login-info'
 *   - '#btn-sync'
 *
 * #login-info: Provides info on how to login and if the user has already
 * logged in, then it displays the username.
 *
 * #btn-sync: For all guest users, this button allows them to sync their deck
 * to the same positions as the admin.
 */

(function($, undefined) {
  var $document = $(document);
  var rootCounter;

  var maybeAddSnippet = function() {
    $('<div/>').addClass('login-info').attr('id', 'login-info')
    .css('float', 'right')
    .text("Hit 'L' to login")
    .attr('aria-role', 'status')
    .prop('disabled', true)
    .appendTo($('#deck-header'));

    $('<button/>').addClass('').attr('id', 'btn-sync').css('float', 'right').html('Sync')
    .css('display', 'none')
    .on('click', function(e) {
      shouldSync = true;
      // Disable button until user manually navigates
      $('#btn-sync').prop('disabled', true);
    })
    .appendTo($('#deck-header'));
  };


  /* Rip-off from deck.goto */
  var bindKeyEvents = function() {
    $document.unbind('keydown.decklogin');
    $document.bind('keydown.decklogin', function(event) {
      var key = $.deck('getOptions').keys.login;
      // XXX: Because we care about 'L', we also look for shift key.
      // If this is changing at some point in the future, remember to get rid
      // of the shift key requirement!
      if ((event.which === key || $.inArray(event.which, key) > -1) && event.shiftKey) {
        event.preventDefault();
          if(localStorage.getItem('userToken') === null) {
            // XXX: People could mess with this by modifying JS.
            // Nothing serious would go wrong though!
            // No tokens..probably not signed in
            signin();
        } else {
          signout();
        }
      }
    });
  };

  var bindRescale = function() {
    $('#deck-header').on('deck.custom.rescale', scaleDeck);
  };

  var scaleDeck = function() {
      var opts = $.deck('getOptions');
      var addMarginX = opts.headerDesign.fitMarginX * 2;
      var addMarginY = opts.headerDesign.fitMarginY * 2;
      var fitMode = opts.headerDesign.fitMode;
      var sdw = opts.headerDesign.designWidth;
      var sdh = opts.headerDesign.designHeight;
      var $container = $.deck('getContainer');
      var scaleX = $container.innerWidth() / (sdw+addMarginX);
      var scaleY = $container.innerHeight() / (sdh+addMarginY);
      var scale = scaleX < scaleY ? scaleX : scaleY;
      var $header = $('#deck-header');

      /*
      $header.css('width', sdw);
      $header.css('height', sdh);
      $.each('Webkit Moz O ms Khtml'.split(' '), function(i, prefix) {
        if (scale == 1) {
            $container.css(prefix + 'Transform', '');
        } else {
            // ok align right/bottom
            console.log('scale: ' + scale);
            console.log('innerWidth: ' + $container.innerWidth());
            console.log('innerHeight: ' + $container.innerHeight());
            console.log('sdw: ' + sdw);
            console.log('sdh: ' + sdh);
            console.log('addMarginX: ' + addMarginX);
            console.log('addMarginY: ' + addMarginY);
            var translate = ($container.innerWidth()/scale - sdw - addMarginX/2)+'px,'+($container.innerHeight()/scale - sdh - addMarginY/2)+'px)';
            console.log('translate('+translate);
            $header.css(prefix + 'Transform', 'translate(-50%,-50%) scale(' + scale + ' , ' + scale + ') translate(50%, 50%) translate('+translate);
        }
      });
      */

      var slide0 = $.deck('getSlides')[0][0];
      var slideRect = slide0.getBoundingClientRect();
      /**
       * We know the slide is centered. Therefore, there is equal gap on either side.
       * So
       *     container.innerWidth() = slideRect.right + slideRect.x
       * where
       *     slideRect.right = slideRect.x + slideRect.width
       *     => container.innerWidth() = 2*slideRect.x + slideRect.width
       */
      $header.css('position', 'absolute')
      .css('top', '0')
      .css('left', slideRect.right + 'px')
      .css('width', (slideRect.x - 10) + 'px')
      .css('height', (slideRect.height - 50) + 'px');
  };

  var populateDatalist = function() {
  };

  var markRootSlides = function() {
  };

  var handleFormSubmit = function() {
  };

  $.extend(true, $.deck.defaults, {
    classes: {
      header: 'deck-header'
    },

    selectors: {
      headerSync: '#header-sync',
    },

    headerDesign: {
      designWidth: 200,
      designHeight: 580,
      fitMode: "center middle",
      fitMarginX: 0,
      fitMarginY: 0,
      scaleDebounce: 200
    },

    snippets: {
    },

    alert: {
    },

    keys: {
      login: 76 // L (XXX: checks shift key)
    },

    countNested: true
  });

  $document.bind('deck.init', function() {
    bindKeyEvents();
    bindRescale();
    maybeAddSnippet();
  });
})(jQuery);

