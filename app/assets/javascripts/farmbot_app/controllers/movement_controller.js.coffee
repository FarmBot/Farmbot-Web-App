# The movement controller provides an in depth view of a device as well as fine-
# grained control options. The name is an artifact and needs to be changed.
angular.module('FarmBot').controller "MovementController", [
  '$scope'
  'Devices'
  '$timeout'
  ($scope, Devices, $timeout) ->
    nope = (e) -> alert 'Doh!'; console.error e
    $scope.device  = Devices.current
    $scope.goHome  = -> Devices.moveAbs 0, 0, 0, (data) -> console.log 'Home.'
    $scope.home = (axis) ->
      if axis
        Devices.sendMessage "home_#{axis}"
      else
        $scope.home(dir) for dir in ['x', 'y', 'z']
    Devices.pollStatus()
]
