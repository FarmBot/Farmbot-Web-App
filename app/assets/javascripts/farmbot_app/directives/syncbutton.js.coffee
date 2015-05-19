# A button used to set integers
ctrl = [
  '$scope',
  'Devices',
  'Data'
  'Calendar'
  ($scope, Devices, Data, Calendar) ->
    $scope.sync = ->
      nope = (data) -> alert 'SYNC FAILURE'; console.log data
      yep  = (data) ->
        # This method contains a lot of data massaging that shouldn't happen.
        # I tried to adjust the relationship settings so that the relationship
        # is auto-stringified (send "Sched => Seq => Steps" automatically.)
        # JS-Data should be handling this stuff for us, but I don't have time
        # to learn the conventions atm. Pull requests welcome. Look in
        # data.js.coffee
        payload = Data.utils.removeCircular(data.schedules)
        for schedule in payload
          seq = _(data.sequences).findWhere _id: schedule.sequence_id
          schedule.sequence = Data.utils.removeCircular(seq)
        debugger
        Devices.send "sync_sequence", payload

      Calendar.loadData().then(yep, nope)
]
directive =
  restrict: 'AEC'
  template: '<button class="yellow button-like" type="button">Sync</button>'
  scope:
    schedules: '='
  link: ($scope, el, attr) ->
    el.on 'click', => $scope.sync()
  controller: ctrl

angular.module("FarmBot").directive 'syncbutton', [() -> directive]
