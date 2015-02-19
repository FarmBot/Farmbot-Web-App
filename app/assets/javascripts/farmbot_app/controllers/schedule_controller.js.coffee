controller = ($scope, Data) ->
  $scope.form = {repeat: 'daily'}
  $scope.pickADateOptions = {interval: 15}
  $scope.repeats = [{show: 'Minutes', value: 'minutely'},
                    {show: 'Hours',   value: 'hourly'},
                    {show: 'Days',    value: 'daily'},
                    {show: 'Weeks',   value: 'weekly'},
                    {show: 'Months',  value: 'monthly'},
                    {show: 'Years',   value: 'yearly'}]

angular.module('FarmBot').controller "ScheduleController", [
  '$scope'
  'Data'
  controller
]
