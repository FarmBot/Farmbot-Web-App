controller = ($scope, Data) ->
  #TODO: We really really need an error handler / reporter at this point.
  #TODO: We need a way of creating a "new" sequence. If you load a sequence,
  # there is no way to clear out of it.
  Data
  .findAll('sequence', {})
  .catch (error) -> console.error error

  Data.bindAll($scope, 'storedSequences', 'sequence', {})
  $scope.add = (message_type) ->
    # TODO: Rename to addStep
    Data.create('step',
      message_type: message_type
      sequence_id: $scope.sequence._id
    ).then((step) -> $scope.sequence.steps.push(step))
    .catch((e) -> console.error e)
  $scope.load = (seq) ->
    Data.loadRelations('sequence', seq._id, ['step'])
    $scope.sequence = seq
  $scope.addSequence = (params = {}, makeItDefaultNow = yes) ->
    params.name ?= 'Untitled Sequence'
    Data
      .create('sequence', params)
      .then((seq) -> $scope.sequence = seq)
      .catch((e) -> console.error(e))
  $scope.save = ->
    oldSeq = _.find($scope.storedSequences, {name: $scope.sequence.name})
    if oldSeq
      oldSeq = $scope.sequence
    else
      $scope.storedSequences.push($scope.sequence)
  $scope.copy = (obj, index) ->
    debugger # Let's try:
    # Data.create('step', the_step_to_copy)
    $scope.sequence.steps.splice((index + 1), 0, angular.copy(obj))
  $scope.remove = (index) ->
    step = $scope.sequence.steps[index]
    Data.destroy('step', step._id).catch((e) -> console.error e)

# The sequence controller supports the WYSIWYG sequence editor.
angular.module('FarmBot').controller "SequenceController", [
  '$scope'
  'Data'
  controller
]
