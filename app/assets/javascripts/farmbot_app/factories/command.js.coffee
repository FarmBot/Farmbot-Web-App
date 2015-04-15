# Helper class to DRY up creation of outbound command messages
class SingleCommandMessage
  constructor: (payload = {}) ->
    @time_stamp = new Date()
    @command = payload
    @message_type = 'single_command'

# Used for _CREATION_ of _OUTBOUND_ messages.
class Command
  create: (type, args = {}) ->
    unless Command.all.hasOwnProperty(type)
      args = type
      type = 'error'
    return Command.all[type](args)

  @all:
    read_status: (values) ->
      time_stamp: new Date()
      message_type: 'read_status'

    crop_schedule_update: (values) ->
      time_stamp: new Date()
      message_type: 'crop_schedule_update'
      payload: values

    pin_write: (values) ->
      new SingleCommandMessage
        action: "PIN WRITE",
        pin: values.pin,
        value1: values.value1,
        mode: values.mode,

    move_abs: (coords) ->
      new SingleCommandMessage
        action: 'MOVE ABSOLUTE'
        x: coords.x
        y: coords.y
        z: coords.z
        speed: coords.speed || 100

    move_rel: (coords) ->
      new SingleCommandMessage
        action: 'MOVE RELATIVE'
        x: coords.x
        y: coords.y
        z: coords.z
        speed: coords.speed || 100

    home_x: (args) ->
      new SingleCommandMessage
        action: 'HOME X'
        speed: args.speed || 100

    home_y: (args) ->
      new SingleCommandMessage
        action: 'HOME Y'
        speed: args.speed || 100

    emergency_stop: (args) ->
      new SingleCommandMessage
        action: 'EMERGENCY STOP'

    home_z: (args) ->
      new SingleCommandMessage
        action: 'HOME Z'
        speed: args.speed || 100

    home_all: (args) ->
      new SingleCommandMessage
        action: 'HOME ALL'
        speed: args.speed || 100

    error: (nope) ->
      msg = "Unknown FarmBot message type #{nope}"
      console.warn(msg)
      return error: "Unknown message type #{nope}"

angular.module("FarmBot").factory 'Command', [() -> new Command ]
