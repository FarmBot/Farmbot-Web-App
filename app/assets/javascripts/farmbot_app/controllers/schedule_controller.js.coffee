controller = ($scope, Data) ->
  $scope.world = 'world'

angular.module('FarmBot').controller "ScheduleController", [
  '$scope'
  'Data'
  controller
]
