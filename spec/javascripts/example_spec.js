//= require application
//= require angular/angular-mock
describe('FarmBot', function () {
  var scope, controller;

  beforeEach(function () {
    module('FarmBot');
    inject(function ($rootScope, $controller) {
        scope = $rootScope.$new();
        controller = $controller('OverviewController', {
            '$scope': scope
        });
    });
})

    it('does stuff', function () {
        expect(2 + 2).toBe(4);
    });
});