# A directive for setting the bot's stepSize
directive =
  restrict: 'A'
  link: (scope, el, attr) ->
    el.on 'click', =>
      $('.move-amount-selected').removeClass('move-amount-selected')
      el.addClass('move-amount-selected')
      scope.move parseInt(attr.stepsize)
  controller: ['$scope', 'Devices', ($scope, Devices) ->
    $scope.stepSize = Devices.stepSize
    $scope.move = (num) ->
      Devices.setStepSize(num)
      $scope.stepSize = Devices.stepSize
  ]

angular.module("FarmBot").directive 'stepsize', [() -> directive]
