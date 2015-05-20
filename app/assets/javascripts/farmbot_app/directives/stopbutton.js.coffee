# A button used to set integers
ctrl = [
  '$scope',
  'Devices',
  ($scope, Devices) ->
    $scope.stop = -> Devices.stop()
]
directive =
  restrict: 'AEC'
  template: '<button class="red button-like" type="button">Stop</button>'
  scope:
    schedules: '='
  link: ($scope, el, attr) ->
    el.on 'click', => $scope.stop()
  controller: ctrl

angular.module("FarmBot").directive 'stopbutton', [() -> directive]
