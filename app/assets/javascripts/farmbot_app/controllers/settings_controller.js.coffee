# The deivce settings controller mostly handles SkyNet configuration options.
# If you're storing things related to a particular device and it's not an action
# it probably belongs in here.

app = angular.module('FarmBot')

controller = ($scope, Restangular) ->
  $scope.devices = Restangular.all('devices').getList().$object

  $scope.device = {}

  $scope.removeDevice = (device) ->
    device.remove().then ->
      $scope.devices = _.without($scope.devices, device);

  $scope.selectDevice = (device) ->
    $scope.device = device

  $scope.createDevice = ->
    # How does this even work!? Looks like the wrong order, but it works??
    if typeof($scope.device._id) != 'undefined'
      $scope.device.put().then (data) ->
        $scope.device = {}
    else
      $scope.devices.post($scope.device).then (data) ->
        $scope.devices.push(data)
        $scope.device = {}


app.controller "SettingsController", ['$scope', 'Restangular', controller]
