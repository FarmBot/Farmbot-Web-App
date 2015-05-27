socket = io.connect 'ws://45.55.200.178'

angular.module("FarmBot").factory 'socket', ($rootScope) ->
  on: (eventName, callback) ->
    socket.on eventName, ->
      args = arguments
      $rootScope.$apply -> callback.apply socket, args
  emit: (eventName, data, callback) ->
    socket.emit eventName, data, ->
      args = arguments
      $rootScope.$apply ->
        callback.apply(socket, args) if callback
  connected: -> socket.connected
