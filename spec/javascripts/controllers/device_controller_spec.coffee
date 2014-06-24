#= require application
#= require angular/angular-mock
#= require spec_helper

describe "OverviewController", ->
  scope = undefined
  controller = undefined

  beforeEach ->
    module("FarmBot")

  describe "MyCtrl", ->
    beforeEach inject(($rootScope, $controller) ->
      scope = $rootScope.$new()
      controller = $controller("OverviewController", $scope: scope)
    )

    it "is a test", ->
      # expect(scope.test).toBe true
