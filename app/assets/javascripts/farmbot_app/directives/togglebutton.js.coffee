# A button used to set integers
directive =
  template: '<button class="xx-small button radius red"
             ng-class="{red: !pinStatus, green: pinStatus}">
               {{ pinStatus() }}
             </button>'
  restrict: 'E'
  scope: true
  link: ($scope, el, attr) ->
    $scope.pin ?= $scope.pins[attr.peripheral] || 13
    el.on 'click', -> $scope.toggle()
  controller: ['$scope',
    'Devices',
    '$rootScope',
    ($scope, Devices, $rootScope) ->
      $scope.pins =
        water:  10
        led:    13
        vacuum: 9
        tool:   8
      $scope.pinStatus = ->
        switch @device.current["pin#{@pin}"]
          when "on"
            "ON"
          when "off"
            "OFF"
          else
            "LOADING"
      $scope.toggle = ->
        $rootScope.$apply -> Devices.togglePin $scope.pin
  ]

angular.module("FarmBot").directive 'togglebutton', [() -> directive]
