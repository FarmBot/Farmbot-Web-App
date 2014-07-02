describe "MovementController", ->
  beforeEach ->
    module("FarmBot")
    inject ($controller) ->
      @scope = {}
      @ctrl = $controller("MovementController", $scope: scope)

  it "initializes X, Y and Z", ->
    expect(scope.x).toBe(0)
    expect(scope.y).toBe(0)
    expect(scope.z).toBe(0)
