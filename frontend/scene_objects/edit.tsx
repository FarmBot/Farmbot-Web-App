import React from "react";
import { EditSceneObjectProps } from "./interfaces";
import { connect } from "react-redux";
import { Everything } from "../interfaces";
import { TaggedPoint, TaggedResource } from "farmbot";
import {
  DesignerPanel, DesignerPanelHeader, DesignerPanelContent,
} from "../farm_designer/designer_panel";
import { Panel } from "../farm_designer/panel_header";
import { t } from "../i18next_wrapper";
import { Path } from "../internal_urls";
import { selectAllSceneObjects } from "../resources/selectors";
import { useNavigate } from "react-router";
import { destroy, edit, save } from "../api/crud";
import { SceneObjectFormFields, SceneObjectFormValues } from "./form";
import { ResourceTitle } from "../sequences/panel/editor";
import {
  sceneObjectFocusHandler, setUnifiedSceneObjectSize,
} from "./actions";

export const mapStateToProps = (props: Everything): EditSceneObjectProps => {
  const sceneObjects = selectAllSceneObjects(props.resources.index);
  return {
    dispatch: props.dispatch,
    focusedSceneObjectField:
      props.resources.consumers.farm_designer.focusedSceneObjectField,
    unifiedSceneObjectSize:
      props.resources.consumers.farm_designer.unifiedSceneObjectSize,
    findSceneObject: id => sceneObjects.filter(g => g.body.id == id)[0],
  };
};

export const RawEditSceneObject = (props: EditSceneObjectProps) => {
  const getSceneObject = () => {
    const stringyID = Path.getSlug(Path.sceneObjects());
    if (stringyID) {
      return props.findSceneObject(parseInt(stringyID));
    }
  };
  const sceneObject = getSceneObject();
  const formValues: SceneObjectFormValues | undefined = sceneObject
    ? {
      name: sceneObject.body.name,
      texture: sceneObject.body.texture,
      shape: sceneObject.body.shape,
      color: sceneObject.body.color,
      x_center: sceneObject.body.x_center,
      y_center: sceneObject.body.y_center,
      z_base: sceneObject.body.z_base,
      x_size: sceneObject.body.x_size,
      y_size: sceneObject.body.y_size,
      z_size: sceneObject.body.z_size,
      x_origin: sceneObject.body.x_origin,
      y_origin: sceneObject.body.y_origin,
      z_origin: sceneObject.body.z_origin,
    }
    : undefined;
  const onValueChange = (
    field: keyof SceneObjectFormValues,
    value: string | number,
  ) => {
    if (!sceneObject) { return; }
    const nextValue = typeof sceneObject.body[field] === "number"
      ? parseInt(value as string)
      : value as string;
    const resource = sceneObject as unknown as TaggedResource;
    const update = { [field]: nextValue } as Partial<typeof resource.body>;
    props.dispatch(edit(resource, update));
    props.dispatch(save(sceneObject.uuid));
  };
  const onFocusChange = sceneObjectFocusHandler(props.dispatch);
  const onUnifiedSizeChange = (unified: boolean) =>
    props.dispatch(setUnifiedSceneObjectSize(
      unified ? sceneObject?.uuid : undefined));
  const navigate = useNavigate();
  const sceneObjectsPath = Path.sceneObjects();
  !sceneObject && Path.startsWith(sceneObjectsPath) && navigate(sceneObjectsPath);
  return <DesignerPanel panelName={"edit-scene-object"} panel={Panel.SceneObjects}>
    <DesignerPanelHeader
      panelName={"edit-scene-object"}
      titleElement={<ResourceTitle
        key={sceneObject?.body.name}
        resource={sceneObject as unknown as TaggedPoint}
        save={true}
        fallback={t("Edit scene object")}
        dispatch={props.dispatch} />}
      backTo={Path.sceneObjects()}
      panel={Panel.SceneObjects}>
      <div className={"panel-header-icon-group"}>
        {sceneObject &&
          <i title={t("delete")}
            className={"fa fa-trash fb-icon-button invert"}
            onClick={() =>
              props.dispatch(destroy(sceneObject.uuid))
                .then(() => navigate(Path.sceneObjects()))} />}
      </div>
    </DesignerPanelHeader>
    <DesignerPanelContent panelName={"edit-scene-object"}>
      {sceneObject
        ? <SceneObjectFormFields
          values={formValues!}
          focusedField={props.focusedSceneObjectField}
          showUnifiedSize={props.unifiedSceneObjectSize == sceneObject.uuid}
          onFocusChange={onFocusChange}
          onUnifiedSizeChange={onUnifiedSizeChange}
          onValueChange={onValueChange} />
        : <span>{t("Redirecting")}...</span>}
    </DesignerPanelContent>
  </DesignerPanel>;
};

export const EditSceneObjects = connect(mapStateToProps)(RawEditSceneObject);
export default EditSceneObjects;
