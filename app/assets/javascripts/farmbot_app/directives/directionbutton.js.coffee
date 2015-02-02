# A button used to set integers
directive =
  template: '<i></i>'
  restrict: 'E'
  scope:
    direction: '='
    axis:      '='
    icon:      '='
  link: (scope, el, attr) ->
    classes =
      x:
        up:   'fa fa-2x fa-arrow-circle-left'
        down: 'fa fa-2x fa-arrow-circle-right'
      y:
        up:   'fa fa-2x fa-arrow-circle-up'
        down: 'fa fa-2x fa-arrow-circle-down'
      z:
        up:   'fa fa-2x fa-arrow-circle-up'
        down: 'fa fa-2x fa-arrow-circle-down'
    try
      el.addClass(classes[attr.axis][attr.direction])
    catch e
      el.addClass(classes.x.up)
      console.warn 'Malformed <directionbutton> params. Using default.'

    el.on 'click', =>
      scope.move attr.axis, (attr.direction == 'up') ? -1 : 1
  controller: ['$scope', 'Devices', ($scope, Devices) ->
    $scope.move = (axis, direction) ->
      cmd = {x: 0, y: 0, z: 0}
      # TODO un-hardcode the 'multiplier'
      cmd[axis] = 100 * direction
      Devices.moveRel cmd.x, cmd.y, cmd.z, (d) -> (d)
  ]
    # . . .
  # compile: (tElement, tAttrs, transclude) ->
  #   pre: (scope, iElement, iAttrs, controller) -> ...2
  #   post: (scope, iElement, iAttrs, controller) -> ...

angular.module("FarmBot").directive 'directionbutton', [() -> directive]
