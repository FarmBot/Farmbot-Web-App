# A input box to read and set axis values on the bot. Used on manual control pag
ctrl = [
  '$scope',
  'Devices',
  ($scope, Devices) ->
    class Axis
      constructor: (@axis) ->
        [@dirty, @editing] = [no, no]
        @num = Devices.current[@axis]
      val: (v) -> if arguments.length then @set(v) else @get()
      set: (v) ->
        if _.isEmpty(v) then [@dirty, @num] = [no, ''] else @dirty = yes
        @num = num if _.isFinite(num = parseInt(v))
      get: -> if @dirty || @editing then @num else Devices.current[@axis]
      out: => @editing = no
      in: =>
        @editing = yes
        @num = '' if !@dirty

    $scope.buffer = new Axis($scope.axis)
]
directive =
  restrict: 'EA'
  template: '<input class="move-input" ng_blur="buffer.out()" ng_style="buffer.dirty ? {\'border-color\':\'red\'} : {}" ng_focus="buffer.in()" ng_model="buffer.val" ng_model_options="{ getterSetter: true }" type="text">'
  scope: {axis: '@'}
  link: ($scope, el, attr) -> $scope.axis = attr.axis
  controller: ctrl

angular.module("FarmBot").directive 'manualmovementinput', [() -> directive]
