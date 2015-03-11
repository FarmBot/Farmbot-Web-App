# Helper class to DRY up creation of outbound command messages
class SingleCommandMessage
  constructor: (payload = {}) ->
    @time_stamp = new Date()
    @command = payload
  message_type: 'single_command'

# Used for _CREATION_ of _OUTBOUND_ messages.
class Command
  create: (type, args = {}) ->
    unless Command.all.hasOwnProperty(type)
      args = type
      type = 'error'
    return Command.all[type](args)

  @all:
    read_status: (args) -> new SingleCommandMessage(args)

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
        delay: 0

    move_rel: (coords) ->
      new SingleCommandMessage
        action: 'MOVE RELATIVE'
        x: coords.x
        y: coords.y
        z: coords.z
        speed: coords.speed || 100
        delay: 0

    home_x: (args) ->
      new SingleCommandMessage
        action: 'HOME X'
        speed: args.speed || 100
        delay: 0

    home_y: (args) ->
      new SingleCommandMessage
        action: 'HOME Y'
        speed: args.speed || 100
        delay: 0

    home_z: (args) ->
      new SingleCommandMessage
        action: 'HOME Z'
        speed: args.speed || 100
        delay: 0

    error: (nope) ->
      msg = "Unknown FarmBot message type #{nope}"
      console.warn(msg)
      return error: "Unknown message type #{nope}"

    # write_parameters: (args) ->
    #   message_type: 'write_parameters'
    #   time_stamp: Date.now()
    #   paramets: args

    # read_parameters: (_args) ->
    #   message_type: 'read_parameters'
    #   time_stamp: Date.now()

    # read_logs: (_args) ->
    #   message_type: 'read_logs'
    #   time_stamp: Date.now()

    # crop_schedule_update: (_args) ->
    #   message_type: 'crop_schedule_update'
    #   time_stamp: Date.now()

angular.module("FarmBot").factory 'Command', [() -> new Command ]
