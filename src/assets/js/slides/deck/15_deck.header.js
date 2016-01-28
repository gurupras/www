/*!
Deck JS - deck.header
Copyright (c) 2011-2014 Caleb Troughton
Dual licensed under the MIT license.
https://github.com/imakewebthings/deck.js/blob/master/MIT-license.txt
*/

/*
This module adds the necessary methods and key bindings to show and hide a form
for jumping to any slide number/id in the deck (and processes that form
accordingly). The form-showing state is indicated by the presence of a class on
the deck container.
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


  var bindKeyEvents = function() {
    $document.unbind('keydown.decklogin');
    $document.bind('keydown.decklogin', function(event) {
      var key = $.deck('getOptions').keys.login;
      if ((event.which === key || $.inArray(event.which, key) > -1) && event.shiftKey) {
        event.preventDefault();
          if(localStorage.getItem('userToken') === null) {
            // No tokens..probably not signed in
            signin();
        } else {
          // XXX: People could mess with this by modifying JS.
          // Nothing serious would go wrong though!
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
      login: 76 // L (checks shift key)
    },

    countNested: true
  });

  $document.bind('deck.init', function() {
    bindKeyEvents();
    maybeAddSnippet();
  });
})(jQuery);

