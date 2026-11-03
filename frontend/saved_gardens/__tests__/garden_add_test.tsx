import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { RawAddGarden as AddGarden, mapStateToProps } from "../garden_add";
import { GardenSnapshotProps } from "../garden_snapshot";
import { fakeState } from "../../__test_support__/fake_state";
import {
  buildResourceIndex,
} from "../../__test_support__/resource_index_builder";
import { fakeSavedGarden } from "../../__test_support__/fake_state/resources";

import * as savedGardenActions from "../actions";

describe("<AddGarden />", () => {
  const fakeProps = (): GardenSnapshotProps => ({
    currentSavedGarden: undefined,
    plantTemplates: [],
    dispatch: jest.fn(),
  });

  it.each(["new", "snapshot", "copy"])(
    "uses the header name for %s and resets the form", action => {
      const p = fakeProps();
      if (action == "copy") { p.currentSavedGarden = fakeSavedGarden(); }
      const create = jest.spyOn(savedGardenActions, "newSavedGarden")
        .mockImplementation(jest.fn());
      const snapshot = jest.spyOn(savedGardenActions, "snapshotGarden")
        .mockImplementation(jest.fn());
      const copy = jest.spyOn(savedGardenActions, "copySavedGarden")
        .mockImplementation(jest.fn());
      const { container } = render(<AddGarden {...p} />);
      expect(container.querySelector(".panel-content input")).toBeNull();
      fireEvent.click(container.querySelector(".panel-header .title") as Element);
      const input = container.querySelector(".panel-header input") as Element;
      fireEvent.change(input, { target: { value: "My garden" } });
      fireEvent.blur(input);
      expect(container.querySelector(".panel-header .title"))
        .toHaveTextContent("My garden");
      fireEvent.change(container.querySelector("textarea") as Element,
        { target: { value: "My notes" } });
      const buttons = container.querySelectorAll(".add-new-garden-buttons button");
      fireEvent.click(buttons[action == "new" ? 1 : 0]);
      if (action == "copy") {
        expect(copy).toHaveBeenCalledWith(expect.objectContaining({
          newSGName: "My garden", savedGarden: p.currentSavedGarden,
        }));
      } else {
        const called = action == "new" ? create : snapshot;
        expect(called).toHaveBeenCalledWith(
          expect.any(Function), "My garden", "My notes");
      }
      expect(container.querySelector(".panel-header .title"))
        .toHaveTextContent("Untitled Garden");
      expect(container.querySelector("textarea")).toHaveValue("");
      create.mockRestore();
      snapshot.mockRestore();
      copy.mockRestore();
    });

  it("renders add garden panel", () => {
    const { container } = render(<AddGarden {...fakeProps()} />);
    expect(container.querySelector(".panel-header .title"))
      .toHaveTextContent("Untitled Garden");
    fireEvent.click(container.querySelector(".panel-header .title") as Element);
    expect(container.querySelector(".panel-header input"))
      .toHaveValue("Untitled Garden");
  });
});

describe("mapStateToProps()", () => {
  it("returns props", () => {
    const props = mapStateToProps(fakeState());
    expect(props.currentSavedGarden).toEqual(undefined);
  });

  it("finds saved garden", () => {
    const state = fakeState();
    const savedGarden = fakeSavedGarden();
    state.resources = buildResourceIndex([savedGarden]);
    state.resources.consumers.farm_designer.openedSavedGarden = savedGarden.body.id;
    const props = mapStateToProps(state);
    expect(props.currentSavedGarden).toEqual(savedGarden);
  });
});
