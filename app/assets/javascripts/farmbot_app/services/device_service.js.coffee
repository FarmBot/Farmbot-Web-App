angular.module("FarmBot").service "Devices",[
  'Restangular'
  (Restangular) ->
    Devices =
      log: []
      status: {skynet: "offline"}
    Restangular.all('devices').getList().then (data) ->
      Devices.list     = data
      Devices.current  = data[0]
      Devices.connectToMeshBlu()

    Devices.connectToMeshBlu = ->
      # Avoid double connections
      unless Devices.connection?.connected
        Devices.connection = skynet.createConnection
          type:  "farmbotdss"
          uuid:  "7e3a8a10-6bf6-11e4-9ead-634ea865603d"
          token: "zj6tn36gux6crf6rjjarh35wi3f5stt9"
        Devices.connection.on "ready", (data) ->
          console.log "Ready"
          Devices.connection.on "message", (data) ->
            bot = _.find(Devices.list, {uuid: data.fromUuid})
            new Router(data, bot)
          Devices.connection.status (data) ->
            Devices.status = data
            console.log "Status:"
            console.log data
      else
        console.log "[WARN] Already connected to MeshBlu."

    Devices.getStatus = -> Devices.send(new BotMessage("read_status"))

    Devices.send = (msg, cb = (d) -> console.log("Got msg: #{JSON.stringify(d)}")) ->
      if !!Devices.connection
        Devices.connection.message
          devices: Devices.current.uuid
          payload: msg
          , -> cb()
      else
        console.log("WARNING! You tried to send a message before being connected")

    window.sn = Devices.send #debuggery.
    return Devices
]
