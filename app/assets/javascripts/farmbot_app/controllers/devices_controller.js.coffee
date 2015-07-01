# The device settings controller mostly handles MeshBlu configuration options.
# If you're storing things related to a particular device and it's not an action
# it probably belongs in here.
controller = ($scope, Data, Devices) ->
  nope = (e) -> alert 'Doh!'; console.error e
  Data
    .findAll('device', {})
    .catch(nope)
    .then((data) -> $scope.device = data[0])
  Data.bindAll 'device', {}, $scope, 'devices'
  $scope.clear = ->
    $scope.form = {}
    $scope.logs = []
  $scope.clear()
  $scope.refreshLogs = -> (Devices.fetchLogs (d) -> $scope.logs = (d.data || []); console.log d)
  $scope.selectDevice = (device) -> $scope.form = device
  $scope.createDevice = ->
    Data
      .create('device', $scope.form)
      .catch(nope)
      .then($scope.clear)
  $scope.removeDevice = (device) ->
    Data
      .destroy('device', device._id)
      .catch(nope)
      .then($scope.clear)

angular
.module('FarmBot')
.controller "DevicesController", ['$scope', 'Data', 'Devices', controller]
