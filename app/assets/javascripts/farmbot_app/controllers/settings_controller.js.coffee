# The device settings controller mostly handles MeshBlu configuration options.
# If you're storing things related to a particular device and it's not an action
# it probably belongs in here.
app = angular.module('FarmBot')

controller = ($scope, Devices) ->
  $scope.devices = Devices
  $scope.form    = {}
  $scope.device  = Devices.current

  $scope.createDevice = -> $scope.devices.save($scope.form) and $scope.form = {}
  $scope.selectDevice = (device) -> $scope.form = _.clone(device)
  $scope.removeDevice = (device) -> Devices.remove(device) and $scope.form = {}


app.controller "SettingsController", ['$scope', 'Devices', controller]
