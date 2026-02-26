import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { RawEditGarden as EditGarden, mapStateToProps } from "../garden_edit";
import { EditGardenProps } from "../interfaces";
import {
  fakePlantTemplate, fakeSavedGarden,
} from "../../__test_support__/fake_state/resources";
import { clickButton, changeBlurableInput } from "../../__test_support__/helpers";
import * as savedGardenActions from "../actions";
import { error } from "../../toast/toast";
import * as crud from "../../api/crud";
import { fakeState } from "../../__test_support__/fake_state";
import {
  buildResourceIndex,
} from "../../__test_support__/resource_index_builder";
import { Path } from "../../internal_urls";
import { times } from "lodash";

beforeEach(() => {
  jest.spyOn(savedGardenActions, "applyGarden")
    .mockImplementation(jest.fn());
  jest.spyOn(savedGardenActions, "destroySavedGarden")
    .mockImplementation(jest.fn());
  jest.spyOn(savedGardenActions, "openOrCloseGarden")
    .mockImplementation(jest.fn());
  jest.spyOn(savedGardenActions, "closeSavedGarden")
    .mockImplementation(jest.fn());
  jest.spyOn(crud, "edit").mockImplementation(jest.fn());
  jest.spyOn(crud, "save").mockImplementation(jest.fn());
});

describe("<EditGarden />", () => {
  const fakeProps = (): EditGardenProps => ({
    savedGarden: undefined,
    gardenIsOpen: false,
    dispatch: jest.fn(),
    plantPointerCount: 0,
    gardenPlants: [fakePlantTemplate()],
  });

  it("edits garden name", () => {
    const p = fakeProps();
    p.savedGarden = fakeSavedGarden();
    const { container } = render(<EditGarden {...p} />);
    changeBlurableInput(container, "new name");
    expect(crud.edit).toHaveBeenCalledWith(expect.any(Object), { name: "new name" });
  });

  it("edits garden notes", () => {
    const p = fakeProps();
    p.savedGarden = fakeSavedGarden();
    const { container } = render(<EditGarden {...p} />);
    fireEvent.change(container.querySelector("textarea") as Element,
      { currentTarget: { value: "notes" }, target: { value: "notes" } });
    fireEvent.blur(container.querySelector("textarea") as Element);
    expect(crud.edit).toHaveBeenCalledWith(expect.any(Object), { notes: "notes" });
  });

  it("applies garden", () => {
    const p = fakeProps();
    p.savedGarden = fakeSavedGarden();
    p.savedGarden.body.id = 1;
    p.plantPointerCount = 0;
    const { container } = render(<EditGarden {...p} />);
    clickButton(container, 0, "apply");
    expect(savedGardenActions.applyGarden)
      .toHaveBeenCalledWith(expect.any(Function), 1);
  });

  it("plants still in garden", () => {
    const p = fakeProps();
    p.savedGarden = fakeSavedGarden();
    p.plantPointerCount = 1;
    const { container } = render(<EditGarden {...p} />);
    clickButton(container, 0, "apply");
    expect(error).toHaveBeenCalledWith(expect.stringContaining(
      "Please clear current garden first"));
  });

  it("destroys garden", () => {
    const p = fakeProps();
    p.savedGarden = fakeSavedGarden();
    const { container } = render(<EditGarden {...p} />);
    fireEvent.click(container.querySelector(".fa-trash") as Element);
    expect(savedGardenActions.destroySavedGarden).toHaveBeenCalledWith(expect.any(Function),
      p.savedGarden.uuid);
  });

  it("shows garden not found", () => {
    location.pathname = Path.mock(Path.savedGardens("nope"));
    const { container } = render(<EditGarden {...fakeProps()} />);
    expect(container.textContent).toContain("not found");
    expect(mockNavigate).toHaveBeenCalledWith(Path.plants());
  });

  it("doesn't redirect", () => {
    location.pathname = Path.mock(Path.logs());
    const { container } = render(<EditGarden {...fakeProps()} />);
    expect(container.textContent).toContain("not found");
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("shows when garden is open", () => {
    const p = fakeProps();
    p.savedGarden = fakeSavedGarden();
    p.gardenIsOpen = true;
    const { container } = render(<EditGarden {...p} />);
    expect(container.textContent).toContain("exit");
  });

  it("renders with missing data", () => {
    const p = fakeProps();
    p.savedGarden = fakeSavedGarden();
    p.savedGarden.body.id = undefined;
    p.savedGarden.body.name = undefined;
    const { container } = render(<EditGarden {...p} />);
    expect(container.textContent?.toLowerCase()).toContain("edit garden");
  });

  it("expands", () => {
    const p = fakeProps();
    p.savedGarden = fakeSavedGarden();
    p.gardenPlants = times(100, fakePlantTemplate);
    const { container } = render(<EditGarden {...p} />);
    expect(container.querySelectorAll(".group-item-icon").length).toEqual(63);
    fireEvent.click(container.querySelector(".more-indicator") as Element);
    expect(container.querySelectorAll(".group-item-icon").length).toEqual(100);
  });
});

describe("mapStateToProps()", () => {
  it("returns props", () => {
    const sg = fakeSavedGarden();
    sg.body.id = 1;
    location.pathname = Path.mock(Path.savedGardens(1));
    const state = fakeState();
    state.resources = buildResourceIndex([sg, fakePlantTemplate()]);
    state.resources.consumers.farm_designer.openedSavedGarden = sg.body.id;
    const props = mapStateToProps(state);
    expect(props.gardenIsOpen).toEqual(true);
    expect(props.savedGarden).toEqual(sg);
  });

  it("doesn't find saved garden", () => {
    const sg = fakeSavedGarden();
    sg.body.id = 1;
    location.pathname = Path.mock(Path.savedGardens());
    const state = fakeState();
    state.resources = buildResourceIndex([sg, fakePlantTemplate()]);
    state.resources.consumers.farm_designer.openedSavedGarden = sg.body.id;
    const props = mapStateToProps(state);
    expect(props.gardenIsOpen).toEqual(false);
    expect(props.savedGarden).toEqual(undefined);
  });
});
