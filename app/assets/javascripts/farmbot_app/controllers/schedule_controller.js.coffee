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
  Data.findAll('sequence', {}).catch(nope).then (seqs) ->
    Data.loadRelations('sequence', s._id, ['step']) for s in seqs

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
  $scope.sync = ->
    # This method contains a lot of data massaging that shouldn't happen.
    # I tried to adjust the relationship settings so that the relationship is
    # auto-stringified (send "Sched => Seq => Steps" automatically.)
    # JS-Data should be handling this stuff for us, but I don't have time to
    # learn the conventions atm. Pull requests welcome. Look in data.js.coffee
    payload = Data.utils.removeCircular($scope.schedules)
    for schedule in payload
      seq = _($scope.sequences).findWhere _id: schedule.sequence_id
      schedule.sequence = Data.utils.removeCircular(seq)

    Devices.send "sync_sequence", payload
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
angular.module('FarmBot').controller "ScheduleController", [
  '$scope'
  'Data'
  'Calendar'
  'Devices'
  controller
]
