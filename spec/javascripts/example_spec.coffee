#= require application
#= require angular/angular-mock

describe "Restauranteur controllers", ->
  beforeEach ->
    module("FarmBot")
    inject ($controller) ->
      @scope = {}
      @ctrl = $controller("MovementController", $scope: scope)

  describe "MovementController", ->
    it "initializes X, Y and Z", ->
      expect(scope.x).toBe(0)
      expect(scope.y).toBe(0)
      expect(scope.z).toBe(0)