RouteTable = ->
  confirmation: (data, device) -> yes
  read_status_response: (data, device) ->
    msg = data.message || {}
    device.status = msg.status
    device.x = msg.status_current_x
    device.y = msg.status_current_y
    device.z = msg.status_current_z
    yes
  error: (data, device) -> console.warn data
  missing: (data, device) -> console.error "Uknown message type"

angular.module("FarmBot").factory 'RouteTable', [RouteTable]
