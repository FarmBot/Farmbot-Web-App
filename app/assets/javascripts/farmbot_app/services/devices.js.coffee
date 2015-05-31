class DeviceService
  constructor: (@Command, @Router, @socket, @Data, @$timeout) ->
    [@list, @current, @status] = [[], {}, {meshblu: "Connecting"}]
    @stepSize = 100
    @initConnections()
  opps = (error) ->
    alert 'Message error. Wait for device to connect or refresh the page'
    console.error error
  initConnections: ->
    ok = (data) =>
      if data[0]
        [@list, @current] = [data, data[0]]
        @connectToMeshBlu()
      else
        alert 'You need to link a Farmbot to your account.'
        window.location = '/dashboard#/devices'
    @Data.findAll('device', {}).catch(opps).then(ok)

  handleMsg: (data) =>
    bot = _.find(@list, {uuid: data.fromUuid})
    @Router.route(data, bot)

  handleStatus: (data) =>
    console.log(data)
    @status = data

  connectToMeshBlu: ->
    @socket.on 'connect', (a, b) -> console.log 'connect', a, b
    @socket.on 'connect_error', (a, b) -> console.log 'connect_error', a, b
    @socket.on 'connect_timeout', (a, b) -> console.log 'connect_timeout', a, b
    @socket.on 'reconnect', (a, b) -> console.log 'reconnect', a, b
    @socket.on 'reconnect_attempt', (a, b) -> console.log 'reconnect_attempt', a, b
    @socket.on 'reconnecting', (a, b) -> console.log 'reconnecting', a, b
    @socket.on 'reconnect_error', (a, b) -> console.log 'reconnect_error', a, b
    @socket.on 'reconnect_failed', (a, b) -> console.log 'reconnect_failed', a, b
    @socket.on 'connect', =>
      @socket.on 'message', @handleMsg
      @socket.on 'identify', (data) =>
        @socket.emit 'identity',
          socketid: data.socketid
          uuid: "73425170-2660-49de-acd9-6fad4989aff6"
          token: "bcbd352aaeb9b7f18214a63cb4f3b16b89d8fd24"
  getStatus: =>
    @send("read_status")
    @pollStatus()

  pollStatus: =>
    callback = if @socket.connected() then @getStatus else @pollStatus
    @$timeout callback, 750

  togglePin: (number, cb) ->
    switch @current["pin#{number}"]
       when 'on'
         @send "pin_write", pin: number, value1: 0, mode: 0
       when 'off'
         @send "pin_write", pin: number, value1: 1, mode: 0
       else
         opps()

  # TODO This method (and moveAbs) might be overly specific. Consider removal in
  # favor of @sendMessage()
  moveRel: (x, y, z) -> @send "move_relative", {x: x, y: y, z: z}
  moveAbs: (x, y, z) -> @send "move_absolute", {x: x, y: y, z: z}
  stop: -> @send "emergency_stop"

  send: (msg, body = {}) ->
    if @socket.connected()
      cmd = @Command.create(msg, body)
      @socket.emit "message", {devices: @current.uuid, payload: cmd}
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
