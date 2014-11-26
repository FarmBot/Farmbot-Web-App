# Takes in a MeshBlu message object and a Farmbot Object. Determines which
# method to call
angular.module("FarmBot").factory 'Router', [() ->
  class Router
    create: (@data, @bot) ->
      @routing_key = @data.message.message_type
      if RouteTable.hasOwnProperty(this.routing_key)
        RouteTable[@routing_key](@data, @bot)
      else
        msg = "Failed message. Most likely caused by unknown message key. #{e}"
        console.error(msg)
        RouteTable['missing'](@data, @bot)
  new Router
]

# class window.Router
#   constructor: (@data, @bot) ->
#     @routing_key = @data.message.message_type
#     @routing_key ?= "missing"
#     new RouteTable[@routing_key](@data, @bot)
