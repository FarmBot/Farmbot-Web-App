import { TaggedFarmwareEnv, TaggedSceneObject } from "farmbot";
import { SceneObject } from "farmbot/dist/resources/api_resources";
import type {
  SceneObjectAxis,
} from "../three_d_garden/scenes/scene_object_data";

export type SceneObjectFormValues = SceneObject & {
  preserve_axes?: SceneObjectAxis[];
};

export const rolloverRotation = (rotation: number) => {
  if (rotation >= -180 && rotation <= 180) { return rotation; }
  return ((rotation + 180) % 360 + 360) % 360 - 180;
};

export const sceneObjectBody = (values: SceneObjectFormValues): SceneObject => {
  const body = { ...values };
  delete body.preserve_axes;
  return body;
};

export interface SceneObjectsProps {
  sceneObjects: TaggedSceneObject[];
  dispatch: Function;
  farmwareEnvs: TaggedFarmwareEnv[];
  showSceneObjects: boolean;
  threeDGarden: boolean;
}

export interface AddSceneObjectProps {
  dispatch: Function;
  sceneObjects: TaggedSceneObject[];
  drawnSceneObject: SceneObjectFormValues | undefined;
  focusedSceneObjectField: string | undefined;
}

export interface EditSceneObjectProps {
  dispatch: Function;
  focusedSceneObjectField: string | undefined;
  unifiedSceneObjectSize: string | undefined;
  findSceneObject(id: number): TaggedSceneObject | undefined;
}
