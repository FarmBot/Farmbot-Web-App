controller = ($scope, Data, Calendar) ->
  nope = (e) -> alert 'Doh!'; console.error e
  $scope.clear = -> $scope.form = {} and $scope.drawCalendar()
  $scope.repeats = [{show: 'Minutes', value: 'minutely'},
                    {show: 'Hours',   value: 'hourly'},
                    {show: 'Days',    value: 'daily'},
                    {show: 'Weeks',   value: 'weekly'},
                    {show: 'Months',  value: 'monthly'},
                    {show: 'Years',   value: 'yearly'}]

  Data.findAll('sequence', {}).catch(nope)
  Data.findAll('schedule', {}).catch(nope)
  Data.bindAll('sequence', {}, $scope, 'sequences')
  Data.bindAll('schedule', {}, $scope, 'schedules')

  $scope.submit = ->
    Data
      .create('schedule', $scope.form)
      .catch(nope)
      .then($scope.clear)
  $scope.destroy = ->
    if !!$scope.form._id
      Data
        .destroy('schedule', $scope.form._id)
        .catch(nope)
        .then($scope.clear)
    else
      $scope.clear()
  $scope.edit = (sched) -> $scope.form = sched

  $scope.prettyDates = []
  $scope.drawCalendar = -> $scope.prettyDates = Calendar.draw($scope.schedules)
  $scope.$watchCollection 'schedules', $scope.drawCalendar
  lastDate = '2015-01-01T12:00:00.000Z' # initial val is dtub. Remember last key
  $scope.showNextDate = (date) ->
    same = lastDate.substring(8,10) is date.substring(8,10)
    lastDate = date
    if not same then yes else no
angular.module('FarmBot').controller "ScheduleController", [
  '$scope'
  'Data'
  'Calendar'
  controller
]
