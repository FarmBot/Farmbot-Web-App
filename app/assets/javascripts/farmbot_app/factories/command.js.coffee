# Helper class to DRY up creation of outbound command messages
class SingleCommandMessage
  constructor: (payload = {}) ->
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
    update_calibration: (the_whole_friggin_bot) ->
      {
        message_type: 'update_calibration'
        command:      the_whole_friggin_bot
      }


    read_status: (values) ->
      message_type: 'read_status'

    pin_write: (values) ->
      new SingleCommandMessage
        action: "pin write",
        pin: values.pin,
        value1: values.value1,
        mode: values.mode,

    move_absolute: (coords) ->
      new SingleCommandMessage
        action: 'MOVE ABSOLUTE'
        x: coords.x
        y: coords.y
        z: coords.z
        speed: coords.speed || 100

    move_relative: (coords) ->
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

    exec_sequence: (sequence) ->
      command: sequence
      message_type: 'exec_sequence'

    sync_sequence: (sequence) ->
      command: sequence
      message_type: 'sync_sequence'

    error: (nope) ->
      msg = "Unknown FarmBot message type #{nope}"
      console.warn(msg)
      return error: "Unknown message type #{nope}"

angular.module("FarmBot").factory 'Command', [() -> new Command ]
