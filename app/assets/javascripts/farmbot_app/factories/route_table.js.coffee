RouteTable = ->
  confirmation: (data, device) -> yes
  single_command: (data, device) -> yes
  read_status: (data, device) ->
    device[k] = v for k, v of (data.message || {})
  error: (data, device) -> console.warn data
  missing: (data, device) ->
    console.error "Possible unknown key '#{@routing_key}'?"

angular.module("FarmBot").factory 'RouteTable', [RouteTable]
