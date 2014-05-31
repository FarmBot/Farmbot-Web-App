#Example:
# cnxn = new Skynet(device.uuid, device.token, device.message)
Skynet = () ->
  class Skynet
    constructor: ({@uuid, @token}) ->
      @config =
        uuid:  @uuid
        token: @token
        type:  "farmbot"
        protocol: "websocket"

      skynet @config, (e, socket) =>
        throw e  if e
        @socket = socket
        socket.on "message", (message) =>
          console.log "message received", message
          @parse(message)

    send: (message, uuid) ->

      envelope =
        devices: uuid
        payload: message

      callback = (data) -> parse(data)

      @socket.emit "message", envelope, callback

    parse: (message) ->
      debugger

angular.module('FarmBot').service 'Skynet',[
  Skynet
]
