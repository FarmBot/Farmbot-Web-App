class DeviceService
  constructor: (@Command, @Router, @socket, @$http, @$timeout) ->
    [@list, @current, @status] = [[], {}, {meshblu: "Connecting"}]
    @stepSize = 100
    @current.syncStatus = 'offline'
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
    nope = (a,b,c,d) -> alert "Can't fetch devices"; console.error error
    @$http.get('/api/devices').success(ok).error(nope)

  handleMsg: (data) =>
    bot = _.find(@list, {uuid: data.fromUuid}) || @current
    @Router.route(data, bot)

  handleStatus: (data) =>
    console.log(data)
    @status = data

  connectToMeshBlu: ->
    @socket.on 'connect', =>
      @current.syncStatus = 'sync_now'
      @socket.on 'message', @handleMsg
      @socket.on 'identify', (data) =>
        @socket.emit 'identity',
          socketid: data.socketid
          uuid: "73425170-2660-49de-acd9-6fad4989aff6"
          token: "bcbd352aaeb9b7f18214a63cb4f3b16b89d8fd24"
        @socket.emit 'subscribe',
          uuid: @current.uuid, token: @current.token,
          (data) => @send "read_status"
  togglePin: (number, cb) ->
    switch @current["pin#{number}"]
       when 'on' then @send "pin_write", pin: number, value1: 0, mode: 0
       when 'off' then @send "pin_write", pin: number, value1: 1, mode: 0
       else opps()

  # TODO This method (and moveAbs) might be overly specific. Consider removal in
  # favor of @send()
  moveRel: (x, y, z) -> @send "move_relative", {x: x, y: y, z: z}
  moveAbs: (x, y, z) -> @send "move_absolute", {x: x, y: y, z: z}
  stop: -> @send "emergency_stop"
  fetchLogs: (cb) ->
    @socket.emit 'getdata', {
      uuid:  @current.uuid
      token: @current.token
      limit: 10
    }, (d) ->
      if d.result is false
        alert 'Ensure you have entered the correct token for your FarmBot'
      else
        cb(d)

  send: (msg, body = {}) ->
    return opps() unless @socket.connected()
    uuid = ->
      'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) ->
        r = Math.random() * 16 | 0
        v = if c is 'x' then r else (r & 0x3|0x8)
        v.toString(16)
      )
    # LEGACY COMPATIBILITY STUFF AHEAD! We had a different naming convention
    # that used 2 object keys (`action` and `message_type`). I switched it to
    # use 'topic' style routing keys (strings). The code below massages the
    # legacy code into a usable format with out breaking old stuff. TODO: go
    # back and remove legacy calls.
    cmd = @Command.create(msg, body)
    if cmd.command && cmd.command.action
      stringy_method = "#{cmd.message_type || 'undefined'}"
      stringy_method += ".#{cmd.command.action}"
    else
      stringy_method = msg
    @socket.emit "message",
      devices: @current.uuid,
      params: _.omit(cmd.command, "action"),
      method: stringy_method,
      id: uuid()

angular.module("FarmBot").service "Devices",[
  'Command'
  'Router'
  'socket'
  '$http'
  '$timeout'
  (Command, Router, socket, $http, $timeout) ->
    return new DeviceService(Command, Router, socket, $http, $timeout)
]
