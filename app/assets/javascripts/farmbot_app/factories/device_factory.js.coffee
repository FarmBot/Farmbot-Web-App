angular.module("FarmBot").factory "Devices",[
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
          uuid:  "7e3a8a10-6bf6-11e4-9ead-634ea865603d" #Devices.current.uuid
          token: "zj6tn36gux6crf6rjjarh35wi3f5stt9" #Devices.current.token
        Devices.connection.on "ready", (data) ->
          console.log "Ready"
          Devices.connection.on "message", (data) ->
            Devices.log << data
            console.log "Message:"
            console.log data
          Devices.connection.status (data) ->
            Devices.status = data
            console.log "Status:"
            console.log data
      else
        console.log "[WARN] Already connected to MeshBlu."

    return Devices
]
