# The movement controller provides an indepth view of a device as well as fine-
# grained control options. The name is an artifact and needs to be changed.
# TODO: Network status indicator
# TODO: Device selection
angular.module('FarmBot').controller "MovementController", [
  '$scope'
  'Restangular'
  'Devices'
  ($scope, Restangular, Devices) ->
    $scope.devices = Devices
    [$scope.x, $scope.y, $scope.z] = [0, 0, 0]

    $scope.moveTo = ({x, y, z}) ->
      # These will probably get out of sync at some point. Will need to find a
      # way to refresh based on what the device tells us about its location.
      $scope.x += x if x
      $scope.y += y if y
      $scope.z += z if z
      $scope.goAbs()
# Vacuum = 10
# Water Pump = 9
# LED = 13
# UTM = 8
    $scope.goHome  = -> Devices.moveAbs 0, 0, 0, (data) -> console.log 'Home.'
    $scope.goAbs   = -> Devices.moveAbs $scope.x, $scope.y, $scope.z, (d)->(d)
    $scope.refresh = -> Devices.getStatus( (d) -> console.log d)
    $scope.toggle  = (num) -> Devices.togglePin(num)

]
