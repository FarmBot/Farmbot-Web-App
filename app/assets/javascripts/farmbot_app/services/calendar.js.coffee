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
        result.next_time = key
        results.push result

    _.sortBy(results, 'next_time')

angular.module("FarmBot").service "Calendar",[-> new Calendar()]
