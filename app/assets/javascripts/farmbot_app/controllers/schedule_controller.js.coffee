controller = ($scope, Data) ->
  $scope.form = {} # Data for new schedules.
  $scope.pickADateOptions = {interval: 15}

angular.module('FarmBot').controller "ScheduleController", [
  '$scope'
  'Data'
  controller
]
