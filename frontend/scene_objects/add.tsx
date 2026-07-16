import React from "react";
import { AddSceneObjectProps } from "./interfaces";
import { connect } from "react-redux";
import { Everything } from "../interfaces";
import { Panel } from "../farm_designer/panel_header";
import {
  DesignerPanel, DesignerPanelContent, DesignerPanelHeader,
} from "../farm_designer/designer_panel";
import { Path } from "../internal_urls";
import { t } from "../i18next_wrapper";
import { SaveBtn } from "../ui";
import { SpecialStatus } from "farmbot";
import { initSave } from "../api/crud";
import { useNavigate } from "react-router";
import { SceneObjectFormFields, SceneObjectFormValues } from "./form";
import { Actions } from "../constants";
import { sceneObjectFocusHandler } from "./actions";

export const mapStateToProps = (props: Everything): AddSceneObjectProps => ({
  dispatch: props.dispatch,
  drawnSceneObject: props.resources.consumers.farm_designer.drawnSceneObject,
  focusedSceneObjectField:
    props.resources.consumers.farm_designer.focusedSceneObjectField,
});

export const DEFAULT_SCENE_OBJECT: SceneObjectFormValues = {
  name: "",
  texture: "concrete",
  shape: "box",
  color: "#ffffff",
  show: true,
  x_center: 0,
  y_center: 0,
  z_base: 0,
  x_size: 100,
  y_size: 100,
  z_size: 100,
  x_origin: "home",
  y_origin: "home",
  z_origin: "world",
};

export const RawAddSceneObject = (props: AddSceneObjectProps) => {
  const navigate = useNavigate();
  const initialized = React.useRef(false);
  const [showUnifiedSize, setShowUnifiedSize] = React.useState(false);
  React.useEffect(() => {
    if (!initialized.current && !props.drawnSceneObject) {
      initialized.current = true;
      props.dispatch({
        type: Actions.SET_DRAWN_SCENE_OBJECT_DATA,
        payload: DEFAULT_SCENE_OBJECT,
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
    props.dispatch(initSave("SceneObject", props.drawnSceneObject));
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

  return <DesignerPanel panelName={"add-scene-object"} panel={Panel.SceneObjects}>
    <DesignerPanelHeader
      panelName={"add-scene-object"}
      title={t("Add new scene object")}
      backTo={Path.sceneObjects()}
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
          showNameField={true}
          onFocusChange={onFocusChange}
          onUnifiedSizeChange={setShowUnifiedSize}
          onValueChange={onValueChange} />}
    </DesignerPanelContent>
  </DesignerPanel>;
};

export const AddSceneObjects = connect(mapStateToProps)(RawAddSceneObject);
export default AddSceneObjects;
