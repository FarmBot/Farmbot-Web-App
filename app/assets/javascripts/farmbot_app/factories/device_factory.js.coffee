angular.module("FarmBot").factory "DeviceFactory",[
  'Restangular'
  (Restangular) ->
    Restangular.extendModel "devices", (obj) ->
      angular.extend obj,
        x: 0
        y: 0
        z: 0
        upx: ->
          @x = @x + 5
        upy: ->
          @y = @y + 5
        upz: ->
          @z = @z + 5
        downx: ->
          @x = @x - 5
        downy: ->
          @y = @y - 5
        downz: ->
          @z = @z - 5
        debug: (message) ->
          @socket.emit "message", JSON.parse(message), (data) ->
            console.log data
        connectToSkyNet: ->
          config =
            type: "farmbotdss"
            uuid: "901ba251-ed7a-11e3-995a-b7667747c514"
            token: "32pwbkzd7qp06bt9zznee5xjhc7kfbt9"
            protocol: "websocket"
          skynet config, (e, socket) ->
            throw e  if e
            @socket = socket
            @socket.on "message", (message) ->
              console.log "message received", message
        goHome: ->
          @socket.emit "message",
            devices: @uuid
            payload:
              message_type: "single_command"
              time_stamp: new Date()
              command:
                action: "MOVE ABSOLUTE"
                x: 0
                y: 0
                z: 0
                speed: 100   # Not sure about this one.
                amount: 0 # Is this for "DOSE WATER"?
                delay: 0
            , (data) ->
              console.log data
          return true
        goAbs: ->
          @socket.emit "message",
            devices: @device.uuid
            payload:
              message_type: "single_command"
              time_stamp: new Date()
              command:
                action: "MOVE ABSOLUTE"
                x: @x
                y: @y
                z: @z
                speed: 100   # Not sure about this one.
                amount: 0 # Is this for "DOSE WATER"?
                delay: 0
            , (data) ->
              console.log data
          return true
    Restangular.all "devices"
]
