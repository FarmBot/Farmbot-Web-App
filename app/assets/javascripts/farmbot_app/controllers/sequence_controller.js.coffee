
# The sequence controller supports the WYSIWYG sequence editor.
angular.module('FarmBot').controller "SequenceController", [
  '$scope'
  ($scope) ->
    # TODO: Put the message_type in caps.
    $scope.commandList = [
      {message_type: 'move_rel'}
      {message_type: 'write_pin'}
      {message_type: 'move_abs'}
    ]
    $scope.dragControlListeners = {}
      # accept: (sourceItemHandleScope, destSortableScope) -> debugger
      # itemMoved: (event) -> debugger
      # orderChanged: (event) -> debugger
]
