# This is a manifest for all the files related to the Farmbot Device management
# page. This page is currently located via '/pages/device_panel'.

app = angular.module('FarmBot', ['restangular'])

app.controller "DeviceController",  ($scope, Restangular) ->
  devices = Restangular.all('devices')
  devices.getList().then (data) ->
    $scope.devices = data