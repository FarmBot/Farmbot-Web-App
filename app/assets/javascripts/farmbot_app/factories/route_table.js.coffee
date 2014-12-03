angular.module("FarmBot").factory 'RouteTable', [() ->

  confirmation: (data, device) ->
    console.log "Just got a confirmation message. Yay!"

  read_status_response: (data, device) ->
    msg = data.message || {}
    device.status = msg.status
    device.x = msg.status_current_x
    device.y = msg.status_current_y
    device.z = msg.status_current_z
    return true

  missing: (data, device) ->
    console.error("Unable to parse message type from MeshBlu")
]
