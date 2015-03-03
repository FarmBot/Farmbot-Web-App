filter = (schedules) ->
    # TODO: Maybe I should put this into a filter?
    relevantDates = _.uniq(_.flatten(_.map(schedules, 'calendar')))
    groupedByDate = (accumulator, date, indx) ->
      schedules = _.where(schedules, calendar: [date])
      accumulator[date] = (accumulator[date] || []).concat(schedules)
      accumulator[date] = _.uniq(accumulator[date])
      accumulator
    _.reduce relevantDates, groupedByDate, {}

angular.module('FarmBot').filter "groupByDate", [-> filter]
