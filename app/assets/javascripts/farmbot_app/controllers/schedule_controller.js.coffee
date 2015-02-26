controller = ($scope, Data) ->
  nope = (e) -> alert 'Doh!'; console.error e
  $scope.repeats = [{show: 'Minutes', value: 'minutely'},
                    {show: 'Hours',   value: 'hourly'},
                    {show: 'Days',    value: 'daily'},
                    {show: 'Weeks',   value: 'weekly'},
                    {show: 'Months',  value: 'monthly'},
                    {show: 'Years',   value: 'yearly'}]

  Data.findAll('sequence', {}).catch(nope)
  Data.bindAll('sequence', {}, $scope, 'sequences')
  Data.findAll('schedule', {}).catch(nope)
  Data.bindAll('schedule', {}, $scope, 'schedules')

  $scope.prettyDates = []
  $scope.$watchCollection 'schedules', ->
    pretty = _.groupBy $scope.schedules, (s) ->
      new Date(s.start_time).toDateString().substring(4, 10)
    $scope.prettyDates = pretty
    console.log $scope.prettyDates

  $scope.submit = ->
    Data
      .create('schedule', $scope.jsonPayload())
      .catch(nope)
      .then(-> $scope.form = {})

  # Data transfer from angular format to API consumable format.
  $scope.jsonPayload = ->
    submission =
      start_time:  $scope.form.dstart
      end_time:    $scope.form.dend
      time_unit:   $scope.form.timeUnit
      repeat:      $scope.form.repeat
      sequence_id: $scope.form.sequenceId
    if $scope.form.tstart
      if submission.start_time
        submission.start_time.setHours   $scope.form.tstart.getHours()
        submission.start_time.setMinutes $scope.form.tstart.getMinutes()

      if submission.end_time
        submission.end_time.setMinutes $scope.form.tstart.getMinutes()
        submission.end_time.setHours   $scope.form.tstart.getHours()

    submission

angular.module('FarmBot').controller "ScheduleController", [
  '$scope'
  'Data'
  controller
]
