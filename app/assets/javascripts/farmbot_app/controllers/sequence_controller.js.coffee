controller = ($scope, Data) ->
  #TODO: We really really need an error handler / reporter at this point.
  nope = (e) ->
    alert 'Doh!'
    console.error e
  #TODO: We need a way of creating a "new" sequence. If you load a sequence,
  # there is no way to clear out of it.
  Data
  .findAll('sequence', {})
  .catch(nope)

  $scope.dragControlListeners =
    accept: (sourceItemHandleScope, destSortableScope) -> true
    itemMoved: (event) -> debugger
    orderChanged: (event) -> debugger
  Data.bindAll($scope, 'storedSequences', 'sequence', {})
  hasSequence = ->
    if $scope.sequence
      return yes
    else
      alert 'Select or create a sequence first.'
      return no
  $scope.add = (message_type) ->
    # TODO: Rename to addStep
    return unless hasSequence()
    Data.create('step',
      message_type: message_type
      sequence_id: $scope.sequence._id
    ).then((step) -> $scope.sequence.steps.push(step))
    .catch(nope)
  $scope.load = (seq) ->
    Data.loadRelations('sequence', seq._id, ['step'])
    $scope.sequence = seq
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
      .then(() -> $scope.sequence = null)
      .catch(nope)
  $scope.saveSequence = (seq) ->
    Data
      .save('sequence', seq._id)
      .then((s) -> console.log(s))
      .catch(nope)
  $scope.copy = (obj, index) ->
    return unless hasSequence()
    yep  = (step) -> $scope.sequence.steps.splice((index + 1), 0, step)
    Data
      .create('step',
        sequence_id: $scope.sequence._id
        message_type: obj.message_type
        command: obj.command || {}
      ).then(yep)
      .catch(nope)
  $scope.remove = (index) ->
    step = $scope.sequence.steps[index]
    Data.destroy('step', step._id).catch((e) -> console.error e)

# The sequence controller supports the WYSIWYG sequence editor.
angular.module('FarmBot').controller "SequenceController", [
  '$scope'
  'Data'
  controller
]
