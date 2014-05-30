#Example:
# cnxn = new Skynet(device.uuid, device.token, device.message)
Skynet = () ->
  class Skynet
    constructor: (uuid, token) ->
      config =
        uuid:  uuid
        token: token
        type:  "farmbot"
        protocol: "websocket"
    send: (message) ->

angular.module('FarmBot').service 'Skynet',[
  Skynet
]

