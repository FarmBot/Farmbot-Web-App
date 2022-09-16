jest.mock("../../../../api/crud", () => ({ overwrite: jest.fn() }));

import {
  buildResourceIndex,
} from "../../../../__test_support__/resource_index_builder";
import { updateLhs, LhsUpdateProps } from "../update_lhs";
import { PinGroupName } from "../../pin_support";
import { cloneDeep } from "lodash";
import {
  fakeSequence, fakePeripheral,
} from "../../../../__test_support__/fake_state/resources";
import { overwrite } from "../../../../api/crud";

describe("updateLhs()", () => {
  const fakeProps = (): LhsUpdateProps => ({
    currentStep: {
      kind: "_if",
      args: {
        lhs: "pin0",
        op: "is",
        rhs: 0,
        _then: { kind: "nothing", args: {} },
        _else: { kind: "nothing", args: {} },
      }
    },
    currentSequence: fakeSequence(),
    dispatch: jest.fn(),
    index: 0,
    resources: buildResourceIndex([]).index,
  });

  it("handles peripherals", () => {
    const p = fakeProps();
    const peripheral = fakePeripheral();
    peripheral.body.id = 1;
    p.resources = buildResourceIndex([peripheral]).index;
    updateLhs(p)({
      value: peripheral.uuid,
      label: "Click me!",
      headingId: PinGroupName.Peripheral,
    });
    const expectedSequence = cloneDeep(p.currentSequence.body);
    p.currentStep.args.lhs = {
      kind: "named_pin", args: { pin_type: "Peripheral", pin_id: 1 },
    };
    expectedSequence.body = [p.currentStep];
    expect(overwrite).toHaveBeenCalledWith(p.currentSequence, expectedSequence);
  });

  it("handles pins", () => {
    const p = fakeProps();
    updateLhs(p)({
      value: "pin5",
      label: "Click me!",
      headingId: PinGroupName.Pin,
    });
    const expectedSequence = cloneDeep(p.currentSequence.body);
    p.currentStep.args.lhs = "pin5";
    expectedSequence.body = [p.currentStep];
    expect(overwrite).toHaveBeenCalledWith(p.currentSequence, expectedSequence);
  });

  it("handles positions", () => {
    const p = fakeProps();
    updateLhs(p)({
      value: "x",
      label: "Click me!",
      headingId: PinGroupName.Position,
    });
    const expectedSequence = cloneDeep(p.currentSequence.body);
    p.currentStep.args.lhs = "x";
    expectedSequence.body = [p.currentStep];
    expect(overwrite).toHaveBeenCalledWith(p.currentSequence, expectedSequence);
  });

  it("handles malformed data: bad heading id", () => {
    const p = fakeProps();
    const action = () => updateLhs(p)({
      value: "pin5",
      label: "Click me!",
      headingId: "Wrong",
    });
    expect(action).toThrow();
  });
});
