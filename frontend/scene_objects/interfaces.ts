import { RestResource, TaggedFarmwareEnv, TaggedResource } from "farmbot";
import { ResourceBase } from "farmbot/dist/resources/api_resources";

export interface SceneObject extends ResourceBase, SceneObjectFormValues {
}

export interface SceneObjectFormValues {
    name: string;
    texture: string;
    shape: string;
    color: string;
    x_center: number;
    y_center: number;
    z_base: number;
    x_size: number;
    y_size: number;
    z_size: number;
    x_origin: string;
    y_origin: string;
    z_origin: string;
}

export const _SO_RN = "SceneObject" as unknown as TaggedResource["kind"];
export type TaggedSceneObject = RestResource<typeof _SO_RN, SceneObject>;

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
