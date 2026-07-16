import { TaggedFarmwareEnv, TaggedSceneObject } from "farmbot";
import { SceneObject } from "farmbot/dist/resources/api_resources";
import type {
  SceneObjectAxis,
} from "../three_d_garden/scenes/scene_object_data";

export type SceneObjectFormValues = SceneObject & {
  preserve_axes?: SceneObjectAxis[];
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
