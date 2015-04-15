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

    # Coordinates object for fine grained control
    $scope.manualMovementCoords = {x: 0, y: 0, z: 0}
    $scope.manualMovement = ->
      that = $scope.manualMovementCoords
      Devices.moveRel that.x, that.y, that.z
    Devices.pollStatus()
]
