# A button used to set integers
directive =
  # priority: 0
  # templateUrl: 'directive.html'
  # replace: false
  # transclude: false
  template: '<button class="tiny"><i class="{{icon}}" style="color: #fff;"></i></button>'
  restrict: 'E'
  scope:
    direction: '='
    axis:      '='
    icon:      '='
  link: (scope, el, attr) ->
    el.on 'click', => scope.move(attr.axis, attr.direction)
  controller: ['$scope', 'Devices', ($scope, Devices) ->
    $scope.move = (axis, direction) ->
      if direction == 'up'
        direction = -1
      else
        direction = 1
      cmd =
        x: 0
        y: 0
        z: 0
      cmd[axis] = 100 * direction
      console.log cmd
      Devices.moveRel cmd.x, cmd.y, cmd.z, (d)->(d)

  ]
    # . . .
  # compile: (tElement, tAttrs, transclude) ->
  #   pre: (scope, iElement, iAttrs, controller) -> ...2
  #   post: (scope, iElement, iAttrs, controller) -> ...

angular.module("FarmBot").directive 'directionbutton', [() -> directive]
