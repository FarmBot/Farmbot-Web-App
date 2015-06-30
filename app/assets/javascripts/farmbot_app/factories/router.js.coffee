angular.module("FarmBot").factory 'Router', [
  ->
    routes =
      read_status: (data, dvc) ->
        dvc[k] = v for k, v of (data.params || data.result || {})
      error: (data, device) ->
        msg = data?.error?.error || "Unexpected error."
        alert "FarmBot sent back an error: #{msg}. See console for details"
        console.warn data
      sync_sequence:  (data, device) -> device.syncStatus = "synced"
      missing:        (data, device) -> yes
      exec_sequence:  (data, device) -> yes
      confirmation:   (data, device) -> yes
      single_command: (data, device) -> yes

    route: (data, bot = {}) ->
      message_type = "MISC"
      message_type = "NOTIFICATION" if data.method and data.params and !data.id
      message_type = "REQUEST"      if data.method and data.params and data.id
      message_type = "RESULT"       if data.result
      message_type = "ERROR"        if data.error
      message_type = "ACK"          if data.fromUuid != bot.uuid

      console.log message_type, data

      switch message_type
        when 'NOTIFICATION' then (routes[data.method] || routes.error)(data,bot)
        when 'RESULT'       then routes[data.result.method](data,bot)
        when 'ERROR'        then routes.error(data, bot)
        when 'ACK'          then return yes
        else
          return yes
]
