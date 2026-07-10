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
import { TaggedResource } from "farmbot";
import { Actions } from "../../constants";

describe("<RawEditSceneObject />", () => {
  const fakeProps = (resource = fakeSceneObject()): EditSceneObjectProps => ({
    dispatch: jest.fn(() => Promise.resolve()),
    focusedSceneObjectField: undefined,
    unifiedSceneObjectSize: undefined,
    findSceneObject: () => resource,
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
        </>);
    const resource = fakeSceneObject();
    const p = fakeProps(resource);
    const { getByTestId } = render(<RawEditSceneObject {...p} />);

    fireEvent.click(getByTestId("update-shape"));
    fireEvent.click(getByTestId("focus-field"));

    expect(edit).toHaveBeenCalledWith(resource, { shape: "sphere" });
    expect(save).toHaveBeenCalledWith(resource.uuid);
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_FOCUSED_SCENE_OBJECT_FIELD,
      payload: "x_size",
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
    state.resources = buildResourceIndex([resource as TaggedResource]);

    expect(mapStateToProps(state).findSceneObject(1)).toEqual(resource);
    expect(mapStateToProps(state).findSceneObject(2)).toEqual(undefined);
  });
});
