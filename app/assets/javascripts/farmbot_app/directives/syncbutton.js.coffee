# A button used to set integers
ctrl = [
  '$scope',
  'Devices',
  'Data'
  ($scope, Devices, Data) ->
    $scope.sync = ->
      # This method contains a lot of data massaging that shouldn't happen.
      # I tried to adjust the relationship settings so that the relationship
      # is auto-stringified (send "Sched => Seq => Steps" automatically.)
      # JS-Data should be handling this stuff for us, but I don't have time
      # to learn the conventions atm. Pull requests welcome. Look in
      # data.js.coffee
      payload = Data.utils.removeCircular($scope.schedules)
      for schedule in payload
        seq = _($scope.sequences).findWhere _id: schedule.sequence_id
        schedule.sequence = Data.utils.removeCircular(seq)

      Devices.send "sync_sequence", payload
]
directive =
  restrict: 'AEC'
  template: '<button class="yellow button-like" type="button">Sync</button>'
  scope:
    schedules: '='
  link: ($scope, el, attr) ->
    console.log "Schedules are:", $scope.schedules
    el.on 'click', => $scope.sync()
  controller: ctrl

angular.module("FarmBot").directive 'syncbutton', [() -> directive]
