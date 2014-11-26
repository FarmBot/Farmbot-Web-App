# Takes in a MeshBlu message object and a Farmbot Object. Determines which
# method to call
angular.module("FarmBot").factory 'Router', [() ->
  class Router
    create: (@data, @bot) ->
      @routing_key = @data.message.message_type
      @routing_key ?= "missing"
      RouteTable[@routing_key](@data, @bot)

  new Router
]

# class window.Router
#   constructor: (@data, @bot) ->
#     @routing_key = @data.message.message_type
#     @routing_key ?= "missing"
#     new RouteTable[@routing_key](@data, @bot)
