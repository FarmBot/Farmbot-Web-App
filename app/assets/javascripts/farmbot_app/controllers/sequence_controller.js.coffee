# The sequence controller supports the WYSIWYG sequence editor.
angular.module('FarmBot').controller "SequenceController", [
  '$scope'
  'Command'
  'Sequences'
  ($scope, Command, Sequences) ->
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

    Sequences
    .findAll({})
    .then((sequences) -> console.log sequences)
    .catch((error) ->
      alert "There was a problem. See console for details."
      console.log error)
    .finally(-> null)
    window.qqq = Sequences
    $scope.command =
      name: 'Untitled Sequence'
      color: randomColor()
      steps: []

    $scope.dragControlListeners = {}
    $scope.storedSequences = [
      {name: 'Scare Away the Birds',
      color: randomColor(),
      steps:[Command.create("move_rel"), Command.create("move_rel"), Command.create("move_abs")]}

      {name: 'Move Away For Maintenance',
      color: randomColor(),
      steps:[Command.create("move_abs"), Command.create("move_rel"), Command.create("move_rel")]}
    ]
    Sequences.bindAll($scope, 'storedSequences', {})
    $scope.copy = (obj, index) -> $scope.command.steps.splice((index + 1), 0, angular.copy(obj))
    $scope.remove = (index) -> $scope.command.steps.splice(index, 1)
    $scope.add = (name) -> $scope.command.steps.push(Command.create(name))
    $scope.load = (seq) ->
      Sequences.loadRelations(seq._id, ['step'])
      $scope.command = seq
    $scope.save = ->
      oldSeq = _.find($scope.storedSequences, {name: $scope.command.name})
      if oldSeq
        oldSeq = $scope.command
      else
        $scope.storedSequences.push($scope.command)
]
