
# The sequence controller supports the WYSIWYG sequence editor.
angular.module('FarmBot').controller "SequenceController", [
  '$scope'
  'Command'
  ($scope, Command) ->
    # Stub for now. Maybe we can randomly set this in the
    # backend on creation or something.
    randomColor = ->
      colors =
        ['blue'
         'green'
         'yellow'
         'orange'
         'purple'
         'pink'
         'gray'
         'red']
      _.sample(colors)

    $scope.command =
      name: 'Untitled Sequence'
      color: randomColor()
      sequences: []

    $scope.dragControlListeners = {}
    $scope.storedSequences = [
      {name: 'Scare Away the Birds',
      color: randomColor(),
      sequences:[Command.create("move_rel"), Command.create("move_rel"), Command.create("move_abs")]}

      {name: 'Move Away For Maintenance',
      color: randomColor(),
      sequences:[Command.create("move_abs"), Command.create("move_rel"), Command.create("move_rel")]}
    ]

    $scope.copy = (obj, index) -> $scope.command.sequences.splice((index + 1), 0, angular.copy(obj))
    $scope.remove = (index) -> $scope.command.sequences.splice(index, 1)
    $scope.add = (name) -> $scope.command.sequences.push(Command.create(name))
    $scope.load = (seq) -> $scope.command = seq
    $scope.save = ->
      oldSeq = _.find($scope.storedSequences, {name: $scope.command.name})
      if oldSeq
        oldSeq = $scope.command
      else
        $scope.storedSequences.push($scope.command)
]
