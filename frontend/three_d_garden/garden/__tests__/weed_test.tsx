import React from "react";
import { fireEvent, render } from "@testing-library/react";
import { Weed, WeedProps } from "../weed";
import { INITIAL } from "../../config";
import { clone } from "lodash";
import { fakeWeed } from "../../../__test_support__/fake_state/resources";
import { Path } from "../../../internal_urls";
import { Actions } from "../../../constants";
import { mockDispatch } from "../../../__test_support__/fake_dispatch";

describe("<Weed />", () => {
  const fakeProps = (): WeedProps => ({
    config: clone(INITIAL),
    weed: fakeWeed(),
    visible: true,
    getZ: () => 0,
  });

  it("renders", () => {
    const { container } = render(<Weed {...fakeProps()} />);
    expect(container).toContainHTML("weed");
  });

  it("navigates to weed info", () => {
    const p = fakeProps();
    const dispatch = jest.fn();
    p.dispatch = mockDispatch(dispatch);
    p.weed.body.id = 1;
    const { container } = render(<Weed {...p} />);
    const weed = container.querySelector("[name='weed-1'");
    weed && fireEvent.click(weed);
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.SET_PANEL_OPEN, payload: true,
    });
    expect(mockNavigate).toHaveBeenCalledWith(Path.weeds("1"));
  });

  it("doesn't navigate to weed info", () => {
    const p = fakeProps();
    p.dispatch = undefined;
    p.weed.body.id = 1;
    const { container } = render(<Weed {...p} />);
    const weed = container.querySelector("[name='weed'");
    weed && fireEvent.click(weed);
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
