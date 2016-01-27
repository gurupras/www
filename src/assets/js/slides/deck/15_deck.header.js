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
    $('<input/>').addClass('btn-login').attr('type', 'submit').attr('value', 'Login').css('float', 'right').attr('id', 'btn-login')
    .on('click', function(e) {
      e.preventDefault();
      signin();
    })
    .appendTo($.deck('getContainer'));

    $('<input/>').addClass('btn-login').attr('type', 'submit').attr('value', 'Logout').attr('id', 'btn-logout')
    .css('float', 'right')
    .css('display', 'none')
    .on('click', function(e) {
      e.preventDefault();
      signout();
      $('#btn-logout').hide();
      $('#btn-login').show();
    }).appendTo($.deck('getContainer'));

    $('<button/>').addClass('').attr('id', 'btn-sync').css('float', 'right').html('Sync')
    .on('click', function(e) {
      if($('#btn-sync').html() === 'Sync') {
        shouldSync = true;
        $('#btn-sync').prop('disabled', true);
      } else {
      }
    })
    .appendTo($.deck('getContainer'));
  };


  var bindKeyEvents = function() {
  };

  var populateDatalist = function() {
  };

  var markRootSlides = function() {
  };

  var handleFormSubmit = function() {
  };

  $document.bind('deck.init', function() {
    maybeAddSnippet();
  });
})(jQuery);

