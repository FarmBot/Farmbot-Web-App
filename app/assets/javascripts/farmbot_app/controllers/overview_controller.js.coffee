# The overview controller provides an indepth view of a device as well as fine-
# grained controll options.

angular.module('FarmBot').controller "OverviewController", [
  '$scope'
  'Restangular'
  ($scope, Restangular) ->
    $scope.device = {}
]
