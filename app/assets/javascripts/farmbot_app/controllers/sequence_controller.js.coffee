
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
    $scope.copy = (obj, index) ->
      obj2 = angular.copy(obj)
      $scope.commandList.splice((index + 1), 0, obj2)
    $scope.remove = (index) -> $scope.commandList.splice(index, 1)
]
