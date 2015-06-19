# A button used to set integers
ctrl = [
  '$scope',
  'Devices',
  'Data'
  'Calendar'
  ($scope, Devices, Data, Calendar) ->
    $scope.text = ->
      switch Devices.current.busy
        when 0 then 'Sync'
        when 1 then 'Working'
        else 'Waiting'
    $scope.sync = -> Devices.send "sync_sequence"
]
directive =
  restrict: 'AEC'
  template: '<button class="yellow button-like" type="button">{{ text() }}</button>'
  scope:
    schedules: '='
  link: ($scope, el, attr) ->
    el.on 'click', => $scope.sync()
  controller: ctrl

angular.module("FarmBot").directive 'syncbutton', [() -> directive]
