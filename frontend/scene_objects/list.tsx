import React from "react";
import { connect } from "react-redux";
import { Everything } from "../interfaces";
import { Panel } from "../farm_designer/panel_header";
import {
  EmptyStateWrapper, EmptyStateGraphic,
} from "../ui/empty_state_wrapper";
import { Actions, Content } from "../constants";
import {
  DesignerPanel, DesignerPanelContent, DesignerPanelTop,
} from "../farm_designer/designer_panel";
import { t } from "../i18next_wrapper";
import {
  selectAllFarmwareEnvs, selectAllSceneObjects,
} from "../resources/selectors";
import { SearchField } from "../ui/search_field";
import { Path } from "../internal_urls";
import { useNavigate } from "react-router";
import { SceneObjectsProps } from "./interfaces";
import { PanelSection } from "../plants/plant_inventory";
import {
  HOVER_ALL_SCENE_OBJECTS, staticSceneObjects,
} from "../three_d_garden/scene_objects";
import {
  findOrCreate3DConfigFunction, get3DConfigValueFunction,
  GROUND_TEXTURE_NUM_FROM_SCENE_NUM, SCENE_DDI_LIST, SCENE_DDIS,
  SCENE_NUM_FROM_NAME, SCENES, TEXTURE_DDIS,
} from "../settings/three_d_settings";
import { destroy, edit, initSave, save } from "../api/crud";
import { FBSelect, ToggleButton } from "../ui";
import { TaggedSceneObject } from "farmbot";
import {
  getWebAppConfigValue, setWebAppConfigValue,
} from "../config_storage/actions";
import { BooleanSetting } from "../session_keys";

const SCENE_CHOICES = () => [
  "Outdoor",
  "Lab",
  "Greenhouse",
  "Mars",
  "Custom",
];

const sceneImage = (scene: string) =>
  `/app-resources/img/scenes/${scene.toLowerCase()}.avif`;

export const mapStateToProps = (props: Everything): SceneObjectsProps => ({
  dispatch: props.dispatch,
  sceneObjects: selectAllSceneObjects(props.resources.index)
    .filter(scene_object => scene_object.body.id),
  farmwareEnvs: selectAllFarmwareEnvs(props.resources.index),
  showSceneObjects: !!getWebAppConfigValue(() => props)(
    BooleanSetting.show_scene_objects),
  threeDGarden: !!getWebAppConfigValue(() => props)(
    BooleanSetting.three_d_garden),
});

