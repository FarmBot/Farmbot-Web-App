# The movement controller provides an in depth view of a device as well as fine-
# grained control options. The name is an artifact and needs to be changed.
angular.module('FarmBot').controller "MovementController", [
  '$scope'
  'Devices'
  ($scope, Devices) ->
    $scope.wow = 'Hello'
    nope = (e) -> alert 'Doh!'; console.error e
    # I really don't like throwing the whole device service into the $scope.
    # TODO determine why $scope.device = Devices.current is broke :(
    $scope.device = Devices
    $scope.goHome = -> Devices.moveAbs 0, 0, 0
    $scope.home   = (axis) -> Devices.send "home_#{axis or 'all'}"


    class Axis
      constructor: (@axis) ->
        [@dirty, @editing] = [no, no]
        @num = Devices.current[@axis]
      set: (v) ->
        if _.isEmpty(v) then [@dirty, @num] = [no, ''] else @dirty = yes
        @num = num if _.isFinite(num = parseInt(v))
      get: ->
        if @dirty || @editing then @num else Devices.current[@axis]
      in: =>
        @editing = yes
        @num = '' if !@dirty
      out: =>
        @editing = no

    # Holds temporary x/y/z coords until ready to send to bot.
    $scope.buffer = {x: new Axis('x'), y: new Axis('y'), z: new Axis('z')}

    # Returns a getter/setter function for specified axis
    $scope.axis = (axis) ->
      set = (v, axis) -> $scope.buffer[axis].set(v)
      get = (axis) -> $scope.buffer[axis].get()

      (v) -> if arguments.length then set(v, axis) else get(axis)

    $scope.manualMovement = ->
      Devices.moveAbs ($scope.axis(coord)() for coord in ['x', 'y', 'z'])...
      [$scope.buffer.x, $scope.buffer.y, $scope.buffer.z] = [null, null, null]
    Devices.pollStatus()
]
