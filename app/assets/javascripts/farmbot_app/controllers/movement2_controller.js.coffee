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
  'Devices'
  ($scope, Restangular, Devices) ->
    $scope.devices = Devices

    $scope.x = 0
    $scope.y = 0
    $scope.z = 0

    $scope.moveTo = ({x, y, z}) ->
      # These will probably get out of sync at some point. Will need to find a
      # way to refresh based on what the device tells us about its location.
      $scope.x += x if x
      $scope.y += y if y
      $scope.z += z if z
      console.log("Movings to #{$scope.x}, #{$scope.y}, #{$scope.z}")
      $scope.goAbs()

    $scope.goHome = ->
      $scope.devices.connection.message
        devices: $scope.devices.current.uuid
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
          console.log("Done moving home")
          $scope.devices.log << data
          console.log data
      return true

    $scope.goAbs = ->
      $scope.devices.connection.message
        devices: $scope.devices.current.uuid
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
          console.log("Done attempting movement to #{$scope.x}, #{$scope.y}, #{$scope.z}")
          $scope.devices.log << data
          console.log data
      return true
    $scope.debug = ->
      $scope.devices.connection.emit "message", JSON.parse($scope.message), (data) ->
        console.log data

]
