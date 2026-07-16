import { TaggedFarmwareEnv, TaggedSceneObject } from "farmbot";
import { SceneObject } from "farmbot/dist/resources/api_resources";

export type SceneObjectFormValues = SceneObject;

export interface SceneObjectsProps {
    sceneObjects: TaggedSceneObject[];
    dispatch: Function;
    farmwareEnvs: TaggedFarmwareEnv[];
}

export interface AddSceneObjectProps {
    dispatch: Function;
    drawnSceneObject: SceneObjectFormValues | undefined;
    focusedSceneObjectField: string | undefined;
}

export interface EditSceneObjectProps {
    dispatch: Function;
    focusedSceneObjectField: string | undefined;
    unifiedSceneObjectSize: string | undefined;
    findSceneObject(id: number): TaggedSceneObject | undefined;
}
