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
import {
  _SO_RN,
  SceneObjectsProps, TaggedSceneObject,
} from "./interfaces";
import { PanelSection } from "../plants/plant_inventory";
import { staticSceneObjects } from "../three_d_garden/scene_objects";
import {
  findOrCreate3DConfigFunction, get3DConfigValueFunction, SCENE_DDIS, SCENES,
} from "../settings/three_d_settings";
import { destroy, initSave } from "../api/crud";
import { FBSelect } from "../ui";

export const mapStateToProps = (props: Everything): SceneObjectsProps => ({
  dispatch: props.dispatch,
  sceneObjects: selectAllSceneObjects(props.resources.index)
    .filter(scene_object => scene_object.body.id),
  farmwareEnvs: selectAllFarmwareEnvs(props.resources.index),
});

export const RawSceneObjects = (props: SceneObjectsProps) => {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selected, setSelected] = React.useState<string[]>([]);
  const navigate = useNavigate();

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
      onClick={() => {
        props.dispatch({
          type: Actions.HOVER_SCENE_OBJECT,
          payload: undefined,
        });
        navigateById(sceneObject.body.id || 0);
      }}
      onMouseEnter={() => hover(true)}
      onMouseLeave={() => hover(false)}
      className={"scene-object-search-item"}>
      <span className={"scene-object-search-item-name"}>
        {sceneObject.body.name}
      </span>
    </div>;
  };

  const { sceneObjects } = props;
  const filteredSceneObjects = sceneObjects
    .filter(p => p.body.name.toLowerCase()
      .includes(searchTerm.toLowerCase()));
  const sceneNum = get3DConfigValueFunction(props.farmwareEnvs)("scene");
  const scene = SCENES[sceneNum];
  const [featuredOpen, setFeaturedOpen] = React.useState(false);
  const [myOpen, setMyOpen] = React.useState(true);
  const featuredSceneObjects = React.useMemo(() => staticSceneObjects(scene), [scene]);
  return <DesignerPanel
    panelName={"scene-objects-inventory"}
    panel={Panel.SceneObjects}>
    <DesignerPanelTop panel={Panel.SceneObjects} withButton={true}>
      <SearchField nameKey={"scene-objects"}
        searchTerm={searchTerm}
        placeholder={t("Search your scene objects...")}
        onChange={setSearchTerm} />
    </DesignerPanelTop>
    <DesignerPanelContent panelName={"scene-objects-inventory"}>
      <PanelSection isOpen={featuredOpen}
        panel={Panel.SceneObjects}
        toggleOpen={() => setFeaturedOpen(!featuredOpen)}
        itemCount={featuredSceneObjects.length}
        extraHeaderContent={
          <div onClick={e => e.stopPropagation()} style={{ width: "10rem" }}>
            <FBSelect
              key={sceneNum}
              list={Object.values(SCENE_DDIS)}
              selectedItem={SCENE_DDIS[sceneNum]}
              onChange={ddi => findOrCreate3DConfigFunction(
                props.dispatch, props.farmwareEnvs)("scene", "" + ddi.value)} />
          </div>}
        addTitle={t("add new scene object")}
        addClassName={"plus-scene-object"}
        title={t("Featured Scene Objects")}>
        <div style={{ height: "3rem" }}>
          <button className={"fb-button green"}
            onClick={() => {
              featuredSceneObjects
                .filter(so => selected.includes(so.uuid))
                .map(sceneObject => {
                  props.dispatch(initSave(_SO_RN, sceneObject.body));
                });
              findOrCreate3DConfigFunction(
                props.dispatch, props.farmwareEnvs)("scene", "0");
            }}>
            {t("Import selected")}
          </button>
          <button className={"fb-button green"}
            onClick={() => {
              featuredSceneObjects
                .filter(so => !sceneObjects
                  .map(s => s.body.name)
                  .includes(so.body.name))
                .map(sceneObject => {
                  props.dispatch(initSave(_SO_RN, sceneObject.body));
                });
              findOrCreate3DConfigFunction(
                props.dispatch, props.farmwareEnvs)("scene", "0");
            }}>
            {t("Import all")}
          </button>
        </div>
        {featuredSceneObjects.map(featuredItem)}
      </PanelSection>
      <PanelSection isOpen={myOpen}
        panel={Panel.SceneObjects}
        toggleOpen={() => setMyOpen(!myOpen)}
        itemCount={filteredSceneObjects.length}
        addNew={() => { navigate(Path.sceneObjects("add")); }}
        extraHeaderContent={filteredSceneObjects.length > 0 &&
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
    </DesignerPanelContent>
  </DesignerPanel >;
};

export const SceneObjects = connect(mapStateToProps)(RawSceneObjects);
export default SceneObjects;
