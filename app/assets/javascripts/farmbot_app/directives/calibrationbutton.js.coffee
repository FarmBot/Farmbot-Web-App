# A button used to set integers
ctrl = [
  '$scope',
  'Devices',
  ($scope, Devices) ->
    $scope.toggle = -> debugger
]
directive =
  restrict: 'AEC'
  template: '<button class="red button-like" type="button">{{ 2 + 2}}</button>'
  scope:
    toggle_val: '@'
  link: ($scope, el, attr) ->
    el.on 'click', => $scope.toggle()
  controller: ctrl

angular.module("FarmBot").directive 'calibrationbutton', [() -> directive]
