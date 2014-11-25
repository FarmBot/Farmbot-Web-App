class window.Router
  constructor: (@data, @bot) ->
    @routing_key = @data.message.message_type
    @routing_key ?= "missing"
    new RouteTable[@routing_key](@data, @bot)
