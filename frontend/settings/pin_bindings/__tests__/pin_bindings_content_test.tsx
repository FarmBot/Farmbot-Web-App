import React from "react";
import { PinBindingsContent } from "../pin_bindings_content";
import { render } from "@testing-library/react";
import {
  buildResourceIndex,
} from "../../../__test_support__/resource_index_builder";
import {
  fakeSequence, fakePinBinding,
} from "../../../__test_support__/fake_state/resources";
import { PinBindingsContentProps } from "../interfaces";
import {
  SpecialPinBinding,
  PinBindingType,
  PinBindingSpecialAction,
} from "farmbot/dist/resources/api_resources";

describe("<PinBindingsContent/>", () => {
  function fakeProps(): PinBindingsContentProps {
    const fakeSequence1 = fakeSequence();
    fakeSequence1.body.id = 1;
    fakeSequence1.body.name = "Sequence 1";

    const fakeSequence2 = fakeSequence();
    fakeSequence2.body.id = 2;
    fakeSequence2.body.name = "Sequence 2";

    const fakePinBinding1 = fakePinBinding();
    fakePinBinding1.body =
      ({ pin_num: 10, sequence_id: 2, binding_type: PinBindingType.standard });
    const fakePinBinding2 = fakePinBinding();
    fakePinBinding2.body.id = 2;
    fakePinBinding2.body.pin_num = 26;
    fakePinBinding2.body.binding_type = PinBindingType.special;

    (fakePinBinding2.body as SpecialPinBinding).special_action =
      PinBindingSpecialAction.emergency_lock;
    const resources = buildResourceIndex([
      fakeSequence1, fakeSequence2, fakePinBinding1, fakePinBinding2,
    ]).index;
    return {
      dispatch: jest.fn(),
      resources: resources,
      firmwareHardware: undefined,
    };
  }

  it("renders", () => {
    const p = fakeProps();
    const { container } = render(<PinBindingsContent {...p} />);
    const text = (container.textContent || "").toLowerCase();
    ["stock bindings", "add new pin binding", "action", "sequence"]
      .map(string => expect(text).toContain(string));
    ["26", "button 3", "pi gpio 10"].map(string =>
      expect(text).toContain(string));
    const buttons = container.querySelectorAll("button");
    expect(buttons.length).toBeGreaterThanOrEqual(4);
  });
});
