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
    $('<input/>').addClass('login-info').attr('id', 'login-info')
    .css('float', 'right')
    .attr('type', 'text')
    .attr('value', "Hit 'L' to login")
    .attr('readonly', true)
    .attr('maxlength', '30')
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
    maybeAddSnippet();
  });
})(jQuery);

