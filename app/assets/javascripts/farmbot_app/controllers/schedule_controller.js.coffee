controller = ($scope, Data, Calendar, Devices) ->
  nope = (e) -> alert 'Doh!'; console.error e
  clear = -> $scope.form = {}; drawCalendar()
  $scope.repeats = [{show: 'Minutes', value: 'minutely'},
                    {show: 'Hours',   value: 'hourly'},
                    {show: 'Days',    value: 'daily'},
                    {show: 'Weeks',   value: 'weekly'},
                    {show: 'Months',  value: 'monthly'},
                    {show: 'Years',   value: 'yearly'}]
  $scope.calDate = new Date()
  $scope.calDate.setHours(0)
  $scope.calDate.setMinutes(0)
  getSchedules = ->
    Data.ejectAll('schedule')
    Data.findAll('schedule', start: $scope.calDate, bypassCache: yes).catch nope
  getSchedules()
  $scope.$watch 'calDate', getSchedules, true
  Data.findAll('sequence', {}).catch(nope)
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
  $scope.shiftDate = (days) ->
    n = $scope.calDate.getTime() + (86400000 * days)
    $scope.calDate = new Date(n)
  previousSchedule = (indx) ->
    $scope.prettyDates[indx - 1] || {next_time: new Date(0)}
  currentSchedule = (indx) -> $scope.prettyDates[indx]
  $scope.pastEvent = (sched) -> sched.next_time < new Date()
  $scope.nextEvent = ($index) ->
    return false if $index is 0
    previous = $scope.pastEvent(previousSchedule($index))
    current  = $scope.pastEvent(currentSchedule($index))
    if previous is true and current is false then yes else no
  $scope.sync = ->
    Devices.send('crop_schedule_update', $scope.schedules)
angular.module('FarmBot').controller "ScheduleController", [
  '$scope'
  'Data'
  'Calendar'
  'Devices'
  controller
]
