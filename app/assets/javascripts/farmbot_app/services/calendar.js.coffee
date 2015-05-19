service = (Data, $q) ->
  nope = (e) -> console.error e

  @loadData = ->
    deferred = $q.defer()
    promise  = deferred.promise
    fail    = -> deferred.reject(a, b, c)
    Data
      .findAll('sequence', {})
      .catch(fail)
      .then (sequences) =>
        Data.loadRelations('sequence', s._id, ['step']) for s in sequences
        Data
          .findAll('schedule', {})
          .catch(fail)
          .then (schedules) =>
            deferred.resolve(sequences: sequences, schedules: schedules)
    promise
  # Welcome to the hairest method in all of Farmbot!
  # source: Array<Schedule> collection of Schedule objects
  # Returns Array<Schedule>, sorted by execution time, with duplicate items for
  # each occurence of that schedule.
  @draw = (source) ->
    # Creates a hash where key is a date and value is a collection of sequences
    # that are due on that date.
    groupByDueDate = (accumulator, date, indx) ->
      schedules = _.where(source, calendar: [date])
      accumulator[date] = (accumulator[date] || []).concat(schedules)
      accumulator[date] = _.uniq(accumulator[date])
      accumulator

    # Splices a next_time field into the Schedule object so that the collection
    # can be sorted by due date.
    insertFieldThatIsNamedNextTime = (accumulator, pair, indx) ->
      [date, schedule] = [pair[0], pair[1][0]]
      result = _.omit(schedule, 'calendar')
      result.next_time = new Date(date)
      accumulator.push result
      accumulator

    _.chain(source)
     .map('calendar')            # Grab 2d array of all possible execution times.
     .flatten()                  # Flatten down into 1d array
     .uniq()                     # Grab uniq values to give all possible calendar
                                 # points
     .reduce(groupByDueDate, {}) # Return:
                                 # [{date1: [schedules...]},{date2: [schedules]}]
     .pairs()                    # Return: [ [date1, [schedules]],
                                 #           [date2, [schedules]], . . .]
     .reduce(insertFieldThatIsNamedNextTime, []) # Splice in 'next_time' field
     .sortBy('next_time')
     .value()

  return

angular.module("FarmBot").service "Calendar",[
  'Data'
  '$q'
  service
]
