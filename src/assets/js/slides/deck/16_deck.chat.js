/*!
Deck JS - deck.chat
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
    $('<div/>').addClass('chat-wrapper').attr('id', 'chat-wrapper')
    .css('position', 'relative')
    .css('float', 'right')
    .css('height', '100%')
    .css('width', '100%')
    .css('font-family', 'Palatino')
    .css('font-size', '9')
    .appendTo($('#deck-header'));

    $('<div/>').addClass('chat-messages-div').attr('id', 'chat-messages-div')
    .appendTo($('#chat-wrapper'));

    $('<ul>').addClass('chat-messages').attr('id', 'chat-messages')
    .css('height', '100%')
    .css('width', '100%')
    .css('overflow-y', 'auto')
    .attr('aria-role', 'chat')
    .appendTo($('#chat-messages-div'));

    $('<input/>').addClass('chat-type-box').attr('id', 'chat-type-box')
    .css('margin', 'inherit inherit inherit inherit')
    .css('width', '100%')
    .css('position', 'absolute')
    .css('bottom', '10px')
    .css('font-family', 'inherit')
    .css('font-size', 'inherit')
    .appendTo($('#chat-wrapper'));
  };


  /* Rip-off from deck.goto */
  var bindKeyEvents = function() {
  };

  var populateDatalist = function() {
  };

  var markRootSlides = function() {
  };

  var handleFormSubmit = function() {
  };

  $.extend(true, $.deck.defaults, {
    classes: {
      deckChat: 'deck-chat'
    },

    selectors: {
      chatDiv: '#chat-div',
    },

    snippets: {
    },

    alert: {
    },

    keys: {
    },

    countNested: true
  });

  $document.bind('deck.init', function() {
    maybeAddSnippet();
  });
})(jQuery);