export const RawSceneObjects = (props: SceneObjectsProps) => {
  const { dispatch } = props;
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selected, setSelected] = React.useState<string[]>([]);
  const [overlayDismissed, setOverlayDismissed] = React.useState(false);
  const [optimisticThreeD, setOptimisticThreeD] =
    React.useState<boolean>();
  const threeDToggleTimeout =
    React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const navigate = useNavigate();

  React.useEffect(() => () => clearTimeout(threeDToggleTimeout.current), []);

  const navigateById = (id: number) => {
    navigate(Path.sceneObjects(id));
  };

  const featuredItem = (sceneObject: TaggedSceneObject) => {
    const hover = (hovered: boolean) =>
      props.dispatch({
        type: Actions.HOVER_SCENE_OBJECT,
        payload: hovered ? sceneObject.uuid : undefined,
      });
    return <div
      key={sceneObject.uuid}
      onMouseEnter={() => hover(true)}
      onMouseLeave={() => hover(false)}
      className={"scene-object-search-item"}>
      <span className={"scene-object-search-item-name"}>
        <input type={"checkbox"}
          disabled={sceneObjects.some(so => so.body.name === sceneObject.body.name)}
          checked={selected.includes(sceneObject.uuid)}
          onChange={() => {
            if (selected.includes(sceneObject.uuid)) {
              setSelected(selected.filter(id => id !== sceneObject.uuid));
            } else {
              setSelected([...selected, sceneObject.uuid]);
            }
          }} />
        {sceneObject.body.name}
      </span>
    </div>;
  };

  const myItem = (sceneObject: TaggedSceneObject) => {
    const hover = (hovered: boolean) =>
      props.dispatch({
        type: Actions.HOVER_SCENE_OBJECT,
        payload: hovered ? sceneObject.uuid : undefined,
      });
    return <div
      key={sceneObject.uuid}
      title={sceneObject.body.name}
      onClick={() => {
        props.dispatch({
          type: Actions.HOVER_SCENE_OBJECT,
          payload: undefined,
        });
        navigateById(sceneObject.body.id || 0);
      }}
      onMouseEnter={() => hover(true)}
      onMouseLeave={() => hover(false)}
      className={"scene-object-search-item my-scene-object-search-item"}>
      <span className={"scene-object-search-item-name"}>
        {sceneObject.body.name}
      </span>
      <i
        className={`fa fb-icon-button invert ${sceneObject.body.show
          ? "fa-eye"
          : "fa-eye-slash"}`}
        title={sceneObject.body.show ? t("hide") : t("show")}
        onClick={e => {
          e.stopPropagation();
          props.dispatch(edit(sceneObject, { show: !sceneObject.body.show }));
          props.dispatch(save(sceneObject.uuid));
        }} />
    </div>;
  };

  const { sceneObjects } = props;
  const filteredSceneObjects = sceneObjects
    .filter(p => p.body.name.toLowerCase()
      .includes(searchTerm.toLowerCase()));
  const [libScene, setLibScene] = React.useState("Outdoor");
  const [featuredOpen, setFeaturedOpen] = React.useState(false);
  const [myOpen, setMyOpen] = React.useState(true);
  const featuredSceneObjects = React.useMemo(() =>
    staticSceneObjects(libScene), [libScene]);
  React.useEffect(() => {
    dispatch({
      type: Actions.SET_FEATURED_SCENE,
      payload: featuredOpen ? libScene : undefined,
    });
    return () => dispatch({
      type: Actions.SET_FEATURED_SCENE,
      payload: undefined,
    });
  }, [dispatch, featuredOpen, libScene]);
  const groundTextureNum =
    get3DConfigValueFunction(props.farmwareEnvs)("groundTexture");
  const sceneNum = get3DConfigValueFunction(props.farmwareEnvs)("scene");
  const sceneName = SCENES[sceneNum];
  const [showSceneSelection, setShowSceneSelection] = React.useState(false);
  const returnToSceneSelection = () => {
    setFeaturedOpen(false);
    setSelected([]);
    dispatch({
      type: Actions.SET_FEATURED_SCENE,
      payload: undefined,
    });
    dispatch({
      type: Actions.HOVER_SCENE_OBJECT,
      payload: undefined,
    });
    setShowSceneSelection(true);
  };
  const selectScene = (newSceneName: string) => {
    const newSceneNum = SCENE_NUM_FROM_NAME[newSceneName];
    if (newSceneNum == sceneNum) {
      if (newSceneName == "Custom") { setShowSceneSelection(false); }
      return;
    }
    if (newSceneName != "Custom" && sceneObjects.length > 0) {
      if (!window.confirm(t(Content.CONFIRM_SCENE_CHANGE,
        { count: sceneObjects.length }))) {
        return;
      }
      sceneObjects.map(sceneObject =>
        dispatch(destroy(sceneObject.uuid)));
    }
    const findOrCreate = findOrCreate3DConfigFunction(
      dispatch, props.farmwareEnvs);
    findOrCreate("scene", "" + newSceneNum);
    findOrCreate("groundTexture",
      "" + GROUND_TEXTURE_NUM_FROM_SCENE_NUM[newSceneNum]);
    if (newSceneName == "Custom") { setShowSceneSelection(false); }
  };
  const threeDRequiredOverlay = !props.threeDGarden && !overlayDismissed
    ? <div className={"scene-objects-3d-required-overlay"}
      role={"dialog"}
      aria-modal={true}
      aria-label={t("3D Garden required")}>
      <div className={"scene-objects-3d-required-content"}>
        <p>{t("Only available in 3D")}</p>
        <div className={"scene-objects-3d-required-toggle"}>
          <label>{t("2D")}</label>
          <ToggleButton
            title={t("toggle 3D Garden")}
            toggleValue={optimisticThreeD ?? props.threeDGarden}
            customText={{ textTrue: "", textFalse: "" }}
            toggleAction={() => {
              const nextValue = !(optimisticThreeD ?? props.threeDGarden);
              setOptimisticThreeD(nextValue);
              clearTimeout(threeDToggleTimeout.current);
              threeDToggleTimeout.current = setTimeout(() => {
                dispatch(setWebAppConfigValue(
                  BooleanSetting.three_d_garden, nextValue));
                setOptimisticThreeD(undefined);
              }, 500);
            }} />
          <label>{t("3D")}</label>
        </div>
        <button type={"button"}
          className={"fb-button gray"}
          onClick={() => setOverlayDismissed(true)}>
          {t("Dismiss")}
        </button>
      </div>
    </div>
    : undefined;
  if (sceneName != "Custom" || showSceneSelection) {
    return <DesignerPanel
      panelName={"scene-objects-inventory"}
      panel={Panel.SceneObjects}>
      {threeDRequiredOverlay}
      <DesignerPanelContent panelName={"scene-objects-inventory"}>
        <div className={"scene-selection-grid"}>
          {SCENE_CHOICES().map(scene =>
            <button type={"button"}
              key={scene}
              className={["scene-selection-tile",
                sceneName == scene ? "selected" : ""].join(" ")}
              aria-pressed={sceneName == scene}
              onClick={() => selectScene(scene)}>
              <img src={sceneImage(scene)} alt={""} />
              <span>
                {t(scene)}
                {scene == "Custom" &&
                  <i className={"fa fa-external-link"} />}
              </span>
            </button>)}
        </div>
      </DesignerPanelContent>
    </DesignerPanel>;
  }
  return <DesignerPanel
    panelName={"scene-objects-inventory"}
    panel={Panel.SceneObjects}>
    {threeDRequiredOverlay}
    <DesignerPanelTop panel={Panel.SceneObjects} withButton={true}>
      <button type={"button"}
        className={"fb-button gray scene-selection-return"}
        title={t("back to scene selection")}
        onClick={returnToSceneSelection}>
        <i className={"fa fa-reply"} />
      </button>
      <SearchField nameKey={"scene-objects"}
        searchTerm={searchTerm}
        placeholder={t("Search your scene objects...")}
        onChange={setSearchTerm} />
      <div className={"scene-object-layer-controls"}>
        <i
          className={`fa fb-icon-button invert ${props.showSceneObjects
            ? "fa-eye"
            : "fa-eye-slash"}`}
          title={props.showSceneObjects ? t("hide") : t("show")}
          onClick={() => dispatch(setWebAppConfigValue(
            BooleanSetting.show_scene_objects, !props.showSceneObjects))} />
      </div>
    </DesignerPanelTop>
    <DesignerPanelContent panelName={"scene-objects-inventory"}>
      <div className={"row scene-object-select-row"}>
        <label>{t("Ground texture")}</label>
        <FBSelect
          key={libScene}
          list={Object.values(TEXTURE_DDIS())}
          selectedItem={TEXTURE_DDIS()[groundTextureNum]}
          onChange={ddi => findOrCreate3DConfigFunction(
            props.dispatch, props.farmwareEnvs)("groundTexture", "" + ddi.value)} />
      </div>
      <PanelSection isOpen={myOpen}
        panel={Panel.SceneObjects}
        toggleOpen={() => setMyOpen(!myOpen)}
        onMouseEnter={() => {
          dispatch({
            type: Actions.HOVER_SCENE_OBJECT,
            payload: HOVER_ALL_SCENE_OBJECTS,
          });
        }}
        onMouseLeave={() => {
          dispatch({
            type: Actions.HOVER_SCENE_OBJECT,
            payload: undefined,
          });
        }}
        itemCount={filteredSceneObjects.length}
        addNew={() => {
          dispatch({
            type: Actions.HOVER_SCENE_OBJECT,
            payload: undefined,
          });
          navigate(Path.sceneObjects("catalog"));
        }}
        extraHeaderContent={filteredSceneObjects.length > 0 && myOpen &&
          <button className={"fb-button red delete"}
            title={t("delete all")}
            onClick={e => {
              e.stopPropagation();
              if (window.confirm(t(
                "Are you sure you want to delete {{count}} scene objects?",
                { count: filteredSceneObjects.length }))) {
                filteredSceneObjects.forEach(sceneObject => {
                  props.dispatch(destroy(sceneObject.uuid));
                });
              }
            }}>
            {t("delete all")}
          </button>}
        addTitle={t("add new scene object")}
        addClassName={"plus-scene-object"}
        title={t("My Scene Objects")}>
        {filteredSceneObjects.map(myItem)}
        <EmptyStateWrapper
          notEmpty={sceneObjects.length > 0}
          graphic={EmptyStateGraphic.scene_objects}
          title={t("No scene objects yet.")}
          text={Content.NO_SCENE_OBJECTS}
          colorScheme={"sceneObjects"} />
      </PanelSection>
      <PanelSection isOpen={featuredOpen}
        panel={Panel.SceneObjects}
        toggleOpen={() => setFeaturedOpen(!featuredOpen)}
        itemCount={featuredSceneObjects.length}
        addTitle={t("add new scene object")}
        addClassName={"plus-scene-object"}
        title={t("Featured Scene Objects")}>
        <div className={"row scene-object-select-row"}>
          <label>{t("Import objects from")}</label>
          <FBSelect
            key={libScene}
            list={SCENE_DDI_LIST().filter(ddi => !["Custom"].includes(ddi.label))}
            selectedItem={SCENE_DDIS()[SCENE_NUM_FROM_NAME[libScene]]}
            onChange={ddi => {
              setLibScene(SCENES[ddi.value as number]);
              setFeaturedOpen(true);
            }} />
        </div>
        {featuredSceneObjects.map(featuredItem)}
        <div style={{ height: "3rem" }}>
          <button className={"fb-button green"}
            onClick={() => {
              featuredSceneObjects
                .filter(so => selected.includes(so.uuid))
                .map(sceneObject => {
                  props.dispatch(initSave("SceneObject", sceneObject.body));
                });
              findOrCreate3DConfigFunction(props.dispatch, props.farmwareEnvs)(
                "scene",
                SCENE_NUM_FROM_NAME["Custom"] + "",
              );
            }}>
            {t("Import selected")}
          </button>
          <button className={"fb-button green"}
            title={t("Import all")}
            onClick={() => {
              featuredSceneObjects
                .filter(so => !sceneObjects
                  .map(s => s.body.name)
                  .includes(so.body.name))
                .map(sceneObject => {
                  props.dispatch(initSave("SceneObject", sceneObject.body));
                });
              findOrCreate3DConfigFunction(props.dispatch, props.farmwareEnvs)(
                "scene",
                SCENE_NUM_FROM_NAME["Custom"] + "");
            }}>
            {t("Import all")}
          </button>
        </div>
      </PanelSection>
    </DesignerPanelContent>
  </DesignerPanel >;
};

export const SceneObjects = connect(mapStateToProps)(RawSceneObjects);
export default SceneObjects;
