class NullSequence
  _id: null
  steps: []

controller = ($scope, Data, Devices) ->
  $scope.sequence = new NullSequence
  #TODO: We really really need an error handler / reporter at this point.
  nope = (e) -> alert 'Doh!'; console.error e
  Data.findAll('sequence', {}).catch(nope)
  Data.bindAll 'sequence', {}, $scope, 'storedSequences'

  $scope.dragControlListeners =
    orderChanged: (event) ->
      position = event.dest.index
      step = event.source.itemScope.step
      Data
        .update('step', step._id, {position: position})
        .catch(nope)
        .then (step) -> $scope.load($scope.sequence)

  hasSequence = ->
    whoah = -> alert 'Select or create a sequence first.'
    if !!$scope.sequence._id then yes else do whoah; no

  $scope.addStep = (message_type) ->
    return unless hasSequence()
    Data.create('step',
      message_type: message_type
      sequence_id: $scope.sequence._id
    ).catch(nope)

  $scope.load = (seq) ->
    Data
      .loadRelations('sequence', seq._id, ['step'], bypassCache: true)
      .catch(nope)
      .then (sequence) -> $scope.sequence = sequence

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
      .then -> $scope.sequence = new NullSequence

  $scope.saveSequence = (seq) ->
    Data.save('sequence', seq._id).catch(nope).then (sequence) ->
      # TODO: This needs to be optimized to not update unchanged elements.
      # I'm having issues understanding JS-Data's way of dirty tracking atm.
      for step, inx in sequence.steps
        Data.update('step', step._id, {command: step.command}).catch (e) ->
          alert "Error saving step #{ inx + 1 }. See console for details."
          console.error e

  $scope.copy = (obj, index) ->
    return unless hasSequence()
    Data
      .create('step',
        sequence_id: $scope.sequence._id
        message_type: obj.message_type
        command: obj.command || {}
        position: index
      ).catch(nope)

  $scope.deleteStep = (index) ->
    Data
      .destroy('step', $scope.sequence.steps[index]._id)
      .catch(nope)

  $scope.execute = (seq) ->
    sequence = Data.utils.removeCircular(seq)
    Devices.send "exec_sequence", sequence


# The sequence controller supports the WYSIWYG sequence editor.
angular.module('FarmBot').controller "SequenceController", [
  '$scope'
  'Data'
  'Devices'
  controller
]
