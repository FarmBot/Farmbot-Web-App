import * as React from "react";
import { FormField } from "../create_account";
import { shallow } from "enzyme";
import { BlurableInput } from "../../ui/index";

describe("<FormField/>", () => {
  fit("calls onCommit()", () => {
    const onCommit = jest.fn();
    const el = shallow(<FormField
      onCommit={onCommit}
      value="my val"
      label="My Label"
      type="email" />);
    el
      .find("BlurableInput")
      .first()
      .simulate("blur", { currentTarget: { value: "heyo" } });
    debugger;
    expect(onCommit).toHaveBeenCalledWith("heyo");
  });
});

describe("sendEmail()", () => {
  it("calls success() when things are OK");
  it("calls error() when things are not OK");
});

describe("<DidRegister/>", () => {
  it("renders <ResendPanelBody/>");
  it("bail()s on missing email"); // use shallow
});

describe("<CreateAccount/>", () => {
  it("renders <DidRegister/> when props.sent === true"); // Use shallow
});
