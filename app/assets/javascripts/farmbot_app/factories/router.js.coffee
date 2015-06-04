# Takes in a MeshBlu message object and a Farmbot Object. Determines which
# method to call
angular.module("FarmBot").factory 'Router', [
  ->
    route: (data, bot) ->
      # Why are some messages coming in with a 'data' attribute and others with
      # a 'payload' attribute?
      routing_key = (data.message || data.payload).message_type
      if @hasOwnProperty(routing_key) and routing_key != 'route'
        @[routing_key](data, bot)
      else
        console.error  "Failed message. Possible unknown key '#{routing_key}'?"
        @['missing'](data, bot)
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
