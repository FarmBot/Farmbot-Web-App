class DraggableSequence
  constructor: (@$document) ->
  restrict: 'A'
  scope:
    some_setting: '='
  link: (scope, element, attr) =>
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

angular.module("FarmBot").directive 'draggablesequence', [
  '$document'
  ($document) -> new DraggableSequence($document)
]
