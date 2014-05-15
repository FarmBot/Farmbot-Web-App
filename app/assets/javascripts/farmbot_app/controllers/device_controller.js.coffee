
app = angular.module('FarmBot')

app.controller "DeviceController",  ($scope, Restangular) ->
  devices = Restangular.all('devices')
  devices.getList().then (data) ->
    $scope.devices = data
