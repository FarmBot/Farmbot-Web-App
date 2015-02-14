controller = ($scope, Data) ->
  $scope.world = 'world'

angular.module('FarmBot').controller "DesignController", [
  '$scope'
  'Data'
  controller
]
