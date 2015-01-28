controller = ($scope, Data) ->
  #TODO: We really really need an error handler / reporter at this point.
  nope = (e) ->
    alert 'Doh!'
    console.error e

  Data
  .findAll('sequence', {})
  .catch(nope)

  # TODO figure out why ng-sortables breaks if passed a null value.
  $scope.sequenceSteps ?= []
  $scope.dragControlListeners = orderChanged: (event) ->
    console.log 'DING'
    position = event.dest.index
    step = event.source.itemScope.modelValue
    # TODO I want to do $scope.reposition(step.sequence) but cant until I resolve
    # the stack overflow issue.
    yep = (step) -> $scope.reposition($scope.sequenceSteps)
    # Failure to delete step.sequence results in a stack overflow :(
    # TODO Figure out why angular-data isn't doing this by default.
    # https://github.com/jmdobry/angular-data/issues/299
    delete step.sequence
    Data
      .update('step', step._id, {position: position})
      .then(yep)
      .catch(nope)
  Data.bindAll($scope, 'storedSequences', 'sequence', {})

  hasSequence = ->
    whoah = -> alert 'Select or create a sequence first.'
    if !!$scope.sequence then yes else do whoah; no
  $scope.addStep = (message_type) ->
    return unless hasSequence()
    Data.create('step',
      message_type: message_type
      sequence_id: $scope.sequence._id
    ).catch(nope)
    .then (step) -> $scope.sequence.steps.push(step)
  $scope.load = (seq) ->
    Data
      .loadRelations('sequence', seq._id, ['step'])
      .catch(nope)
      .then ->
        $scope.sequence = seq
        $scope.sequenceSteps = $scope.sequence.steps
  $scope.reposition = (list) ->
    # You're my best friend, LoDash. I love you. <3
    sorted = _.sortBy(list, ['position', 'updated_at'])
    _.each list, (val, index) ->
      val.position = index
  $scope.addSequence = (params = {}, makeItDefaultNow = yes) ->
    params.name ?= 'Untitled Sequence'
    Data
      .create('sequence', params)
      .then((seq) -> $scope.load(seq)) # Load child resources of the new seqnce
      .catch(nope)
  $scope.deleteSequence = (seq) ->
    return unless hasSequence()
    Data
      .destroy('sequence', seq._id)
      .then(->
        $scope.sequence = null
        $scope.sequenceSteps = [])
      .catch(nope)
  $scope.saveSequence = (seq) ->
    Data
      .save('sequence', seq._id)
      .then((s) -> console.log(s))
      .catch(nope)
  $scope.copy = (obj, index) ->
    return unless hasSequence()
    yep = (step) -> $scope.sequence.steps.push(step)
    Data
      .create('step',
        sequence_id: $scope.sequence._id
        message_type: obj.message_type
        command: obj.command || {}
        position: index + 1
      ).then(yep)
      .catch(nope)
  $scope.remove = (index) ->
    # TODO Rename to deleteStep
    step = $scope.sequence.steps[index]
    Data.destroy('step', step._id).catch((e) -> console.error e)

# The sequence controller supports the WYSIWYG sequence editor.
angular.module('FarmBot').controller "SequenceController", [
  '$scope'
  'Data'
  controller
]
