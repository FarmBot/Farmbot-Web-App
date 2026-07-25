import React from "react";
import { AddSceneObjectProps, sceneObjectBody } from "./interfaces";
import { connect } from "react-redux";
import { Everything } from "../interfaces";
import { Panel } from "../farm_designer/panel_header";
import {
  DesignerPanel, DesignerPanelContent, DesignerPanelHeader,
} from "../farm_designer/designer_panel";
import { Path } from "../internal_urls";
import { t } from "../i18next_wrapper";
import { SaveBtn } from "../ui";
import { SpecialStatus, TaggedPoint } from "farmbot";
import { destroy, initSave } from "../api/crud";
import { useNavigate } from "react-router";
import { SceneObjectFormFields, SceneObjectFormValues } from "./form";
import { Actions } from "../constants";
import { availableSceneObjectName, sceneObjectFocusHandler } from "./actions";
import {
  DEFAULT_SCENE_OBJECT,
  SceneObjectAxis,
} from "../three_d_garden/scenes/scene_object_data";
import type { SceneObject } from "farmbot/dist/resources/api_resources";
import { selectAllSceneObjects } from "../resources/selectors";
import { ResourceTitle } from "../sequences/panel/editor";

export { DEFAULT_SCENE_OBJECT } from
  "../three_d_garden/scenes/scene_object_data";

export const mapStateToProps = (props: Everything): AddSceneObjectProps => ({
  dispatch: props.dispatch,
  sceneObjects: selectAllSceneObjects(props.resources.index),
  drawnSceneObject: props.resources.consumers.farm_designer.drawnSceneObject,
  focusedSceneObjectField:
    props.resources.consumers.farm_designer.focusedSceneObjectField,
});

export const RawAddSceneObject = (props: AddSceneObjectProps) => {
  const navigate = useNavigate();
  const initialized = React.useRef(false);
  const initialUuids: string[] = props.sceneObjects
    .map(sceneObject => sceneObject.uuid);
  const initialSceneObjectUuids = React.useRef<Set<string>>(
    new Set<string>(initialUuids),
  );
  const [showUnifiedSize, setShowUnifiedSize] = React.useState(false);
  React.useEffect(() => {
    if (!initialized.current && !props.drawnSceneObject) {
      initialized.current = true;
      const name = availableSceneObjectName(
        props.sceneObjects.map(sceneObject => sceneObject.body.name),
        "Custom Scene Object",
      );
      props.dispatch({
        type: Actions.SET_DRAWN_SCENE_OBJECT_DATA,
        payload: { ...DEFAULT_SCENE_OBJECT, name },
      });
    }
    if (props.drawnSceneObject) {
      initialized.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.dispatch, props.drawnSceneObject]);
  React.useEffect(() => () => props.dispatch({
    type: Actions.SET_DRAWN_SCENE_OBJECT_DATA,
    payload: undefined,
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [props.dispatch]);
  const saveSceneObject = () => {
    if (!props.drawnSceneObject) { return; }
    const body: SceneObject = sceneObjectBody(props.drawnSceneObject);
    props.dispatch(initSave("SceneObject", body));
    props.dispatch({
      type: Actions.SET_DRAWN_SCENE_OBJECT_DATA,
      payload: undefined,
    });
    navigate(Path.sceneObjects());
  };
  const onValueChange = (
    field: keyof SceneObjectFormValues,
    value: string | number | boolean,
  ) => {
    if (!props.drawnSceneObject) { return; }
    props.dispatch({
      type: Actions.SET_DRAWN_SCENE_OBJECT_DATA,
      payload: { ...props.drawnSceneObject, [field]: value },
    });
  };
  const onFocusChange = sceneObjectFocusHandler(props.dispatch);
  const onPreserveAxesChange = (preserveAxes: SceneObjectAxis[]) => {
    if (!props.drawnSceneObject) { return; }
    props.dispatch({
      type: Actions.SET_DRAWN_SCENE_OBJECT_DATA,
      payload: {
        ...props.drawnSceneObject,
        preserve_axes: preserveAxes,
      },
    });
  };
  const discardFailedSceneObjects = () => props.sceneObjects
    .filter(sceneObject =>
      !initialSceneObjectUuids.current.has(sceneObject.uuid)
      && !sceneObject.body.id
      && sceneObject.specialStatus == SpecialStatus.DIRTY)
    .forEach(sceneObject => props.dispatch(destroy(sceneObject.uuid, true)));

  return <DesignerPanel panelName={"add-scene-object"} panel={Panel.SceneObjects}>
    <DesignerPanelHeader
      panelName={"add-scene-object"}
      titleElement={<ResourceTitle
        key={props.drawnSceneObject?.name}
        resource={props.drawnSceneObject
          ? { body: props.drawnSceneObject } as unknown as TaggedPoint
          : undefined}
        fallback={t("Add new scene object")}
        dispatch={props.dispatch}
        onChange={name => onValueChange("name", name)} />}
      backTo={Path.sceneObjects()}
      onBack={discardFailedSceneObjects}
      panel={Panel.SceneObjects}>
      <div className={"scene-objects-action-btn-group"}>
        <SaveBtn
          onClick={saveSceneObject}
          status={SpecialStatus.DIRTY} />
      </div>
    </DesignerPanelHeader>
    <DesignerPanelContent panelName={"add-scene-object"}>
      {props.drawnSceneObject &&
        <SceneObjectFormFields
          values={props.drawnSceneObject}
          focusedField={props.focusedSceneObjectField}
          showUnifiedSize={showUnifiedSize}
          showPreserveAxes={true}
          hideCubeControl={true}
          onFocusChange={onFocusChange}
          onPreserveAxesChange={onPreserveAxesChange}
          onUnifiedSizeChange={setShowUnifiedSize}
          onValueChange={onValueChange} />}
    </DesignerPanelContent>
  </DesignerPanel>;
};

export const AddSceneObjects = connect(mapStateToProps)(RawAddSceneObject);
export default AddSceneObjects;
