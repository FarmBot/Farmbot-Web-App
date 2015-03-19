# Takes in a MeshBlu message object and a Farmbot Object. Determines which
# method to call
angular.module("FarmBot").factory 'Router', [
  'RouteTable'
  (RouteTable) ->
    class Router
      create: (@data, @bot) ->
        @routing_key = @data.message.message_type
        if RouteTable.hasOwnProperty(this.routing_key)
          RouteTable[@routing_key](@data, @bot)
        else
          msg = "Failed message. Possible unknown key '#{@routing_key}'?"
          console.error(msg)
          RouteTable['missing'](@data, @bot)
    new Router
]
