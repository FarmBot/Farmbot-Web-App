# A special controller that just holds stuff for the navbar, since it is outside
# of ng-view. Share information between controllers using factories.
app = angular.module('FarmBot')

controller = ($scope, Devices) ->
  $scope.devices = Devices

app.controller "NavbarController", [
  '$scope',
  'Devices',
  controller]