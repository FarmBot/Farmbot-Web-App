# When you pull a collection of events off of the API, the next_time it occurs
# comes inside a collection of date objects. This service takes a collection of
# date objects and duplicates / orders them to have a single 'next_time' attr.
# for easier presentation on the frontend.
class Calendar
  draw: (source) ->
    groupByMany = (accumulator, date, indx) ->
      schedules = _.where(source, calendar: [date])
      accumulator[date] = (accumulator[date] || []).concat(schedules)
      accumulator[date] = _.uniq(accumulator[date])
      accumulator

    keyValPairs = _(source)
      .map('calendar')
      .flatten()
      .uniq()
      .reduce(groupByMany, {})

    results = []

    for key, values of keyValPairs
      for object in values
        result = _.omit(object, 'calendar')
        result.next_time = new Date(key)
        results.push result

    _.sortBy(results, 'next_time')

angular.module("FarmBot").service "Calendar",[ -> new Calendar()]
