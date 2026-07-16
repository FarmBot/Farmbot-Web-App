import React from "react";
import { fireEvent, render } from "@testing-library/react";
import {
  DEFAULT_SCENE_OBJECT, mapStateToProps, RawAddSceneObject,
} from "../add";
import { AddSceneObjectProps } from "../interfaces";
import * as crud from "../../api/crud";
import { Actions } from "../../constants";
import { fakeState } from "../../__test_support__/fake_state";
import { fakeSceneObject } from "../../__test_support__/fake_state/resources";
import { SpecialStatus } from "farmbot";

describe("<RawAddSceneObject />", () => {
  const fakeProps = (): AddSceneObjectProps => ({
    dispatch: jest.fn(),
    sceneObjects: [],
    drawnSceneObject: fakeSceneObject().body,
    focusedSceneObjectField: undefined,
  });

  it("saves the drawn scene object state", () => {
    const initSave = jest.spyOn(crud, "initSave")
      .mockImplementation(() => "init save action" as never);
    const p = fakeProps();
    const expectedBody = p.drawnSceneObject!;
    p.drawnSceneObject = {
      ...expectedBody,
      preserve_axes: ["x", "z"],
    };
    const { container } = render(<RawAddSceneObject {...p} />);

    fireEvent.click(container.querySelector(".save-btn") as Element);

    expect(initSave).toHaveBeenCalledWith("SceneObject", expectedBody);
    expect(p.dispatch).toHaveBeenCalledWith("init save action");
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_DRAWN_SCENE_OBJECT_DATA,
      payload: undefined,
    });
    initSave.mockRestore();
  });

  it("updates the drawn scene object state", () => {
    const p = fakeProps();
    const { container } = render(<RawAddSceneObject {...p} />);
    const input = container.querySelector("input[name='sceneObjectName']")!;

    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "Updated object" } });
    expect(p.dispatch).not.toHaveBeenCalled();
    fireEvent.blur(input, { target: { value: "Updated object" } });

    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_DRAWN_SCENE_OBJECT_DATA,
      payload: { ...p.drawnSceneObject, name: "Updated object" },
    });
  });

  it("updates preserved placement axes", () => {
    const p = fakeProps();
    const { getByLabelText, queryByLabelText } = render(
      <RawAddSceneObject {...p} />);

    expect(queryByLabelText("Cube")).not.toBeInTheDocument();
    fireEvent.click(getByLabelText("Fixed X"));

    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_DRAWN_SCENE_OBJECT_DATA,
      payload: { ...p.drawnSceneObject, preserve_axes: ["x"] },
    });
  });

  it("swaps sizes and preserved axes together", () => {
    const p = fakeProps();
    p.drawnSceneObject = {
      ...p.drawnSceneObject!,
      x_size: 100,
      y_size: 200,
      preserve_axes: ["x", "z"],
    };
    const { getByRole } = render(<RawAddSceneObject {...p} />);

    fireEvent.click(getByRole("button", { name: "Swap X & Y" }));

    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_DRAWN_SCENE_OBJECT_DATA,
      payload: {
        ...p.drawnSceneObject,
        x_size: 200,
        y_size: 100,
        preserve_axes: ["y", "z"],
      },
    });
  });

  it("updates focused scene object field state", () => {
    const p = fakeProps();
    const { container } = render(<RawAddSceneObject {...p} />);
    const input = container.querySelector("input[name='x_size']")!;

    fireEvent.focus(input);
    fireEvent.blur(input);

    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_FOCUSED_SCENE_OBJECT_FIELD,
      payload: "x_size",
    });
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_FOCUSED_SCENE_OBJECT_FIELD,
      payload: undefined,
    });
  });

  it("returns focused scene object field state", () => {
    const state = fakeState();
    state.resources.consumers.farm_designer.focusedSceneObjectField = "x_size";

    expect(mapStateToProps(state).focusedSceneObjectField).toEqual("x_size");
  });

  it("initializes and clears drawn scene object state", () => {
    const p = fakeProps();
    p.drawnSceneObject = undefined;
    const { unmount } = render(<RawAddSceneObject {...p} />);

    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_DRAWN_SCENE_OBJECT_DATA,
      payload: DEFAULT_SCENE_OBJECT,
    });

    unmount();

    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_DRAWN_SCENE_OBJECT_DATA,
      payload: undefined,
    });
  });

  it("doesn't save without a drawn scene object", () => {
    const initSave = jest.spyOn(crud, "initSave")
      .mockImplementation(() => "init save action" as never);
    const p = fakeProps();
    p.drawnSceneObject = undefined;
    const { container } = render(<RawAddSceneObject {...p} />);

    fireEvent.click(container.querySelector(".save-btn") as Element);

    expect(initSave).not.toHaveBeenCalled();
    initSave.mockRestore();
  });

  it("discards failed scene objects when going back", () => {
    const destroy = jest.spyOn(crud, "destroy")
      .mockImplementation(uuid => `destroy ${uuid}` as never);
    const p = fakeProps();
    const { container, rerender } = render(<RawAddSceneObject {...p} />);
    const failedSceneObject = fakeSceneObject();
    failedSceneObject.body.id = undefined;
    failedSceneObject.specialStatus = SpecialStatus.DIRTY;
    p.sceneObjects = [failedSceneObject];
    rerender(<RawAddSceneObject {...p} />);

    fireEvent.click(container.querySelector(".back-arrow") as Element);

    expect(destroy).toHaveBeenCalledWith(failedSceneObject.uuid, true);
    expect(p.dispatch).toHaveBeenCalledWith(
      `destroy ${failedSceneObject.uuid}`,
    );
    destroy.mockRestore();
  });
});

describe("mapStateToProps()", () => {
  it("returns props", () => {
    expect(mapStateToProps(fakeState()).drawnSceneObject).toEqual(undefined);
  });
});
