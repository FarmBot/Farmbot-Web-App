import { TileWritePeripheral } from "../tile_write_peripheral";
import { fakeSequence } from "../../../__test_support__/fake_state/resources";
import { SequenceBodyItem } from "farmbot";
import { shallow } from "enzyme";
import { StepParams } from "../../interfaces";
import { EMPTY_WRITE_PERIPHERAL, StepCheckBox } from "../pin_and_peripheral_support";
import { Actions } from "../../../constants";
import { FBSelect } from "../../../ui/index";
import { get } from "lodash";
import { defensiveClone } from "../../../util/index";
import { StepInputBox } from "../../inputs/step_input_box";

describe("<TileWritePeripheral/>", () => {
  function bootStrapTest(step: SequenceBodyItem = EMPTY_WRITE_PERIPHERAL) {
    const props: StepParams = {
      currentSequence: fakeSequence(),
      currentStep: step,
      dispatch: jest.fn(),
      index: 0,
      resources: {} as any,
    };
    return { props, el: shallow(TileWritePeripheral(props)) };
  }

  it("validates inputs", () => {
    const boom =
      () => bootStrapTest({ kind: "wait", args: { milliseconds: 0 } });
    expect(boom).toThrowError();
  });

  it("changes to `write_pin` when checkbox is clicked", () => {
    const { el, props } = bootStrapTest(EMPTY_WRITE_PERIPHERAL);
    el.find(StepCheckBox).first().simulate("click", { value: 1 });
    expect(props.dispatch).toHaveBeenCalled();
    const expectation =
      expect.objectContaining({ type: Actions.OVERWRITE_RESOURCE });
    expect(props.dispatch).toHaveBeenCalledWith(expectation);
  });

  it("sets the pin mode", () => {
    jest.resetAllMocks();
    const { el, props } = bootStrapTest(EMPTY_WRITE_PERIPHERAL);
    el.find(FBSelect).first().simulate("change", { value: 1 });
    const expectation =
      expect.objectContaining({ type: Actions.OVERWRITE_RESOURCE });
    expect(props.dispatch).toHaveBeenCalledWith(expectation);
    const path = "mock.calls[0][0].payload.update.body[0].args.pin_mode";
    const result = get(props.dispatch, path);
    expect(result).toEqual(0);
  });

  it("renders a `pin_value` field", () => {
    const step = defensiveClone(EMPTY_WRITE_PERIPHERAL);
    step.args.pin_value = 128;
    step.args.pin_mode = 1;
    const { el } = bootStrapTest(step);
    expect(el.find(StepInputBox).length).toBe(1);
  });
});
