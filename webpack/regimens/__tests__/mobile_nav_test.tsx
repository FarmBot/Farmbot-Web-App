jest.mock("../../history", () => ({
  history: {
    getCurrentLocation() {
      return {
        pathname: "x/foo/bar/baz"
      };
    }
  }
}));

import * as React from "react";
import { render } from "enzyme";
import { MobileRegimensNav } from "../mobile_nav";

describe("<MobileRegimensNav/>", () => {
  it("renders default values", () => {
    const el = render(<MobileRegimensNav />);
    expect(el.text()).toContain("Baz");
  });
});
