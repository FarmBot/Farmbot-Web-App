import {
  sceneObjectFocusHandler,
  setFocusedSceneObjectField,
  setUnifiedSceneObjectSize,
} from "../actions";
import { Actions } from "../../constants";

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
});
