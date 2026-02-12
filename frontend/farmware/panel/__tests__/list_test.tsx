import React from "react";
import { fireEvent, render } from "@testing-library/react";
import {
  RawDesignerFarmwareList as DesignerFarmwareList,
  DesignerFarmwareListProps,
  mapStateToProps,
  FarmwareListItem,
  FarmwareListItemProps,
} from "../list";
import {
  fakeFarmware,
} from "../../../__test_support__/fake_farmwares";
import { fakeState } from "../../../__test_support__/fake_state";
import {
  fakeFarmwareInstallation,
} from "../../../__test_support__/fake_state/resources";
import {
  buildResourceIndex,
} from "../../../__test_support__/resource_index_builder";
import { Actions } from "../../../constants";

describe("<DesignerFarmwareList />", () => {
  const fakeProps = (): DesignerFarmwareListProps => ({
    dispatch: jest.fn(),
    currentFarmware: undefined,
    farmwares: {},
    firstPartyFarmwareNames: ["x"],
  });

  it("renders empty farmware list panel", () => {
    const { container } = render(<DesignerFarmwareList {...fakeProps()} />);
    ["no farmware yet", "add a farmware"].map(string =>
      expect(container.textContent?.toLowerCase()).toContain(string));
  });

  it("renders farmware list panel", () => {
    const p = fakeProps();
    p.farmwares = { x: fakeFarmware("x"), y: fakeFarmware("y") };
    const { container } = render(<DesignerFarmwareList {...p} />);
    expect(container.textContent?.toLowerCase()).toContain("y");
    expect(container.textContent?.toLowerCase()).not.toContain("x");
  });

  it("changes search term", () => {
    const p = fakeProps();
    p.farmwares = { "my farmware": fakeFarmware("my farmware") };
    const { container } = render(<DesignerFarmwareList {...p} />);
    const input = container.querySelector("input") as HTMLInputElement;
    expect(input.value).toEqual("");
    fireEvent.change(input, {
      target: { value: "my farmware" },
      currentTarget: { value: "my farmware" },
    });
    expect((container.querySelector("input") as HTMLInputElement).value)
      .toEqual("my farmware");
  });
});

describe("mapStateToProps()", () => {
  it("returns props", () => {
    const state = fakeState();
    const farmware = fakeFarmwareInstallation();
    farmware.body.package = "fake farmware";
    farmware.body.id = 1;
    state.resources = buildResourceIndex([farmware]);
    const props = mapStateToProps(state);
    expect(props.farmwares).toEqual({
      "fake farmware (pending install...)": expect.any(Object)
    });
  });
});

describe("<FarmwareListItem />", () => {
  const fakeProps = (): FarmwareListItemProps => ({
    dispatch: jest.fn(),
    farmwareName: "My Farmware",
  });

  it("renders list item", () => {
    const { container } = render(<FarmwareListItem {...fakeProps()} />);
    expect(container.textContent).toContain("My Farmware");
  });

  it("navigates", () => {
    const p = fakeProps();
    const { container } = render(<FarmwareListItem {...p} />);
    fireEvent.click(container.querySelector("a") as Element);
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SELECT_FARMWARE,
      payload: "My Farmware"
    });
  });
});
