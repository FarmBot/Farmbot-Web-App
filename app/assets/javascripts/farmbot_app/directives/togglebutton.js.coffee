# A button used to set integers
directive =
  template: '<button class="xx-small button radius red">OFF</button>'
  restrict: 'E'
  scope:
    toggleproperty: '='
  link: (scope, el, attr) ->
    el.on 'click', ->
      alert 'Ow!'
  controller: ['$scope', 'Devices', ($scope, Devices) ->
    $scope.toggle = ->
      console.log 'Oh haiii'
  ]

angular.module("FarmBot").directive 'togglebutton', [() -> directive]
