import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { mapStateToProps, RawEditSceneObject } from "../edit";
import { EditSceneObjectProps } from "../interfaces";
import { Path } from "../../internal_urls";
import * as crud from "../../api/crud";
import { fakeState } from "../../__test_support__/fake_state";
import * as form from "../form";
import { buildResourceIndex } from "../../__test_support__/resource_index_builder";
import { fakeSceneObject } from "../../__test_support__/fake_state/resources";
import { Actions } from "../../constants";
import * as sceneObjectActions from "../actions";

describe("<RawEditSceneObject />", () => {
  const fakeProps = (resource = fakeSceneObject()): EditSceneObjectProps => ({
    dispatch: jest.fn(() => Promise.resolve()),
    focusedSceneObjectField: undefined,
    unifiedSceneObjectSize: undefined,
    findSceneObject: () => resource,
  });

  it("duplicates a scene object", () => {
    location.pathname = Path.mock(Path.sceneObjects(1));
    const resource = fakeSceneObject({ id: 1, name: "Pine tree" });
    const copySceneObject = jest.spyOn(sceneObjectActions, "copySceneObject")
      .mockImplementation(() => "copy action" as never);
    const p = fakeProps(resource);
    const { container } = render(<RawEditSceneObject {...p} />);

    fireEvent.click(container.querySelector(".fa-copy") as Element);

    expect(copySceneObject).toHaveBeenCalledWith(resource, mockNavigate);
    expect(p.dispatch).toHaveBeenCalledWith("copy action");
    copySceneObject.mockRestore();
  });

  it("deletes a scene object", async () => {
    location.pathname = Path.mock(Path.sceneObjects(1));
    const resource = fakeSceneObject();
    const destroy = jest.spyOn(crud, "destroy")
      .mockImplementation(() => "destroy action" as never);
    const p = fakeProps(resource);
    const { container } = render(<RawEditSceneObject {...p} />);

    fireEvent.click(container.querySelector(".fa-trash") as Element);

    expect(destroy).toHaveBeenCalledWith(resource.uuid);
    expect(p.dispatch).toHaveBeenCalledWith("destroy action");
    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith(Path.sceneObjects()));
    destroy.mockRestore();
  });

  it("redirects when the scene object is missing", () => {
    location.pathname = Path.mock(Path.sceneObjects(1));
    const p = fakeProps(undefined);
    p.findSceneObject = () => undefined;
    const { getByText } = render(<RawEditSceneObject {...p} />);

    expect(getByText("Redirecting...")).toBeTruthy();
    expect(mockNavigate).toHaveBeenCalledWith(Path.sceneObjects());
  });

  it("updates a scene object field", () => {
    location.pathname = Path.mock(Path.sceneObjects(1));
    const edit = jest.spyOn(crud, "edit")
      .mockImplementation(() => "edit action" as never);
    const save = jest.spyOn(crud, "save")
      .mockImplementation(() => "save action" as never);
    const resource = fakeSceneObject();
    const p = fakeProps(resource);
    const { container } = render(<RawEditSceneObject {...p} />);
    const input = container.querySelector("input[name='x_center']")!;

    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "123" } });
    fireEvent.blur(input, { target: { value: "123" } });

    expect(edit).toHaveBeenCalledWith(resource, { x_center: 123 });
    expect(save).toHaveBeenCalledWith(resource.uuid);
    expect(p.dispatch).toHaveBeenCalledWith("edit action");
    expect(p.dispatch).toHaveBeenCalledWith("save action");
    edit.mockRestore();
    save.mockRestore();
  });

  it("swaps X and Y sizes", () => {
    location.pathname = Path.mock(Path.sceneObjects(1));
    const edit = jest.spyOn(crud, "edit")
      .mockImplementation(() => "edit action" as never);
    const save = jest.spyOn(crud, "save")
      .mockImplementation(() => "save action" as never);
    const resource = fakeSceneObject({ x_size: 100, y_size: 200 });
    const p = fakeProps(resource);
    const { getByRole } = render(<RawEditSceneObject {...p} />);

    fireEvent.click(getByRole("button", { name: "Swap X & Y" }));

    expect(edit).toHaveBeenCalledWith(resource, {
      x_size: 200,
      y_size: 100,
    });
    expect(save).toHaveBeenCalledWith(resource.uuid);
    edit.mockRestore();
    save.mockRestore();
  });

  it("updates a scene object string field", () => {
    location.pathname = Path.mock(Path.sceneObjects(1));
    const edit = jest.spyOn(crud, "edit")
      .mockImplementation(() => "edit action" as never);
    const save = jest.spyOn(crud, "save")
      .mockImplementation(() => "save action" as never);
    const formSpy = jest.spyOn(form, "SceneObjectFormFields")
      .mockImplementation((props: React.ComponentProps<
        typeof form.SceneObjectFormFields
      >) =>
        <>
          <button
            data-testid={"update-shape"}
            onClick={() => props.onValueChange("shape", "sphere")} />
          <button
            data-testid={"focus-field"}
            onClick={() => props.onFocusChange?.("x_size")} />
          <button
            data-testid={"update-preserve-axes"}
            onClick={() => props.onValueChange("preserve_axes", true)} />
          <button
            data-testid={"enable-unified-size"}
            onClick={() => props.onUnifiedSizeChange?.(true)} />
          <button
            data-testid={"disable-unified-size"}
            onClick={() => props.onUnifiedSizeChange?.(false)} />
        </>);
    const resource = fakeSceneObject();
    const p = fakeProps(resource);
    const { getByTestId } = render(<RawEditSceneObject {...p} />);

    fireEvent.click(getByTestId("update-shape"));
    fireEvent.click(getByTestId("focus-field"));
    fireEvent.click(getByTestId("update-preserve-axes"));
    fireEvent.click(getByTestId("enable-unified-size"));
    fireEvent.click(getByTestId("disable-unified-size"));

    expect(edit).toHaveBeenCalledWith(resource, { shape: "sphere" });
    expect(edit).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenCalledWith(resource.uuid);
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_FOCUSED_SCENE_OBJECT_FIELD,
      payload: "x_size",
    });
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_UNIFIED_SCENE_OBJECT_SIZE,
      payload: resource.uuid,
    });
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_UNIFIED_SCENE_OBJECT_SIZE,
      payload: undefined,
    });
    formSpy.mockRestore();
    edit.mockRestore();
    save.mockRestore();
  });

  it("redirects when there isn't a scene object id in the path", () => {
    location.pathname = Path.mock(Path.sceneObjects());
    const p = fakeProps(undefined);
    p.findSceneObject = jest.fn();

    render(<RawEditSceneObject {...p} />);

    expect(p.findSceneObject).not.toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith(Path.sceneObjects());
  });
});

describe("mapStateToProps()", () => {
  it("returns props", () => {
    const resource = fakeSceneObject({ id: 1 });
    const state = fakeState();
    state.resources = buildResourceIndex([resource]);

    expect(mapStateToProps(state).findSceneObject(1)).toEqual(resource);
    expect(mapStateToProps(state).findSceneObject(2)).toEqual(undefined);
  });
});
