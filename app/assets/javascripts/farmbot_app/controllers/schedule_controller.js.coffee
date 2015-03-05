controller = ($scope, Data, Calendar) ->
  nope = (e) -> alert 'Doh!'; console.error e
  clear = -> $scope.form = {}; drawCalendar()
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

  $scope.prettyDates = []
  drawCalendar = -> $scope.prettyDates = Calendar.draw($scope.schedules)
  $scope.$watchCollection 'schedules', drawCalendar

  $scope.submit = -> Data.create('schedule', $scope.form).catch(nope).then clear

  $scope.destroy = ->
    if !!$scope.form._id
      Data.destroy('schedule', $scope.form._id).catch(nope).then clear
    else
      clear()

  $scope.edit = (sched) -> $scope.form = sched

  previousSchedule = (indx) ->
    $scope.prettyDates[indx - 1] || {next_time: new Date(0)}
  currentSchedule = (indx) -> $scope.prettyDates[indx]

  $scope.showDate = (indx) ->
    return yes if $scope.prettyDates.length is 1
    before = previousSchedule(indx).next_time.getDay()
    after = currentSchedule(indx).next_time.getDay()
    if before is after then no else yes
  $scope.pastEvent = (sched) -> sched.next_time < new Date()
  $scope.nextEvent = ($index) ->
    previous = $scope.pastEvent(previousSchedule($index))
    current  = $scope.pastEvent(currentSchedule($index))
    if previous is true and current is false then yes else no

angular.module('FarmBot').controller "ScheduleController", [
  '$scope'
  'Data'
  'Calendar'
  controller
]
