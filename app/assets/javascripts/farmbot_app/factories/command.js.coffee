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

    pin_on: (pin_number) ->
      message_type: "single_command",
      time_stamp: Date.now(),
      command:
        action: "PIN WRITE",
        pin: pin_number,
        value1: 1,
        mode: 0,

    pin_off: (pin_number) ->
      message_type: "single_command",
      time_stamp: Date.now(),
      command:
        action: "PIN WRITE",
        pin: pin_number,
        value1: 0,
        mode: 0,

    move_abs: (x, y, z) ->
      message_type: 'single_command'
      time_stamp: new Date()
      command:
        action: 'MOVE ABSOLUTE'
        x: x
        y: y
        z: z
        speed: 100
        delay: 0

    move_rel: (x, y, z) ->
      message_type: 'single_command'
      time_stamp: new Date()
      command:
        action: 'MOVE RELATIVE'
        x: x
        y: y
        z: z
        speed: 100
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
