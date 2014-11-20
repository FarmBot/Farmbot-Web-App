class FarmbotCommand
  constructor: (type, args) ->
    result = FarmbotCommand.list[type](args)
  @list:
    single_command: (_args) ->
      message_type: 'single_command'
      time_stamp: Date.now()

    read_status: (_args) ->
      message_type: 'read_status'
      time_stamp: Date.now()

    write_parameters: (args) ->
      message_type: 'write_parameters'
      time_stamp: Date.now()
      paramets: args

    read_parameters: (_args) ->
      message_type: 'read_parameters'
      time_stamp: Date.now()

    read_logs: (_args) ->
      message_type: 'read_logs'
      time_stamp: Date.now()

    crop_schedule_update: (_args) ->
      message_type: 'crop_schedule_update'
      time_stamp: Date.now()

