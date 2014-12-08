# coffeescript uses YAML style syntax for object literals.
directive =
  # priority: 0
  template: '<div>Hello, world!</div>'
  # templateUrl: 'directive.html'
  # replace: false
  # transclude: false
  restrict: 'E'
  scope: false
  # controller: ($scope, $element, $attrs, $transclude, otherInjectables) -> ...
  # compile: (tElement, tAttrs, transclude) ->
  #   pre: (scope, iElement, iAttrs, controller) -> ...
  #   post: (scope, iElement, iAttrs, controller) -> ...
  # link: (scope, iElement, iAttrs) -> ...

angular.module("FarmBot").directive 'sequence-draggable', [() -> directive]
