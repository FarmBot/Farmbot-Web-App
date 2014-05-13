# This is a manifest for all the files related to the Farmbot Device management
# page. This page is currently located via '/pages/device_panel'.

app = angular.module('FarmBot', ['ngResource'])

app.controller "DeviceController",  ($scope, $resource) ->
  $resource("/api/devices/:id").query (data) ->
    $scope.devices = data