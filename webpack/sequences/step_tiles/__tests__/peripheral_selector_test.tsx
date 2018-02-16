
describe("PeripheralSelector", () => {
  const el = shallow(<TileReadPeripheral
    currentSequence={fakeSequence()}
    currentStep={step}
    dispatch={dispatch}
    index={0}
    resources={buildResourceIndex([p]).index} />);
  it("selects a peripheral", () => {
    expect(dispatch).toHaveBeenCalled();
    const action = expect.objectContaining({ "type": Actions.OVERWRITE_RESOURCE });
    expect(dispatch).toHaveBeenCalledWith(action);
    const kaboom =
      () => component.find(PeripheralSelector).simulate("change", { value: "NO" });
    expect(kaboom).toThrowError();
  });
});
