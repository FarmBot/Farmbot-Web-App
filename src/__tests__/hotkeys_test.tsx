import * as React from "react";
import { HotKeys } from "../hotkeys";
import { render } from "enzyme";

describe("<HotKeys />", () => {

  it("renders", () => {
    let container = render(<HotKeys dispatch={jest.fn()} />);
    expect(container).toBeTruthy();
  });

});
