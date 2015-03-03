filter = (a, b) ->
  _.map a, -> a

angular.module('FarmBot').filter "sortByDate", [-> filter]
