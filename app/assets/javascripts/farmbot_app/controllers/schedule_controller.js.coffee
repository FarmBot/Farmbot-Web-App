controller = ($scope, Data) ->
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

  $scope.prettyDates = {}
  $scope.drawCalendar = ->
    # TODO: Maybe I should put this into a filter?
    relevantDates = _.uniq(_.flatten(_.map($scope.schedules, 'calendar')))
    groupByMany = (accumulator, date, indx) ->
      schedules = _.where($scope.schedules, calendar: [date])
      accumulator[date] = (accumulator[date] || []).concat(schedules)
      accumulator[date] = _.uniq(accumulator[date])
      accumulator
    $scope.prettyDates = _.reduce relevantDates, groupByMany, {}
  $scope.$watchCollection 'schedules', $scope.drawCalendar
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
angular.module('FarmBot').controller "ScheduleController", [
  '$scope'
  'Data'
  controller
]
