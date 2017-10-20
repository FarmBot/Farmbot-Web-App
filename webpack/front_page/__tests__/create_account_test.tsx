import * as React from "react";

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
