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
    # TODO: put this into a filter
    # First, grab all the unique dates for the users schedules.
    relevantDates = _.uniq(_.flatten(_.map($scope.schedules, 'calendar')))
    # This is the reduce function that gets called by _.reduce().
    groupByMany = (accumulator, date, indx) ->
      # Grab all the schedule items that match the current date.
      schedules = _.where($scope.schedules, calendar: [date])
      # Then convert that date string into a Date Object
      date = new Date(date)
      months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
                'Oct', 'Nov', 'Dec']
      # Then make a 'stringly typed' date object that only is `MMMDD`
      key = "#{months[date.getMonth()-1]}#{date.getDate()}"
      # Then, push it into the array of schedules for that time slot. Make an
      # array if one does not already exist on that hash key.
      accumulator[key] = (accumulator[key] || []).concat(schedules)
      # Then, sort them all so they are in order
      accumulator[key] = _.sortBy(accumulator[key], 'start_time')
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
