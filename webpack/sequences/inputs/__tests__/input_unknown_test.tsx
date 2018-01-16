import * as React from "react";
import { shallow } from "enzyme";
import { InputUnknown } from "../input_unknown";
import { Wait } from "farmbot";
describe("<InputUnknown/>", () => {
  it("is merely a fallback for bad keys", () => {
    const field: any = "Nope!";
    const step: Wait = {
      kind: "wait",
      args: { milliseconds: 1 }
    };
    const el = shallow(<InputUnknown
      index={0}
      field={field}
      step={{} as any}
      sequence={{} as any}
      dispatch={jest.fn()} />);
    const ph = el.find("input").prop("placeholder") || "EMPTY!";
    expect(ph).toContain("UNEXPECTED INPUT");
  });
});
