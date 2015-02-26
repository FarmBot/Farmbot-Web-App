# Used for _CREATION_ of _OUTBOUND_ messages.
class Command
  create: (type, args = {}) ->
    unless Command.all.hasOwnProperty(type)
      args = type
      type = 'error'
    return Command.all[type](args)

  @all:
    single_command: (_args) ->
      message_type: 'single_command'
      time_stamp: Date.now()

    read_status: (_args) ->
      message_type: 'read_status'
      time_stamp: Date.now()

    pin_write: (arg) ->
      message_type: "pin_write",
      time_stamp: Date.now(),
      command:
        action: "PIN WRITE",
        pin: arg.pin,
        value1: arg.value1,
        mode: arg.mode,

    move_abs: (coords) ->
      message_type: 'move_abs'
      time_stamp: new Date()
      command:
        action: 'MOVE ABSOLUTE'
        x: coords.x
        y: coords.y
        z: coords.z
        speed: coords.speed || 100
        delay: 0

    move_rel: (coords) ->
      message_type: 'move_rel'
      time_stamp: new Date()
      command:
        action: 'MOVE RELATIVE'
        x: coords.x
        y: coords.y
        z: coords.z
        speed: coords.speed || 100
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
