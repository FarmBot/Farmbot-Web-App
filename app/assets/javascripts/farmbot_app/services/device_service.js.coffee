# TODOs:
# 1. Get rid of Restangular and just use vanilla $http and $q. It was nice, but
#    has too many gotchas
# 2. Convert to Coffeescript class.
class DeviceService
  constructor: (@$rootScope, @Restangular, @Command, @Router) ->
    @log = []
    @status = {skynet: "offline"}
    @Restangular.all('devices').getList().then (data) =>
      @list     = data
      @current  = data[0]
      @connectToMeshBlu()

  handleMsg: (data) =>
    bot = _.find(@list, {uuid: data.fromUuid})
    @$rootScope.$apply(@Router.create(data, bot))

  handleStatus: (data) =>
    @status = data

  connectToMeshBlu: ->
    # Avoid double connections
    unless @connection?.connected
      @connection = skynet.createConnection
        type:  "farmbotdss"
        uuid:  "7e3a8a10-6bf6-11e4-9ead-634ea865603d"
        token: "zj6tn36gux6crf6rjjarh35wi3f5stt9"
      @connection.on "ready", (data) =>
        console.log "Ready"
        @connection.on "message", @handleMsg
        @connection.on "status", @handleStatus
    else
      console.log "[WARN] Already connected to MeshBlu."

  getStatus: (cb) ->
    @current.status = 'Fetching data...'
    @send(@Command.create("read_status"), cb)

  toggleVac: (cb) ->
    if @current.pin13
      @current.pin13 = off
      @send(@Command.create("pin_off", 13), cb)
    else
      @current.pin13 = on
      @send(@Command.create("pin_on", 13), cb)

  send: (msg, cb = (d) -> console.log(d)) ->
    if !!@connection
      @connection.message
        devices: @current.uuid
        payload: msg
        , => @$rootScope.$apply(cb)
    else
      console.log("WARNING! You tried to send a message before being connected")

angular.module("FarmBot").service "Devices",[
  '$rootScope'
  'Restangular'
  'Command'
  'Router'
  ($rootScope, Restangular, Command, Router) ->
    return new DeviceService($rootScope, Restangular, Command, Router)
]
