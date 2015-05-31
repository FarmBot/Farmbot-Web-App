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

    $scope.axisdata = {} # Holding area for axis data in <manualmovementinput/>

    $scope.manualMovement = ->
      coords = ($scope.axisdata[coord] for coord in ['x', 'y', 'z'])
      Devices.moveAbs (coord.val() for coord in coords)...
      (coord.reset() for coord in coords)

    # Devices.pollStatus()
]
