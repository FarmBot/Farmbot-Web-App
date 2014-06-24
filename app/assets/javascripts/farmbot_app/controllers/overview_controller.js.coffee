# The Overview controller is in need of a better name. It should be called
# 'controlController' or something. The name 'overview' is somewhat of an
# artifact.
angular.module('FarmBot').controller "OverviewController", [
  '$scope'
  'Restangular'
  'DeviceFactory'
  ($scope, Restangular, DeviceFactory) ->
    Restangular.all('devices').getList().then (data) ->
      $scope.test    = yes # Delete this line.
      $scope.devices = data
      $scope.device  = data[0]
      $scope.device.connectToSkyNet()

]
