# The movement controller provides an in depth view of a device as well as fine-
# grained control options. The name is an artifact and needs to be changed.
angular.module('FarmBot').controller "MovementController", [
  '$scope'
  'Devices'
  ($scope, Devices) ->
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
        # CASES:
        # 1. User enters '' (wants to clear the form)
        # 2. User enters 0 (evals to false)
        # 3. User enters real number
        # 4. User enters letters / bad input
        # FIXME!
        wow = parseInt(v)
        if wow == 0
          buffer[axis] = 0
        else
          buffer[axis] = wow or null

      get = (axis)    -> buffer[axis] or Devices.current[axis]
      (v) -> if arguments.length then set(v, axis) else get(axis)

    $scope.manualMovement = ->
      Devices.moveRel ($scope.axis(coord)() for coord in ['x', 'y', 'z'])...
      buffer['x'] = null
      buffer['y'] = null
      buffer['z'] = null
    Devices.pollStatus()
]
