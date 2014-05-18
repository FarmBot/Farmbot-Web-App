app = angular.module('FarmBot')

controller = ($scope, Restangular, Device) ->
  $scope.devices = Restangular.all('devices').getList().$object
  $scope.refreshDeviceList = ->
    devices.getList().then (data) ->
      $scope.devices = data
  $scope.removeDevice = (device) ->
    device.remove().then ->
      #update the $scope var once the repsonse is OK
      $scope.devices = _.without($scope.products, product);


app.controller "DeviceController", [
  '$scope'
  'Restangular'
  "DeviceService"
  controller
]
