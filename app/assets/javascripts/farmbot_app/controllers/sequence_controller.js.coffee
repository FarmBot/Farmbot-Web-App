controller = ($scope, Data) ->
  # TODO figure out why ng-sortables breaks if passed a null value.
  $scope.sequenceSteps ?= []
  #TODO: We really really need an error handler / reporter at this point.
  nope = (e) -> alert 'Doh!'; console.error e
  Data.findAll('sequence', {}).catch(nope)
  Data.bindAll($scope, 'storedSequences', 'sequence', {})

  $scope.dragControlListeners =
    orderChanged: (event) ->
      position = event.dest.index
      step = event.source.itemScope.step
      # Failure to delete step.sequence results in a stack overflow :(
      # TODO Figure out why angular-data isn't doing this by default.
      # https://github.com/jmdobry/angular-data/issues/299
      delete step.sequence
      debugger
      Data
        .update('step', step._id, {position: position})
        .catch(nope)
        .then (step) -> $scope.load($scope.sequence)

  hasSequence = ->
    whoah = -> alert 'Select or create a sequence first.'
    if !!$scope.sequence then yes else do whoah; no

  $scope.addStep = (message_type) ->
    return unless hasSequence()
    Data.create('step',
      message_type: message_type
      sequence_id: $scope.sequence._id
    ).catch(nope)
    .then (step) ->
      $scope.sequence.steps.push(step)

  $scope.load = (seq) ->
    Data
      .loadRelations('sequence', seq._id, ['step'], bypassCache: true)
      .catch(nope)
      .then (sequence) ->
        $scope.sequence = sequence
        $scope.sequenceSteps = sequence.steps || []

  $scope.addSequence = (params = {}) ->
    params.name ?= 'Untitled Sequence'
    Data
      .create('sequence', params)
      .catch(nope)
      .then (seq) -> $scope.load(seq) # Load child resources of the new sequence

  $scope.deleteSequence = (seq) ->
    return unless hasSequence()
    Data
      .destroy('sequence', seq._id)
      .catch(nope)
      .then ->
        $scope.sequence = null
        $scope.sequenceSteps = []

  $scope.saveSequence = (seq) ->
    Data
      .save('sequence', seq._id)
      .catch(nope)
      .then((s) -> console.log(s))

  $scope.copy = (obj, index) ->
    return unless hasSequence()
    Data
      .create('step',
        sequence_id: $scope.sequence._id
        message_type: obj.message_type
        command: obj.command || {}
        position: index
      ).catch(nope) # Shouldnt angular-data auto-push new elements?
      .then (step) -> $scope.sequence.steps.push(step)

  $scope.deleteStep = (index) ->
    Data
      .destroy('step', $scope.sequence.steps[index]._id)
      .catch((e) -> console.error e)
      .then (s) -> null

# The sequence controller supports the WYSIWYG sequence editor.
angular.module('FarmBot').controller "SequenceController", [
  '$scope'
  'Data'
  controller
]
