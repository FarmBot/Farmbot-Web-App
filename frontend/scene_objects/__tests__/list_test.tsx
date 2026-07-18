import React from "react";
import { act, fireEvent, render } from "@testing-library/react";
import { mapStateToProps, RawSceneObjects } from "../list";
import { SceneObjectsProps } from "../interfaces";
import { Actions } from "../../constants";
import { Path } from "../../internal_urls";
import * as crud from "../../api/crud";
import * as ui from "../../ui";
import type { FBSelectProps } from "../../ui";
import * as plantInventory from "../../plants/plant_inventory";
import {
  fakeFarmwareEnv, fakeSceneObject,
} from "../../__test_support__/fake_state/resources";
import { fakeState } from "../../__test_support__/fake_state";
import { buildResourceIndex } from "../../__test_support__/resource_index_builder";

describe("<RawSceneObjects />", () => {
  const fakeProps = (): SceneObjectsProps => ({
    dispatch: jest.fn(),
    sceneObjects: [fakeSceneObject()],
    farmwareEnvs: [],
  });

  it("sets hovered scene object", () => {
    const p = fakeProps();
    const { getByText } = render(<RawSceneObjects {...p} />);
    const item = getByText("Scene Object 1")
      .closest(".scene-object-search-item");

    fireEvent.mouseEnter(item as Element);
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.HOVER_SCENE_OBJECT,
      payload: p.sceneObjects[0].uuid,
    });

    fireEvent.mouseLeave(item as Element);
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.HOVER_SCENE_OBJECT,
      payload: undefined,
    });
  });

  it("doesn't toggle the section when clicking the scene dropdown", () => {
    const p = fakeProps();
    const { container } = render(<RawSceneObjects {...p} />);

    expect(container.querySelector(".panel-section")).not.toHaveClass("open");
    fireEvent.click(container.querySelector(
      ".section-header div[style='width: 10rem;']",
    ) as Element);

    expect(container.querySelector(".panel-section")).not.toHaveClass("open");
  });

  it("navigates to my scene object", () => {
    const p = fakeProps();
    const sceneObject = fakeSceneObject();
    sceneObject.body.id = 1;
    p.sceneObjects = [sceneObject];
    const { getByText } = render(<RawSceneObjects {...p} />);
    const item = getByText("Scene Object 1")
      .closest(".scene-object-search-item");

    fireEvent.click(item as Element);

    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.HOVER_SCENE_OBJECT,
      payload: undefined,
    });
    expect(mockNavigate).toHaveBeenCalledWith(Path.sceneObjects(1));
  });

  it("toggles visibility for a scene object", () => {
    const p = fakeProps();
    const sceneObject = p.sceneObjects[0];
    sceneObject.body.show = true;
    const { container } = render(<RawSceneObjects {...p} />);
    const item = container.querySelector(".scene-object-search-item")!;
    const eye = item.querySelector(".fa-eye")!;

    fireEvent.click(eye);

    expect(p.dispatch).toHaveBeenCalledWith(expect.objectContaining({
      type: Actions.EDIT_RESOURCE,
      payload: expect.objectContaining({
        uuid: sceneObject.uuid,
        update: { show: false },
      }),
    }));
    expect(p.dispatch).toHaveBeenCalledWith(expect.any(Function));
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("navigates to add a scene object", () => {
    const p = fakeProps();
    const { container } = render(<RawSceneObjects {...p} />);

    fireEvent.click(container.querySelector(".plus-scene-object") as Element);

    expect(mockNavigate).toHaveBeenCalledWith(Path.sceneObjects("catalog"));
  });

  it("toggles inventory sections", () => {
    const p = fakeProps();
    const { getByText } = render(<RawSceneObjects {...p} />);

    fireEvent.click(getByText(/Featured Scene Objects/));

    expect(getByText("Import selected")).toBeTruthy();
    expect(p.dispatch).toHaveBeenLastCalledWith({
      type: Actions.SET_FEATURED_SCENE,
      payload: "Outdoor",
    });

    fireEvent.click(getByText(/Featured Scene Objects/));
    expect(p.dispatch).toHaveBeenLastCalledWith({
      type: Actions.SET_FEATURED_SCENE,
      payload: undefined,
    });
  });

  it("toggles the my scene objects section", () => {
    const panelSection = jest.spyOn(plantInventory, "PanelSection")
      .mockImplementation(props =>
        <button
          data-testid={`toggle-${props.title}`}
          onClick={props.toggleOpen} />);
    const p = fakeProps();
    const { getByTestId } = render(<RawSceneObjects {...p} />);

    fireEvent.click(getByTestId("toggle-My Scene Objects"));

    expect(panelSection).toHaveBeenCalledWith(expect.objectContaining({
      isOpen: false,
      title: "My Scene Objects",
    }), undefined);
    panelSection.mockRestore();
  });

  it("filters my scene objects", () => {
    const p = fakeProps();
    const hidden = fakeSceneObject();
    hidden.uuid = "hidden";
    hidden.body.id = 2;
    hidden.body.name = "Hidden Object";
    p.sceneObjects = [p.sceneObjects[0], hidden];
    const { container, queryByText } = render(<RawSceneObjects {...p} />);

    fireEvent.change(container.querySelector("input")!, {
      target: { value: "hidden" },
    });

    expect(queryByText("Scene Object 1")).toBeFalsy();
    expect(queryByText("Hidden Object")).toBeTruthy();
  });

  it("deletes filtered scene objects with confirmation", () => {
    const destroy = jest.spyOn(crud, "destroy")
      .mockImplementation(uuid => `destroy ${uuid}` as never);
    const confirm = jest.spyOn(window, "confirm")
      .mockImplementation(() => true);
    const p = fakeProps();
    const { container } = render(<RawSceneObjects {...p} />);

    fireEvent.click(container.querySelector(".delete") as Element);

    expect(confirm).toHaveBeenCalledWith(
      "Are you sure you want to delete 1 scene objects?",
    );
    expect(destroy).toHaveBeenCalledWith(p.sceneObjects[0].uuid);
    expect(p.dispatch).toHaveBeenCalledWith(`destroy ${p.sceneObjects[0].uuid}`);
    destroy.mockRestore();
    confirm.mockRestore();
  });

  it("cancels deleting filtered scene objects", () => {
    const destroy = jest.spyOn(crud, "destroy")
      .mockImplementation(uuid => `destroy ${uuid}` as never);
    const confirm = jest.spyOn(window, "confirm")
      .mockImplementation(() => false);
    const p = fakeProps();
    const { container } = render(<RawSceneObjects {...p} />);

    fireEvent.click(container.querySelector(".delete") as Element);

    expect(destroy).not.toHaveBeenCalled();
    destroy.mockRestore();
    confirm.mockRestore();
  });

  it("imports all featured scene objects", () => {
    const initSave = jest.spyOn(crud, "initSave")
      .mockImplementation((_resource, body) =>
        `save ${(body as { name: string }).name}` as never);
    const p = fakeProps();
    const scene = fakeFarmwareEnv();
    scene.body.key = "3D_scene";
    scene.body.value = "1";
    p.farmwareEnvs = [scene];
    const { container, getByText } = render(<RawSceneObjects {...p} />);

    fireEvent.click(getByText("Featured Scene Objects (4)"));
    fireEvent.click(container.querySelectorAll("button.fb-button.green")[1]);

    expect(initSave).toHaveBeenCalled();
    expect(p.dispatch).toHaveBeenCalledWith(expect.stringMatching(/^save /));
    initSave.mockRestore();
  });

  it("skips importing featured scene objects that already exist", () => {
    const initSave = jest.spyOn(crud, "initSave")
      .mockImplementation((_resource, body) =>
        `save ${(body as { name: string }).name}` as never);
    const p = fakeProps();
    const scene = fakeFarmwareEnv();
    scene.body.key = "3D_scene";
    scene.body.value = "1";
    p.farmwareEnvs = [scene];
    const { container, getByText } = render(<RawSceneObjects {...p} />);

    fireEvent.click(getByText("Featured Scene Objects (4)"));
    const firstFeaturedName = container
      .querySelector(".scene-object-search-item-name")
      ?.textContent || "";
    p.sceneObjects[0].body.name = firstFeaturedName;
    fireEvent.click(container.querySelectorAll("button.fb-button.green")[1]);

    expect(initSave).not.toHaveBeenCalledWith(
      "SceneObject",
      expect.objectContaining({ name: firstFeaturedName }),
    );
    initSave.mockRestore();
  });

  it("disables featured scene objects that already exist", () => {
    const p = fakeProps();
    const scene = fakeFarmwareEnv();
    scene.body.key = "3D_scene";
    scene.body.value = "1";
    p.farmwareEnvs = [scene];
    p.sceneObjects[0].body.name = "Fence";
    const { container, getByText } = render(<RawSceneObjects {...p} />);

    fireEvent.click(getByText("Featured Scene Objects (4)"));

    expect(container.querySelector(
      ".scene-object-search-item input[type='checkbox']:disabled",
    )).toBeTruthy();
  });

  it("dispatches hover actions for featured scene objects", () => {
    const p = fakeProps();
    const scene = fakeFarmwareEnv();
    scene.body.key = "3D_scene";
    scene.body.value = "1";
    p.farmwareEnvs = [scene];
    const { container, getByText } = render(<RawSceneObjects {...p} />);
    fireEvent.click(getByText("Featured Scene Objects (4)"));

    const featuredItem = container.querySelector(
      ".scene-object-search-item input[type='checkbox']",
    )?.closest(".scene-object-search-item");

    expect(featuredItem).toBeTruthy();
    fireEvent.mouseEnter(featuredItem as Element);
    fireEvent.mouseLeave(featuredItem as Element);

    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.HOVER_SCENE_OBJECT,
      payload: expect.any(String),
    });
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.HOVER_SCENE_OBJECT,
      payload: undefined,
    });
  });

  it("toggles featured scene object selection and imports selected items", () => {
    const initSave = jest.spyOn(crud, "initSave")
      .mockImplementation((_resource, body) =>
        `save ${(body as { name: string }).name}` as never);
    const p = fakeProps();
    const scene = fakeFarmwareEnv();
    scene.body.key = "3D_scene";
    scene.body.value = "1";
    p.farmwareEnvs = [scene];
    p.sceneObjects = [];
    const { container, getByText } = render(<RawSceneObjects {...p} />);

    fireEvent.click(getByText("Featured Scene Objects (4)"));
    const checkboxes = container.querySelectorAll(
      ".scene-object-search-item input[type='checkbox']",
    );
    expect(checkboxes.length).toBeGreaterThan(0);

    const checkbox = checkboxes[0] as HTMLInputElement;
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
    fireEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();

    fireEvent.click(getByText("Import selected"));
    expect(initSave).toHaveBeenCalledTimes(1);
    expect(p.dispatch).toHaveBeenCalledWith(expect.stringMatching(/^save /));
    initSave.mockRestore();
  });

  it("dispatches ground texture config changes", () => {
    const p = fakeProps();
    const fbSelectProps: FBSelectProps[] = [];
    const fbSelectSpy = jest.spyOn(ui, "FBSelect")
      .mockImplementation(((props: FBSelectProps) => {
        fbSelectProps.push(props);
        return <div />;
      }) as never);
    const initSave = jest.spyOn(crud, "initSave")
      .mockReturnValue({ type: "init_save" } as never);

    render(<RawSceneObjects {...p} />);
    const textureSelect = fbSelectProps.find(props =>
      props.list.some(item => item.value == 1))!;
    const bricks = textureSelect.list.find(item => item.value == 1)!;

    textureSelect.onChange(bricks);
    expect(initSave).toHaveBeenCalledWith("FarmwareEnv", {
      key: "3D_groundTexture",
      value: "1",
    });
    expect(p.dispatch).toHaveBeenCalledWith({ type: "init_save" });

    fbSelectSpy.mockRestore();
    initSave.mockRestore();
  });

  it("changes the featured scene object library", () => {
    const p = fakeProps();
    const fbSelectProps: FBSelectProps[] = [];
    const fbSelectSpy = jest.spyOn(ui, "FBSelect")
      .mockImplementation(((props: FBSelectProps) => {
        fbSelectProps.push(props);
        return <div />;
      }) as never);

    render(<RawSceneObjects {...p} />);
    const sceneSelect = fbSelectProps.find(props =>
      props.list.some(item => item.label == "Lab"))!;

    act(() => sceneSelect.onChange({ label: "Lab", value: 1 }));

    const sceneSelects = fbSelectProps.filter(props =>
      props.list.some(item => item.label == "Lab"));
    expect(sceneSelects[sceneSelects.length - 1].selectedItem)
      .toEqual({ label: "Outdoor", value: 1 });
    fbSelectSpy.mockRestore();
  });
});

describe("mapStateToProps()", () => {
  it("returns props", () => {
    const resource = fakeSceneObject({ id: 1 });
    const state = fakeState();
    state.resources = buildResourceIndex([resource]);

    expect(mapStateToProps(state).sceneObjects).toEqual([resource]);
  });
});
