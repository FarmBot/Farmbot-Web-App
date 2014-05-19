app = angular.module('FarmBot')

controller = ($scope, Restangular, Device) ->
  $scope.devices = Restangular.all('devices').getList().$object

  $scope.device = {}

  $scope.removeDevice = (device) ->
    device.remove().then ->
      #update the $scope var once the repsonse is OK
      $scope.devices = _.without($scope.devices, device);

  $scope.createDevice = ->
    $scope.devices.post($scope.device).then (data) ->
      $scope.devices.push(data)


app.controller "DeviceController", [
  '$scope'
  'Restangular'
  "DeviceService"
  controller
]
