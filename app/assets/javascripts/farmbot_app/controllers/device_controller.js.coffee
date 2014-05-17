app = angular.module('FarmBot')

controller = ($scope, Restangular, Device) ->
  $scope.devices = Restangular.all('devices').getList().$object
  $scope.refreshDeviceList = ->
    devices.getList().then (data) ->
      $scope.devices = data
  # window.haha = $scope.devices
  # haha.doDELETE(a._id)

app.controller "DeviceController", [
  '$scope'
  'Restangular'
  "DeviceService"
  controller
]
