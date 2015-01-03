
# The sequence controller supports the WYSIWYG sequence editor.
angular.module('FarmBot').controller "SequenceController", [
  '$scope'
  'Command'
  ($scope, Command) ->
    $scope.commandList = []
    $scope.dragControlListeners = {}

    $scope.copy = (obj, index) -> $scope.commandList.splice((index + 1), 0, angular.copy(obj))
    $scope.remove = (index) -> $scope.commandList.splice(index, 1)
    $scope.add = (name) -> $scope.commandList.push(Command.create(name))
]
