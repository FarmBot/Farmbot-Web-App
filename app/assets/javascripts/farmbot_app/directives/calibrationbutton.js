var directive;

angular.module("FarmBot").directive('calibrationbutton', [

  function() {
    return {
      restrict: 'AEC',
      template: '<button class="red button-like" type="button">{{ label() }}</button>',
      scope: {
        toggleval: '@'
      },
      link: function($scope, el, attr) {
        el.on('click', function() {
          $scope.toggle();
        });
      },
      controller: [
        '$scope', 'Devices',
        function($scope, Devices) {
          $scope.label = function() {
            if (Devices[this.toggleval]) {
              return 'YES'
            } else {
              return 'NO'
            };
          };

          $scope.toggle = function() {
            debugger;
          };
        }
      ]
    };
  }
]);
