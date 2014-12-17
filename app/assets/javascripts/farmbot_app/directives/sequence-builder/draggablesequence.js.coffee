class DraggableSequence
  constructor: (@$document) ->
  # template: ''
  restrict: 'A'
  scope:
    some_setting: '='
  link: (scope, element, attr) =>
    # TODO: Use `draggable` property?
    # https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Drag_operations
    [startX, startY, x, y] = [0, 0, 0, 0]

    mousemove = (event) ->
      y = event.pageY - startY
      x = event.pageX - startX
      element.css
        top: y + "px"
        left: x + "px"

    mouseup = =>
      @$document.off "mousemove", mousemove
      @$document.off "mouseup", mouseup

    element.css
      position: "relative"

    element.on "mousedown", (event) =>
      event.preventDefault()
      startX = event.pageX - x
      startY = event.pageY - y
      @$document.on "mousemove", mousemove
      @$document.on "mouseup", mouseup

  controller: [
      '$scope'
      '$document'
      ($scope, $document) ->
    ]
    # . . .
  # compile: (tElement, tAttrs, transclude) ->
  #   pre: (scope, iElement, iAttrs, controller) -> ...2
  #   post: (scope, iElement, iAttrs, controller) -> ...

angular.module("FarmBot").directive 'draggablesequence', [
  '$document'
  ($document) -> new DraggableSequence($document)
]
