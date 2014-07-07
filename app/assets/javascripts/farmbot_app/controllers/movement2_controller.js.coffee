# The movement controller provides an indepth view of a device as well as fine-
# grained control options. The name is an artifact and needs to be changed.
# TODO: Network status indicator
# TODO: Device selection
# Run this in the command line for diagnostics.
# ======
# curl -X GET http://skynet.im/subscribe/713c69b1-e36a-11e3-93f8-f3e7e8d1cce9?token=0waw1l97lbwc23xrh0oem7d8rbai3sor --header "skynet_auth_uuid: 4bb4a961-e8e6-11e3-93f8-f3e7e8d1cce9" --header "skynet_auth_token: jce90gf7szxxyldihii1m3xv5d9jatt9"
angular.module('FarmBot').controller "Movement2Controller", [
  '$scope'
  'Restangular'
  ($scope, Restangular) ->
    $scope.x = 0
    $scope.y = 0
    $scope.z = 0

    $scope.upx = (x = 5) ->
      $scope.x = $scope.x + x
    $scope.upy = (y = 5) ->
      $scope.y = $scope.y + y
    $scope.upz = (z = 5) ->
      $scope.z = $scope.z + z
    
    $scope.downx = ->
      $scope.x = $scope.x - 5
    $scope.downy = ->
      $scope.y = $scope.y - 5
    $scope.downz = ->
      $scope.z = $scope.z - 5

    Restangular.all('devices').getList().then (data) ->
      $scope.devices = data
      $scope.device  = data[0]
      $scope.connectToSkyNet()

    $scope.goHome = ->
      $scope.socket.emit "message",
        devices: $scope.device.uuid
        payload:
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

    $scope.goAbs = ->
      $scope.socket.emit "message",
        devices: $scope.device.uuid
        payload:
          message_type: 'single_command'
          time_stamp: new Date()
          command:
            action: 'MOVE ABSOLUTE'
            x: $scope.x
            y: $scope.y
            z: $scope.z
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
          #TODO: Append all incoming messages to an array for display / unit tests.
          console.log "message received", message

    $scope.debug = ->
      $scope.socket.emit "message", JSON.parse($scope.message), (data) ->
        console.log data

]