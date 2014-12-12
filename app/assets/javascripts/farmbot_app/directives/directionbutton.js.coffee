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
    $scope.goRel      = -> Devices.moveRel $scope.x, $scope.y, $scope.z, (d)->(d)
    $scope.zeroCoords = -> [$scope.x, $scope.y, $scope.z] = [0, 0, 0]
    $scope.move       = (axis, direction) ->
      console.log "Set #{axis} to #{direction}"
      $scope.zeroCoords()
      if direction == 'up'
        direction = -1
      else
        direction = 1
      $scope[axis] = 100 * direction
      $scope.goRel()

  ]
    # . . .
  # compile: (tElement, tAttrs, transclude) ->
  #   pre: (scope, iElement, iAttrs, controller) -> ...2
  #   post: (scope, iElement, iAttrs, controller) -> ...

angular.module("FarmBot").directive 'directionbutton', [() -> directive]
