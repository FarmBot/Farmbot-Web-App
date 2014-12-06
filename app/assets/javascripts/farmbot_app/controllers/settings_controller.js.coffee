# The device settings controller mostly handles MeshBlu configuration options.
# If you're storing things related to a particular device and it's not an action
# it probably belongs in here.
app = angular.module('FarmBot')

controller = ($scope, Devices) ->
  $scope.devices = Devices

  $scope.device = Devices.current

  # I am going to stop here for now, as I am incredibly tired. When I get back
  # to this, I will move all of this functionality into the Devices service and
  # rid us of Restangular.

  $scope.removeDevice = (device) ->
    device.remove().then ->
      $scope.devices = _.without($scope.devices, device);

  $scope.selectDevice = (device) ->
    $scope.device = device

  $scope.createDevice = ->
    if typeof($scope.device._id) != 'undefined'
      $scope.device.put().then (data) ->
        $scope.device = {}
    else
      $scope.devices.post($scope.device).then (data) ->
        $scope.devices.push(data)
        $scope.device = {}


app.controller "SettingsController", ['$scope', 'Devices', controller]
