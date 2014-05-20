app = angular.module('FarmBot')

controller = ($scope, Restangular, Device) ->
  $scope.devices = Restangular.all('devices').getList().$object

  $scope.device = {}

  $scope.removeDevice = (device) ->
    device.remove().then ->
      $scope.devices = _.without($scope.devices, device);

  $scope.selectDevice = (device) ->
    $scope.device = device

  # Since the form is used for creation and editing, we need a way of knowing if
  # it's new (POST) or old (PUT).
  $scope.isNew = (device) ->
    !_.find($scope.devices, $$hash_key: $scope.device.$$hashkey)

  $scope.createDevice = ->
    if $scope.isNew($scope.device)
      $scope.devices.post($scope.device).then (data) ->
        $scope.devices.push(data)
        $scope.device = {}
    else
      $scope.device.put().then (data) ->
        $scope.device = {}


app.controller "DeviceController", [
  '$scope'
  'Restangular'
  "DeviceService"
  controller
]
