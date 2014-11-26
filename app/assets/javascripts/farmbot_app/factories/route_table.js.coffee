# angular.module("FarmBot").factory 'RouteTable', [() ->
  class window.RouteTable
    @read_status_response: (data, device) ->
      console.log "reading status response"
      try
        msg = data.message || {}
        device.status = msg.status
        device.x = msg.status_current_x
        device.y = msg.status_current_y
        device.z = msg.status_current_z
        return true
      catch error
        console.error("Error routing MeshBlu: #{error}")
        return false
    @missing: (data, device) ->
      console.error("Unable to parse message type from MeshBlu")

#   new RouteTable
# ]
