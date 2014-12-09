# A button used to set integers
directive =
  # priority: 0
  # templateUrl: 'directive.html'
  # replace: false
  # transclude: false
  template: '<i><button class="button tiny">Hello!</button></i>'
  restrict: 'E'
  scope: false
  # controller: ($scope, $element, $attrs, $transclude, otherInjectables) -> ...
  # compile: (tElement, tAttrs, transclude) ->
  #   pre: (scope, iElement, iAttrs, controller) -> ...
  #   post: (scope, iElement, iAttrs, controller) -> ...
  # link: (scope, iElement, iAttrs) -> ...

angular.module("FarmBot").directive 'integerbutton', [() -> directive]
