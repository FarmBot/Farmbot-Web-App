import React from "react";
import { shallow } from "enzyme";
import { InputUnknown } from "../input_unknown";
import { LegalArgString } from "farmbot";
import { fakeSequence } from "../../../__test_support__/fake_state/resources";

describe("<InputUnknown/>", () => {
  it("is merely a fallback for bad keys", () => {
    const field = "Nope!" as LegalArgString;
    const el = shallow(<InputUnknown
      index={0}
      field={field}
      step={{ kind: "sync", args: {} }}
      sequence={fakeSequence()}
      dispatch={jest.fn()} />);
    const ph = el.find("input").prop("placeholder") || "EMPTY!";
    expect(ph).toContain("UNEXPECTED INPUT");
  });
});
