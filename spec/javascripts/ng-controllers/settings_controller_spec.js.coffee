describe "DevicesController", ->
  beforeEach ->
    module("FarmBot")
    inject ($controller) ->
      @scope = {}
      @ctrl = $controller("DevicesController", $scope: @scope)

  it "initializes an empty default device", ->
    expect(scope.device).toEqual({})

  it "has a list of user created devices", ->
  	expect(scope.devices).toBeDefined()
