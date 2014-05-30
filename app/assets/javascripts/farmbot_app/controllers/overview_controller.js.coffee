# The overview controller provides an indepth view of a device as well as fine-
# grained controll options.

angular.module('FarmBot').controller "OverviewController", [
  '$scope'
  'Restangular'
  'Skynet'
  ($scope, Restangular, Skynet) ->
    Restangular.all('devices').getList().then (data) ->
      $scope.devices = data
      $scope.device  = #new Skynet(dvc.uuid, dvc.token)
    $scope.goHome = ->
      debugger
]
