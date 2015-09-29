//= require lodash
//= require jquery
//= require react
//= require react_ujs
$(function(){
  // Append Rails CSRF token to requests.
  var token = $( 'meta[name="csrf-token"]' ).attr( 'content' );

  $.ajaxSetup( {
    beforeSend: function ( xhr ) {
      xhr.setRequestHeader( 'X-CSRF-Token', token );
    }
  });
});
