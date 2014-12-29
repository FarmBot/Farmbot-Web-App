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
    console.log $scope.commandList
]
