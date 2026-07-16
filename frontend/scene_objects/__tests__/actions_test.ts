import {
  sceneObjectFocusHandler,
  setFocusedSceneObjectField,
  setUnifiedSceneObjectSize,
  copySceneObject,
  duplicateSceneObjectName,
  availableSceneObjectName,
} from "../actions";
import { Actions } from "../../constants";
import { fakeSceneObject } from
  "../../__test_support__/fake_state/resources";
import { fakeState } from "../../__test_support__/fake_state";
import { buildResourceIndex } from
  "../../__test_support__/resource_index_builder";
import * as crud from "../../api/crud";
import { Path } from "../../internal_urls";

describe("scene object actions", () => {
  it("sets the focused scene object field", () => {
    expect(setFocusedSceneObjectField("x_size")).toEqual({
      type: Actions.SET_FOCUSED_SCENE_OBJECT_FIELD,
      payload: "x_size",
    });
  });

  it("dispatches the focused scene object field", () => {
    const dispatch = jest.fn();

    sceneObjectFocusHandler(dispatch)("x_size");

    expect(dispatch).toHaveBeenCalledWith(setFocusedSceneObjectField("x_size"));
  });

  it("sets unified scene object size", () => {
    expect(setUnifiedSceneObjectSize("SceneObject.1.2")).toEqual({
      type: Actions.SET_UNIFIED_SCENE_OBJECT_SIZE,
      payload: "SceneObject.1.2",
    });
  });

  it("generates an available duplicate name", () => {
    const resource = fakeSceneObject({ name: "Tree" });
    const sceneObjects = [
      resource,
      fakeSceneObject({ name: "Tree copy 1" }),
      fakeSceneObject({ name: "Tree copy 3" }),
    ];

    expect(duplicateSceneObjectName(sceneObjects, resource))
      .toEqual("Tree copy 2");
  });

  it("generates an available incremented name", () => {
    expect(availableSceneObjectName(["Tree", "Tree 2"], "Tree"))
      .toEqual("Tree 3");
    expect(availableSceneObjectName(["Tree 4"], "Tree 4"))
      .toEqual("Tree 5");
    expect(availableSceneObjectName(["Fence"], "Tree"))
      .toEqual("Tree");
  });

  it("copies and opens a scene object", async () => {
    const resource = fakeSceneObject({ id: 1, name: "Tree" });
    const copy = fakeSceneObject({ id: 2, name: "Tree copy 1" });
    const init = jest.spyOn(crud, "init").mockReturnValue({
      type: Actions.INIT_RESOURCE,
      payload: copy,
    });
    const save = jest.spyOn(crud, "save")
      .mockReturnValue("save action" as never);
    const dispatch = jest.fn((action: unknown) =>
      action == "save action" ? Promise.resolve() : undefined);
    const before = fakeState();
    before.resources = buildResourceIndex([resource]);
    const after = fakeState();
    after.resources = buildResourceIndex([resource, copy]);
    const getState = jest.fn()
      .mockReturnValueOnce(before)
      .mockReturnValue(after);
    const navigate = jest.fn();

    await copySceneObject(resource, navigate)(dispatch, getState);

    expect(init).toHaveBeenCalledWith("SceneObject", {
      ...resource.body,
      id: undefined,
      name: "Tree copy 1",
    });
    expect(save).toHaveBeenCalledWith(copy.uuid);
    expect(navigate).toHaveBeenCalledWith(Path.sceneObjects(2));
    init.mockRestore();
    save.mockRestore();
  });
});
