controller = ($scope, Data) ->
  $scope.form = {repeat: 'daily'}
  $scope.pickADateOptions = {interval: 15}
  $scope.repeats = [{show: 'Minutes', value: 'minutely'},
                    {show: 'Hours',   value: 'hourly'},
                    {show: 'Days',    value: 'daily'},
                    {show: 'Weeks',   value: 'weekly'},
                    {show: 'Months',  value: 'monthly'},
                    {show: 'Years',   value: 'yearly'}]
  $scope.schedules = JSON.parse('[{"_id":"54e485ec70726f39a3020000","start_time":"2015-02-16T17:01:00.000Z","end_time":"2015-02-20T00:01:00.000Z","next_time":"2015-02-18T17:01:00.000Z","repeat":1,"time_unit":"daily","sequence_id":"54e485ec70726f39a3050000"},{"_id":"54e485ec70726f39a3070000","start_time":"2015-02-16T17:01:00.000Z","end_time":"2015-02-20T00:01:00.000Z","next_time":"2015-02-18T17:01:00.000Z","repeat":1,"time_unit":"daily","sequence_id":"54e485ec70726f39a30a0000"}]')
angular.module('FarmBot').controller "ScheduleController", [
  '$scope'
  'Data'
  controller
]
