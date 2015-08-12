angular.module('FarmBot').directive 'calibrationbutton', [ ->
  {
    restrict: 'AEC'
    template: '<button
                class="button-like"
                ng-class="{red: !isTrue(), green: isTrue()}"
                type="button">
                  {{ label() }}
               </button>'
    scope: toggleval: '@'
    link: ($scope, el, attr) ->
      el.on 'click', -> $scope.toggle()
    controller: [
      '$scope'
      'Devices'
      ($scope, Devices) ->
        $scope.isTrue = -> if Devices[@toggleval] then yes else no
        $scope.label = ->
          if Devices[@toggleval] then 'YES' else 'NO'
        $scope.toggle = ->
          Devices[this.toggleval] = if Devices[this.toggleval] then 0 else 1
          Devices.send("update_calibration", _.pick(Devices, this.toggleval))
    ]
  }
 ]
