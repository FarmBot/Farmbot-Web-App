# The overview controller provides an indepth view of a device as well as fine-
# grained controll options. Needs a better name.

# Run this in the command line for diagnostics.
# ======
# curl -X GET http://skynet.im/subscribe/713c69b1-e36a-11e3-93f8-f3e7e8d1cce9?token=0waw1l97lbwc23xrh0oem7d8rbai3sor --header "skynet_auth_uuid: 4bb4a961-e8e6-11e3-93f8-f3e7e8d1cce9" --header "skynet_auth_token: jce90gf7szxxyldihii1m3xv5d9jatt9"

angular.module('FarmBot').controller "OverviewController", [
  '$scope'
  'Restangular'
  ($scope, Restangular, Skynet) ->
    Restangular.all('devices').getList().then (data) ->
      $scope.devices = data
      $scope.device  = data[0]
      $scope.connectToSkyNet()

    $scope.goHome = ->
      $scope.socket.emit "message",
        devices: $scope.device.uuid
        message:
          message_type: 'single_command'
          time_stamp: new Date()
          command:
            action: 'MOVE ABSOLUTE'
            x: 0
            y: 0
            z: 0
            speed: 100   # Not sure about this one.
            amount: 0 # Is this for "DOSE WATER"?
            delay: 0
        , (data) ->
          console.log data
      return true

    $scope.connectToSkyNet = ->
      config =
        type: "farmbotdss"
        uuid: "901ba251-ed7a-11e3-995a-b7667747c514"
        token: "32pwbkzd7qp06bt9zznee5xjhc7kfbt9"
        protocol: "websocket"
      skynet config, (e, socket) ->
        throw e  if e
        $scope.socket = socket
        $scope.socket.on "message", (message) ->
          console.log "message received", message

    $scope.debug = ->
      $scope.socket.emit "message", JSON.parse($scope.message), (data) ->
        console.log data

]
