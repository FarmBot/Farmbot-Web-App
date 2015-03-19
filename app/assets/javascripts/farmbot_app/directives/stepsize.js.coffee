# A directive for setting the bot's stepSize
directive =
  restrict: 'A'
  link: ($scope, el, attr) ->
    if $scope.stepSizeIs(parseInt(attr.stepsize))
      el.addClass('move-amount-selected')

    el.on 'click', =>
      $('.move-amount-selected').removeClass('move-amount-selected')
      el.addClass('move-amount-selected')
      $scope.setStepSize(parseInt(attr.stepsize))


  controller: ['$scope', 'Devices', ($scope, Devices) ->
    $scope.stepSizeIs = (num) -> Devices.stepSize is num
    $scope.setStepSize = (num) -> Devices.stepSize = num
  ]

angular.module("FarmBot").directive 'stepsize', [-> directive]
