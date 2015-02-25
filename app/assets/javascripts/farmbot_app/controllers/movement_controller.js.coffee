# The movement controller provides an in depth view of a device as well as fine-
# grained control options. The name is an artifact and needs to be changed.
angular.module('FarmBot').controller "MovementController", [
  '$scope'
  'Devices'
  ($scope, Devices) ->
    $scope.devices = Devices
    [$scope.x, $scope.y, $scope.z, $scope.multiplier] = [0, 0, 0, 100]

    $scope.goHome  = -> Devices.moveAbs 0, 0, 0, (data) -> console.log 'Home.'
    $scope.refresh = -> Devices.getStatus( (d) -> console.log d)
    $scope.toggle  = (num) -> Devices.togglePin(num)
    # $scope.goRel      = -> Devices.moveRel $scope.x, $scope.y, $scope.z, (d)->(d)
    # $scope.zeroCoords = -> [$scope.x, $scope.y, $scope.z] = [0, 0, 0]
    # $scope.move       = (axis, modifier = 1) ->
    #   console.log "Set #{axis} from #{$scope[axis]} to #{$scope.multiplier * modifier}"
    #   $scope.zeroCoords()
    #   $scope[axis] = $scope.multiplier * modifier
    #   $scope.goRel()

]
