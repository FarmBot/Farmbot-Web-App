SYNC_DISPLAY =
    offline:   {txt: 'Offline', icon: 'fa fa-times', color: 'red'}
    sync_now:  {txt: 'Sync Now', icon: 'fa fa-upload', color: 'yellow'}
    syncing:   {txt: 'Syncing', icon: 'fa fa-exchange', color: 'yellow'}
    synced:    {txt: 'Synced', icon: 'fa fa-check', color: 'green'}
    error:     {txt: 'Error', icon: 'fa fa-times', color: 'red'}
    estopped:  {txt: 'E-Stopped', icon: 'fa fa-stop', color: 'red'}
    unknown:   {txt: 'Unknown', icon: 'fa fa-question', color: 'red'}

ctrl = [
  '$scope',
  'Devices',
  'Data'
  'Calendar'
  ($scope, Devices, Data, Calendar) ->
    $scope.icon  = -> SYNC_DISPLAY[Devices.current.syncStatus || 'unknown'].icon
    $scope.color = -> SYNC_DISPLAY[Devices.current.syncStatus || 'unknown'].color
    $scope.txt   = -> SYNC_DISPLAY[Devices.current.syncStatus || 'unknown'].txt
    $scope.sync  = ->
      Devices.current.syncStatus = 'syncing'
      Devices.send "sync_sequence"
]
directive =
  restrict: 'AEC'
  template: '<button class="{{ color() }} button-like" type="button">
    {{ txt() }}
    <i class="{{ icon() }}"></i>
    </button>'
  scope:
    schedules: '='
  link: ($scope, el, attr) ->
    el.on 'click', => $scope.sync()
  controller: ctrl

angular.module("FarmBot").directive 'syncbutton', [() -> directive]
