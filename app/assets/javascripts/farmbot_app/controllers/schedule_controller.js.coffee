controller = ($scope, Data) ->
  nope = (e) -> alert 'Doh!'; console.error e
  $scope.clear = -> $scope.form = {}
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
  $scope.edit = (sched) -> _.assign($scope.form, sched)
angular.module('FarmBot').controller "ScheduleController", [
  '$scope'
  'Data'
  controller
]
