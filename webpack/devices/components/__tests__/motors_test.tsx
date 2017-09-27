import * as React from "react";
import { MotorsProps } from "../interfaces";
import { bot } from "../../../__test_support__/fake_state/bot";
import { Motors } from "../hardware_settings/motors";
import { render } from "enzyme";

describe("<Motors/>", () => {
  it("renders the base case", () => {
    const props: MotorsProps = { dispatch: jest.fn(), bot };
    const el = render(<Motors {...props} />);
    const txt = el.text();
    [ // Not a whole lot to test here....
      "Enable 2nd X Motor",
      "Max Retries",
      "E-Stop on Movement Error",
      "Max Speed (steps/s)"
    ].map(xpectd => expect(txt).toContain(xpectd));
  });
});
