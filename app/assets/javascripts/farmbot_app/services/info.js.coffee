service = [
  '$rootScope'
  ($rootScope) ->
    @logs = []
    @push = (o) -> @logs.unshift(o)
    this
]

angular
  .module("FarmBot")
  .service('Info', service)
