import * as React from "react";
import { RegimenListItemProps } from "../../interfaces";
import { RegimenListItem } from "../regimen_list_item";
import { render } from "enzyme";
import { fakeRegimen } from "../../../__test_support__/fake_state/resources";

describe("<RegimenListItem/>", () => {
  it("renders the base case", () => {
    const props: RegimenListItemProps = {
      length: 1,
      regimen: fakeRegimen(),
      dispatch: jest.fn(),
      index: 0
    };
    const el = render(<RegimenListItem {...props} />);
    const html = el.html();
    expect(html).toContain(props.regimen.body.name);
    expect(html).toContain(props.regimen.body.color);
  });
});
