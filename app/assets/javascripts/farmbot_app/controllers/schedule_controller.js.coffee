controller = ($scope, Data) ->
  $scope.form = {}
  $scope.world = 'world'
  $scope.pickADateOptions = {}

angular.module('FarmBot').controller "ScheduleController", [
  '$scope'
  'Data'
  controller
]
