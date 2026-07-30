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
import { HOVER_ALL_SCENE_OBJECTS } from
  "../../three_d_garden/scene_objects";
import * as configStorageActions from "../../config_storage/actions";
import { BooleanSetting } from "../../session_keys";
import { DevSettings } from "../../settings/dev/dev_support";

describe("<RawSceneObjects />", () => {
  const fakeProps = (): SceneObjectsProps => ({
    dispatch: jest.fn(),
    sceneObjects: [fakeSceneObject()],
    farmwareEnvs: [],
    showSceneObjects: true,
  });

  const setScene = (props: SceneObjectsProps, value: string) => {
    const scene = fakeFarmwareEnv();
    scene.body.key = "3D_scene";
    scene.body.value = value;
    props.farmwareEnvs = [scene];
    return scene;
  };

  it("shows the inventory for the Custom scene", () => {
    const p = fakeProps();
    setScene(p, "0");
    const { container, getByPlaceholderText } =
      render(<RawSceneObjects {...p} />);

    expect(getByPlaceholderText("Search your scene objects...")).toBeTruthy();
    expect(container.querySelector(".scene-selection-grid")).toBeFalsy();
  });

  it("returns to the scene tiles from the inventory", () => {
    const p = fakeProps();
    setScene(p, "0");
    const { container, getByText, getByTitle } =
      render(<RawSceneObjects {...p} />);
    const returnButton = getByTitle("back to scene selection");
    const search = container.querySelector(".thin-search-wrapper");

    expect(returnButton.nextElementSibling).toBe(search);
    fireEvent.click(returnButton);
    expect(container.querySelectorAll(".scene-selection-tile")).toHaveLength(5);

    fireEvent.click(getByText("Custom"));
    expect(container.querySelector(".scene-selection-grid")).toBeFalsy();
  });

  it("clears imported scene previews when returning to scene tiles", () => {
    const p = fakeProps();
    setScene(p, "0");
    const { getByText, getByTitle } =
      render(<RawSceneObjects {...p} />);

    fireEvent.click(getByText(/Featured Scene Objects/));
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_FEATURED_SCENE,
      payload: "Outdoor",
    });

    fireEvent.click(getByTitle("back to scene selection"));

    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_FEATURED_SCENE,
      payload: undefined,
    });
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.HOVER_SCENE_OBJECT,
      payload: undefined,
    });
  });

  it.each([
    ["1", "Outdoor"],
    ["2", "Lab"],
    ["3", "Greenhouse"],
    ["4", "Mars"],
    ["999", undefined],
    ["invalid", undefined],
  ])("shows scene tiles for scene %s", (value, activeScene) => {
    const p = fakeProps();
    setScene(p, value);
    const { container } = render(<RawSceneObjects {...p} />);
    const tiles = container.querySelectorAll(".scene-selection-tile");
    const selected = container.querySelectorAll(
      ".scene-selection-tile[aria-pressed='true']");

    expect(tiles).toHaveLength(5);
    expect(Array.from(tiles).map(tile => tile.textContent))
      .toEqual(["Outdoor", "Lab", "Greenhouse", "Mars", "Custom"]);
    expect(selected).toHaveLength(activeScene ? 1 : 0);
    if (activeScene) {
      expect(selected[0]).toHaveTextContent(activeScene);
      expect(selected[0]).toHaveClass("selected");
    }
  });

  it("shows the Mars scene when future features are enabled", () => {
    const futureFeaturesEnabled =
      jest.spyOn(DevSettings, "futureFeaturesEnabled")
        .mockReturnValue(true);
    const p = fakeProps();
    setScene(p, "1");
    const { container } = render(<RawSceneObjects {...p} />);
    const tiles = container.querySelectorAll(".scene-selection-tile");

    expect(Array.from(tiles).map(tile => tile.textContent))
      .toEqual(["Outdoor", "Lab", "Greenhouse", "Mars", "Custom"]);
    futureFeaturesEnabled.mockRestore();
  });

  it("switches to Custom and updates the ground texture", () => {
    const edit = jest.spyOn(crud, "edit")
      .mockImplementation((_resource, update) => update as never);
    const save = jest.spyOn(crud, "save")
      .mockImplementation(uuid => `save ${uuid}` as never);
    const p = fakeProps();
    const scene = setScene(p, "1");
    const texture = fakeFarmwareEnv();
    texture.body.key = "3D_groundTexture";
    texture.body.value = "2";
    p.farmwareEnvs.push(texture);
    const { getByText } = render(<RawSceneObjects {...p} />);

    fireEvent.click(getByText("Custom"));

    expect(edit).toHaveBeenCalledWith(scene, { value: "0" });
    expect(edit).toHaveBeenCalledWith(texture, { value: "0" });
    expect(save).toHaveBeenCalledWith(scene.uuid);
    expect(save).toHaveBeenCalledWith(texture.uuid);
    edit.mockRestore();
    save.mockRestore();
  });

  it("confirms before replacing scene objects with a preset", () => {
    const destroy = jest.spyOn(crud, "destroy")
      .mockImplementation(uuid => `destroy ${uuid}` as never);
    const edit = jest.spyOn(crud, "edit")
      .mockImplementation((_resource, update) => update as never);
    const initSave = jest.spyOn(crud, "initSave")
      .mockImplementation((_resource, body) => body as never);
    const confirm = jest.spyOn(window, "confirm")
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true);
    const p = fakeProps();
    const scene = setScene(p, "1");
    const { getByText } = render(<RawSceneObjects {...p} />);

    fireEvent.click(getByText("Lab"));
    expect(destroy).not.toHaveBeenCalled();
    expect(edit).not.toHaveBeenCalled();
    expect(initSave).not.toHaveBeenCalled();

    fireEvent.click(getByText("Lab"));
    expect(destroy).toHaveBeenCalledWith(p.sceneObjects[0].uuid);
    expect(edit).toHaveBeenCalledWith(scene, { value: "2" });
    expect(initSave).toHaveBeenCalledWith("FarmwareEnv", {
      key: "3D_groundTexture",
      value: "2",
    });
    confirm.mockRestore();
    destroy.mockRestore();
    edit.mockRestore();
    initSave.mockRestore();
  });

  it("does nothing when selecting the active scene", () => {
    const edit = jest.spyOn(crud, "edit");
    const destroy = jest.spyOn(crud, "destroy");
    const p = fakeProps();
    setScene(p, "1");
    const { getByText } = render(<RawSceneObjects {...p} />);

    fireEvent.click(getByText("Outdoor"));

    expect(edit).not.toHaveBeenCalled();
    expect(destroy).not.toHaveBeenCalled();
    edit.mockRestore();
    destroy.mockRestore();
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

  it("keeps the featured section open when clicking the scene dropdown", () => {
    const p = fakeProps();
    const { getByTitle } = render(<RawSceneObjects {...p} />);
    const featuredSection =
      getByTitle("Featured Scene Objects").closest(".panel-section")!;

    expect(featuredSection).not.toHaveClass("open");
    fireEvent.click(getByTitle("Featured Scene Objects"));
    expect(featuredSection).toHaveClass("open");
    fireEvent.click(featuredSection.querySelector(
      ".scene-object-select-row .filter-search button",
    ) as Element);

    expect(featuredSection).toHaveClass("open");
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

  it("hovers all scene objects from the hidden layer section", () => {
    const p = fakeProps();
    p.showSceneObjects = false;
    const { container } = render(<RawSceneObjects {...p} />);
    const mySceneObjectsHeader = container.querySelector(
      "label[title='My Scene Objects']")?.closest(".section-header");

    fireEvent.mouseEnter(mySceneObjectsHeader as Element);
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.HOVER_SCENE_OBJECT,
      payload: HOVER_ALL_SCENE_OBJECTS,
    });
    fireEvent.mouseLeave(mySceneObjectsHeader as Element);
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.HOVER_SCENE_OBJECT,
      payload: undefined,
    });
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

  it("places layer controls beside the search field", () => {
    const { container } = render(<RawSceneObjects {...fakeProps()} />);
    const panelTop = container.querySelector(".panel-top");
    const search = panelTop?.querySelector(".thin-search-wrapper");
    const controls = panelTop?.querySelector(".scene-object-layer-controls");

    expect(search?.nextElementSibling).toBe(controls);
    expect(controls?.children).toHaveLength(1);
  });

  it.each([true, false])("toggles the scene object layer from %s", show => {
    const setWebAppConfigValue = jest.spyOn(
      configStorageActions, "setWebAppConfigValue")
      .mockImplementation(jest.fn());
    const p = fakeProps();
    p.showSceneObjects = show;
    const { container } = render(<RawSceneObjects {...p} />);
    const layerToggle = container.querySelector(
      `.scene-object-layer-controls [title='${show ? "hide" : "show"}']`);

    fireEvent.click(layerToggle as Element);

    expect(setWebAppConfigValue).toHaveBeenCalledWith(
      BooleanSetting.show_scene_objects, !show);
    setWebAppConfigValue.mockRestore();
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
    setScene(p, "0");
    const { getByText, getByTitle } = render(<RawSceneObjects {...p} />);

    fireEvent.click(getByText("Featured Scene Objects (4)"));
    fireEvent.click(getByTitle("Import all"));

    expect(initSave).toHaveBeenCalled();
    expect(p.dispatch).toHaveBeenCalledWith(expect.stringMatching(/^save /));
    initSave.mockRestore();
  });

  it("skips importing featured scene objects that already exist", () => {
    const initSave = jest.spyOn(crud, "initSave")
      .mockImplementation((_resource, body) =>
        `save ${(body as { name: string }).name}` as never);
    const p = fakeProps();
    setScene(p, "0");
    const { container, getByText, getByTitle } =
      render(<RawSceneObjects {...p} />);

    fireEvent.click(getByText("Featured Scene Objects (4)"));
    const firstFeaturedName = container
      .querySelector(".scene-object-search-item-name")
      ?.textContent || "";
    p.sceneObjects[0].body.name = firstFeaturedName;
    fireEvent.click(getByTitle("Import all"));

    expect(initSave).not.toHaveBeenCalledWith(
      "SceneObject",
      expect.objectContaining({ name: firstFeaturedName }),
    );
    initSave.mockRestore();
  });

  it("disables featured scene objects that already exist", () => {
    const p = fakeProps();
    setScene(p, "0");
    p.sceneObjects[0].body.name = "Fence";
    const { container, getByText } = render(<RawSceneObjects {...p} />);

    fireEvent.click(getByText("Featured Scene Objects (4)"));

    expect(container.querySelector(
      ".scene-object-search-item input[type='checkbox']:disabled",
    )).toBeTruthy();
  });

  it("dispatches hover actions for featured scene objects", () => {
    const p = fakeProps();
    setScene(p, "0");
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
    setScene(p, "0");
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

    const { getByTitle } = render(<RawSceneObjects {...p} />);
    fireEvent.click(getByTitle("Featured Scene Objects"));
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
