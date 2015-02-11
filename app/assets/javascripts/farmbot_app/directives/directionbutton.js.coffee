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
        up:   'fa fa-2x fa-arrow-left arrow-button radius'
        down: 'fa fa-2x fa-arrow-right arrow-button radius'
      y:
        up:   'fa fa-2x fa-arrow-up arrow-button radius'
        down: 'fa fa-2x fa-arrow-down arrow-button radius'
      z:
        up:   'fa fa-2x fa-arrow-up arrow-button radius'
        down: 'fa fa-2x fa-arrow-down arrow-button radius'
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
