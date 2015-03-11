# The movement controller provides an in depth view of a device as well as fine-
# grained control options. The name is an artifact and needs to be changed.
angular.module('FarmBot').controller "MovementController", [
  '$scope'
  'Devices'
  ($scope, Devices) ->
    nope = (e) -> alert 'Doh!'; console.error e
    $scope.devices = Devices
    [$scope.x, $scope.y, $scope.z, $scope.multiplier] = [0, 0, 0, 100]
    $scope.goHome  = -> Devices.moveAbs 0, 0, 0, (data) -> console.log 'Home.'
    $scope.refresh = -> Devices.getStatus( (d) -> console.log d)
    $scope.home    = (axis) ->
      if axis
        Devices.sendMessage "home_#{axis}"
      else
        $scope.home(dir) for dir in ['x', 'y', 'z']
    $scope.toggle  = (num) -> Devices.togglePin(num)
]
