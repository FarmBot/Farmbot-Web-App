# The overview controller provides an indepth view of a device as well as fine-
# grained controll options. Needs a better name.

#TODO: Indicator that lets user see Skynet connection status.

angular.module('FarmBot').controller "OverviewController", [
  '$scope'
  'Restangular'
  'Skynet'
  ($scope, Restangular, Skynet) ->
    Restangular.all('devices').getList().then (data) ->
      $scope.devices = data
      $scope.device  = data[0]
      # DANGER, WARNING! Insecure code below. Just goofing around
      # before launch. This MUST be replaced.
      $scope.myUuid  = "4bb4a961-e8e6-11e3-93f8-f3e7e8d1cce9"
      $scope.myToken = "jce90gf7szxxyldihii1m3xv5d9jatt9"
      $scope.connectToSkyNet()
    $scope.goHome = ->
      uuid    = $scope.device.uuid
      message = {}
      $scope.skynet.send(message, uuid)
    $scope.connectToSkyNet = ->
      creds =
        uuid:  $scope.myUuid
        token: $scope.myToken
      $scope.skynet = new Skynet(creds)
]
