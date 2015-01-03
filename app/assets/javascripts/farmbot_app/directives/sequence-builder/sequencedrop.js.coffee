class SequenceDrop
  constructor: (@$document) ->
  restrict: 'A'
  scope:
    some_setting: '='
  link: (scope, element, attr) =>
    element[0].addEventListener "drop", ((e) ->
      # Stops some browsers from redirecting.
      e.stopPropagation() if e.stopPropagation
      false
      ), false
    scope.drops = []

  controller: [
      '$scope'
      '$document'
      ($scope, $document) ->

    ]

angular.module("FarmBot").directive 'sequencedrop', [
  '$document'
  ($document) -> new SequenceDrop($document)
]
