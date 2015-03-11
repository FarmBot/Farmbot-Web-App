# A button used to set integers
directive =
  template: '<button class="xx-small button radius red">OFF</button>'
  restrict: 'E'
  scope:
    peripheral: '='
  link: (scope, el, attr) ->
    el.on 'click', ->
      pins =
        water:  10
        led:    13
        vacuum: 9
        tool:   8
      # Just blink the LED if the programmer selects the wrong pin #
      scope.toggle(pins[attr.peripheral] || 13)
  controller: ['$scope', 'Devices', ($scope, Devices) ->
    $scope.toggle = (num) -> Devices.togglePin num
  ]

angular.module("FarmBot").directive 'togglebutton', [() -> directive]
