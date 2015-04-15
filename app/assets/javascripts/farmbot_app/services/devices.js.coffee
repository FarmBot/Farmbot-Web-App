class DeviceService
  constructor: (@Command, @Router, @socket, @Data, @$timeout) ->
    [@list, @current, @status] = [[], {}, {meshblu: "Connecting"}]
    @stepSize = 10
    @initConnections()
  opps = -> alert 'Unable to send device messages. Wait for device to connect' +
                  ' or refresh the page'
  initConnections: ->
    nope = ->
      alert "Oh no! I could not connect to the My Farmbot service. The server" +
          " might be temporarily down"
    ok = (data) =>
      if data[0]
        [@list, @current] = [data, data[0]]
        @connectToMeshBlu()
      else
        alert 'You need to link a Farmbot to your account.'
        window.location = '/dashboard#/devices'
    @Data.findAll('device', {}).catch(nope).then(ok)

  handleMsg: (data) =>
    bot = _.find(@list, {uuid: data.fromUuid})
    @Router.route(data, bot)

  handleStatus: (data) =>
    console.log(data)
    @status = data

  connectToMeshBlu: ->
    # Avoid double connections
    if @socket?.connected()
      console.log "[WARN] Already connected to MeshBlu."
    else
      @socket.on "message", @handleMsg
      @socket.on 'connect', =>
        @socket.on 'identify', (data) =>
          @socket.emit 'identity',
            socketid: data.socketid
            uuid:  "7e3a8a10-6bf6-11e4-9ead-634ea865603d"
            token: "zj6tn36gux6crf6rjjarh35wi3f5stt9"

  getStatus: =>
    @send(@Command.create("read_status"))
    @pollStatus()

  pollStatus: =>
    callback = if @socket.connected() then @getStatus else @pollStatus
    @$timeout callback, 500

  togglePin: (number, cb) ->
    pin = "pin#{number}"
    # TODO DRY it up!
    switch @current[pin]
       when 'on'
         msg = @Command.create "pin_write", pin: number, value1: 0, mode: 0
         @send msg
       when 'off'
         msg = @Command.create "pin_write", pin: number, value1: 1, mode: 0
         @send msg
       else
         console.warn 'I refuse to write a non-exhaustive case statement.'
    console.log "Set #{pin} to #{@current[pin]}"

  # TODO This method (and moveAbs) might be overly specific. Consider removal in
  # favor of @sendMessage()
  moveRel: (x, y, z, cb) ->
    @send(@Command.create("move_rel", {x: x, y: y, z: z}), cb)

  moveAbs: (x, y, z, cb) ->
    @send(@Command.create("move_abs", {x: x, y: y, z: z}), cb)

  sendMessage: (name, params) ->
    @send @Command.create(name, params)

  stop: ->
    @send(@Command.create("emergency_stop"))

  send: (msg) ->
    if @socket.connected()
      @socket.emit "message", {devices: @current.uuid, payload: msg}
    else
      opps()

angular.module("FarmBot").service "Devices",[
  'Command'
  'Router'
  'socket'
  'Data'
  '$timeout'
  (Command, Router, socket, Data, $timeout) ->
    return new DeviceService(Command, Router, socket, Data, $timeout)
]
