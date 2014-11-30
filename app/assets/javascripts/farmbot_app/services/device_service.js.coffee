# TODOs:
# 1. Get rid of Restangular and just use vanilla $http and $q. It was nice, but
#    has too many gotchas
# 2. Convert to Coffeescript class.
angular.module("FarmBot").service "Devices",[
  '$rootScope'
  'Restangular'
  'Command'
  'Router'
  ($rootScope, Restangular, Command, Router) ->
    Devices =
      log: []
      status: {skynet: "offline"}

    Restangular.all('devices').getList().then (data) ->
      Devices.list     = data
      Devices.current  = data[0]
      Devices.connectToMeshBlu()

    Devices.handleMsg = (data) ->
      bot = _.find(Devices.list, {uuid: data.fromUuid})
      $rootScope.$apply(Router.create(data, bot))

    Devices.handleStatus = (data) ->
      Devices.status = data
      console.log data

    Devices.connectToMeshBlu = ->
      # Avoid double connections
      unless Devices.connection?.connected
        Devices.connection = skynet.createConnection
          type:  "farmbotdss"
          uuid:  "7e3a8a10-6bf6-11e4-9ead-634ea865603d"
          token: "zj6tn36gux6crf6rjjarh35wi3f5stt9"
        Devices.connection.on "ready", (data) ->
          console.log "Ready"
          Devices.connection.on "message", Devices.handleMsg
          Devices.connection.on "status", Devices.handleStatus
      else
        console.log "[WARN] Already connected to MeshBlu."

    Devices.getStatus = (cb) ->
      Devices.current.status = 'Fetching data...'
      Devices.send(Command.create("read_status"), cb)

    Devices.toggleVac = (cb) ->
      if Devices.current.pin13
        Devices.current.pin13 = off
        Devices.send(Command.create("pin_off", 13), cb)
      else
        Devices.current.pin13 = on
        Devices.send(Command.create("pin_on", 13), cb)

    Devices.send = (msg, cb = (d) -> console.log(d)) ->
      if !!Devices.connection
        Devices.connection.message
          devices: Devices.current.uuid
          payload: msg
          , -> $rootScope.$apply(cb)
      else
        console.log("WARNING! You tried to send a message before being connected")

    return Devices
]
