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
    $scope.stop   = -> Devices.stop()
    $scope.goHome = -> Devices.moveAbs 0, 0, 0
    $scope.home   = (axis) -> Devices.send "home_#{axis or 'all'}"


    # Holds temporary x/y/z coords until ready to send to bot.
    buffer  = {x: null, y: null, z: null}

    # Returns a getter/setter function for specified axis
    $scope.axis = (axis) ->
      set = (v, axis) ->
        buffer[axis] = if _.isFinite(num = parseInt(v)) then num else null

      get = (axis)    -> buffer[axis] or Devices.current[axis]

      (v) -> if arguments.length then set(v, axis) else get(axis)

    $scope.manualMovement = ->
      Devices.moveAbs ($scope.axis(coord)() for coord in ['x', 'y', 'z'])...
      [buffer.x, buffer.y, buffer.z] = [null, null, null]
    Devices.pollStatus()
]
