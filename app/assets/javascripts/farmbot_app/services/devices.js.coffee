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
  getStatus: => @send("read_status") and @pollStatus()

  pollStatus: =>
    callback = if @socket.connected() then @getStatus else @pollStatus
    @$timeout callback, 500

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
