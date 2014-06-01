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

      @socket.emit "message", envelope, =>
        @parse(data)

    parse: (message) ->
      # Incase anyone was wondering what a returned JSON response looks
      example_message =
        devices:"4bb4a961-e8e6-11e3-93f8-f3e7e8d1cce9"
        payload: {"hello":"world"}
        fromUuid: "4bb4a961-e8e6-11e3-93f8-f3e7e8d1cce9"
      console.log 'The app just hit skynet.parse, but its not implemented :('

angular.module('FarmBot').service 'Skynet',[
  Skynet
]
