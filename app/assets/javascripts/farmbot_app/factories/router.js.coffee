# Takes in a MeshBlu message object and a Farmbot Object. Determines which
# method to call
TELEMETRY      = "api,message"
SYSTEM_MESSAGE = "payload,topic"
BOT_REPLY      = "id,method,params"
BOT_REPLY2     = "message"
LOG_MESSAGE    = "payload"

angular.module("FarmBot").factory 'Router', [
  ->
    route: (data, bot) ->
      omg = _(data).omit(["devices", "fromUuid"]).pick(_.identity).keys().sort().toString()

      switch omg
        when TELEMETRY      then console.log("Update router to update bot status")
        when SYSTEM_MESSAGE then 'Usually tells you the bot came online.'
        when BOT_REPLY      then '-Probably the one I need to implement-'
        when BOT_REPLY2     then 'Confused about this one?'
        when LOG_MESSAGE    then 'From a `puts` statement on the bot'
        else
          alert 'I just got an unexpected message from MeshBlu. Please send me a copy of the logs.'
          console.log data
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
