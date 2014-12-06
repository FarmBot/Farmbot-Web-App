class DeviceService
  constructor: (@$rootScope, @$http, @Command, @Router) ->
    @initConnections()

  initConnections: ->
    @log = []
    @current = {}
    @status = {meshblu: "Connecting"}
    good = (data, status, request, meta) =>
      @list     = data
      @current  = data[0]
      @connectToMeshBlu()
    bad  = (data, status, request, meta) =>
      alert "Oh no! I could not connect to the My Farmbot service. The server" +
            " might be temporarily down"
    @$http.get('api/devices').success(good).error(bad)

  handleMsg: (data) =>
    bot = _.find(@list, {uuid: data.fromUuid})
    @$rootScope.$apply(@Router.create(data, bot))

  handleStatus: (data) ->
    @status = data

  connectToMeshBlu: ->
    # Avoid double connections
    unless @connection?.connected
      @connection = skynet.createConnection
        type:  "farmbotdss"
        uuid:  "7e3a8a10-6bf6-11e4-9ead-634ea865603d"
        token: "zj6tn36gux6crf6rjjarh35wi3f5stt9"
      @connection.on "ready", (data) =>
        @$rootScope.$apply(=> @status.meshblu = "online")
        @connection.on "message", @handleMsg
        @connection.on "status", @handleStatus
    else
      console.log "[WARN] Already connected to MeshBlu."

  getStatus: (cb) ->
    @current.status = 'Fetching data'
    @send(@Command.create("read_status"), cb)

  togglePin: (number, cb) ->
    pin = "pin#{number}"
    if @current[pin]
      @current[pin] = off
      @send(@Command.create("pin_off", number), cb)
    else
      @current[pin] = on
      @send(@Command.create("pin_on", number), cb)
    console.log "Pin #{number} is now #{@current[pin]}"

  moveAbs: (x, y, z, cb) ->
    @send(@Command.create("move_abs", x, y, z), cb)

  send: (msg, cb = (d) -> console.log(d)) ->
    if !!@connection
      @connection.message
        devices: @current.uuid
        payload: msg
        , => @$rootScope.$apply(cb)
    else
      console.warn("Already connected to Meshblu")

angular.module("FarmBot").service "Devices",[
  '$rootScope'
  '$http'
  'Command'
  'Router'
  ($rootScope, $http, Command, Router) ->
    return new DeviceService($rootScope, $http, Command, Router)
]
