# Takes in a MeshBlu message object and a Farmbot Object. Determines which
# method to call

TELEMETRY = "api,devices,fromUuid,message"

angular.module("FarmBot").factory 'Router', [
  ->
    route: (data, bot) ->
      routing_key = _(data).pick(_.identity).keys().sort().toString()
      switch
        when TELEMETRY
          @read_status(data, bot)
        else
          console.log "Unknown signature on incoming message: #{routing_key}"
          debugger
      # return if data.payload # "payload" means its telemetry, not message.
      # routing_key = data.message.message_type
      # if @hasOwnProperty(routing_key) and routing_key != 'route'
      #   @[routing_key](data, bot)
      # else
      #   alert  "Got an unknown '#{routing_key}' message from the device."
      #   @['missing'](data, bot)
    confirmation: (data, device) -> yes
    single_command: (data, device) -> yes
    read_status: (data, device) ->
      device[k] = v for k, v of (data.message || {})
    error: (data, device) ->
      msg = data?.message?.error || "Unexpected error. See console for details."
      alert "FarmBot sent back an error: #{msg}. See console for details"
      console.warn data
    missing: (data, device) -> no
    exec_sequence: (data, device) ->
      console.log "Hooray, the sequence was sent off!"
    sync_sequence: (data, device) -> console.log "Sync"
]
