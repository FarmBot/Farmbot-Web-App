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
    # :(? Why is this? This might be a JSData bug?
    class ScheduleFormAdapter
      constructor: ({@_id, @repeat, @time_unit,
                     @start_time, @end_time, @sequence_id}) ->
    Data
      .create('schedule', (new ScheduleFormAdapter($scope.form)))
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
  $scope.pastEvent = (sched) -> sched.next_time < new Date()
  $scope.nextEvent = ($index) ->
    pastSchedule = $scope.prettyDates[$index - 1] || {next_time: new Date(0)}
    previous = $scope.pastEvent(pastSchedule)
    current  = $scope.pastEvent($scope.prettyDates[$index])
    if previous is true and current is false then yes else no
  $scope.prettyDates = []
  $scope.drawCalendar = -> $scope.prettyDates = Calendar.draw($scope.schedules)
  $scope.$watchCollection 'schedules', $scope.drawCalendar
  last = {getDay: -> NaN}
  $scope.showDate = (date) ->
    # TODO: We don't need that `last` closure anymore, now that we are using
    # Arrays instead of Objects. We can do `schedules[$index - 1]`
    isSameDay = last.getDay() is date.getDay()
    last = date
    if isSameDay then no else yes
angular.module('FarmBot').controller "ScheduleController", [
  '$scope'
  'Data'
  'Calendar'
  controller
]
