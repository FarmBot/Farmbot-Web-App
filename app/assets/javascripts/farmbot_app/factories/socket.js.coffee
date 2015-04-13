angular.module("FarmBot").factory 'socket', ($rootScope) ->
  socket = io.connect 'wss://meshblu.octoblu.com', port: 443
  {
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
  }
