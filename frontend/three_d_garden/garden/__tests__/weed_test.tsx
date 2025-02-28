import React from "react";
import { fireEvent, render } from "@testing-library/react";
import { Weed, WeedProps } from "../weed";
import { INITIAL } from "../../config";
import { clone } from "lodash";
import { fakeWeed } from "../../../__test_support__/fake_state/resources";
import { Path } from "../../../internal_urls";

describe("<Weed />", () => {
  const fakeProps = (): WeedProps => ({
    config: clone(INITIAL),
    weed: fakeWeed(),
  });

  it("renders", () => {
    const { container } = render(<Weed {...fakeProps()} />);
    expect(container).toContainHTML("weed");
  });

  it("navigates to weed info", () => {
    const p = fakeProps();
    p.weed.body.id = 1;
    const { container } = render(<Weed {...p} />);
    const weed = container.querySelector("[name='weed'");
    weed && fireEvent.click(weed);
    expect(mockNavigate).toHaveBeenCalledWith(Path.weeds("1"));
  });
});
