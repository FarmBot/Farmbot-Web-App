import * as React from "react";
import { FormField } from "../create_account";
import { shallow } from "enzyme";
import { BlurableInput } from "../../ui/index";

describe("<FormField/>", () => {
  it("renders correct props", () => {
    const onCommit = jest.fn(); // TODO: Why is this not triggering in enzyme?
    const el = shallow(<FormField
      onCommit={onCommit}
      value="my val"
      label="My Label"
      type="email" />);
    expect(el.find(BlurableInput).prop("value")).toEqual("my val");
    expect(el.find(BlurableInput).prop("type")).toEqual("email");
    expect(el.find("label").first().text()).toContain("My Label");
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
