import React from "react";
import { connect } from "react-redux";
import { Everything } from "../interfaces";
import { Actions } from "../constants";
import {
  DesignerPanel, DesignerPanelContent, DesignerPanelHeader, DesignerPanelTop,
} from "../farm_designer/designer_panel";
import { Panel } from "../farm_designer/panel_header";
import { Path } from "../internal_urls";
import { t } from "../i18next_wrapper";
import { SearchField } from "../ui/search_field";
import {
  EmptyStateGraphic, EmptyStateWrapper,
} from "../ui/empty_state_wrapper";
import { Row } from "../ui";
import { useNavigate } from "react-router";
import {
  SCENE_OBJECT_CATALOG_SCENES, sceneObjectThumbnailFilename,
} from "../three_d_garden/scenes/scene_object_data";
import { TaggedSceneObject } from "farmbot";
import { selectAllSceneObjects } from "../resources/selectors";
import { availableSceneObjectName } from "./actions";
import { SceneObjectFormValues } from "./interfaces";

export interface SceneObjectCatalogProps {
  dispatch: Function;
  sceneObjects: TaggedSceneObject[];
}

interface SceneObjectCatalogEntry {
  key: string;
  name: string;
  scene: string;
  thumbnail: string;
  sceneObject?: SceneObjectFormValues;
}

const catalogEntries = (scene: string, sceneObjects: SceneObjectFormValues[]) =>
  sceneObjects.map((sceneObject, index): SceneObjectCatalogEntry => ({
    key: `${scene.toLowerCase()}-${index}`,
    name: sceneObject.name,
    scene,
    thumbnail: [
      "/app-resources/img/scene_objects",
      sceneObjectThumbnailFilename(sceneObject.name),
    ].join("/"),
    sceneObject,
  }));

export const SCENE_OBJECT_CATALOG: SceneObjectCatalogEntry[] = [
  {
    key: "custom",
    name: "Custom Scene Object",
    scene: "Custom",
    thumbnail: [
      "/app-resources/img/scene_objects",
      sceneObjectThumbnailFilename("Custom Scene Object"),
    ].join("/"),
  },
  ...catalogEntries("Greenhouse", SCENE_OBJECT_CATALOG_SCENES.greenhouse),
  ...catalogEntries("Lab", SCENE_OBJECT_CATALOG_SCENES.lab),
  ...catalogEntries("Outdoor", SCENE_OBJECT_CATALOG_SCENES.outdoor),
];

export const mapStateToProps = (props: Everything): SceneObjectCatalogProps => ({
  dispatch: props.dispatch,
  sceneObjects: selectAllSceneObjects(props.resources.index),
});

export const RawSceneObjectCatalog = (props: SceneObjectCatalogProps) => {
  const [searchTerm, setSearchTerm] = React.useState("");
  const navigate = useNavigate();
  const filteredEntries = SCENE_OBJECT_CATALOG.filter(entry =>
    `${entry.name} ${entry.scene}`.toLowerCase()
      .includes(searchTerm.toLowerCase()));
  const select = (entry: SceneObjectCatalogEntry) => {
    const payload = entry.sceneObject
      ? {
        ...entry.sceneObject,
        name: availableSceneObjectName(
          props.sceneObjects.map(sceneObject => sceneObject.body.name),
          entry.sceneObject.name,
        ),
      }
      : undefined;
    props.dispatch({
      type: Actions.SET_DRAWN_SCENE_OBJECT_DATA,
      payload,
    });
    navigate(Path.sceneObjects("add"));
  };

  return <DesignerPanel
    panelName={"scene-object-catalog"}
    panel={Panel.SceneObjects}>
    <DesignerPanelHeader
      panelName={"scene-object-catalog"}
      panel={Panel.SceneObjects}
      title={t("Choose a scene object")}
      backTo={Path.sceneObjects()} />
    <DesignerPanelTop panel={Panel.SceneObjects}>
      <SearchField nameKey={"scene-object-catalog"}
        searchTerm={searchTerm}
        placeholder={t("Search scene objects...")}
        onChange={setSearchTerm}
        autoFocus={true} />
    </DesignerPanelTop>
    <DesignerPanelContent panelName={"scene-object-catalog"}>
      <Row className={"scene-object-catalog-wrapper"}>
        <EmptyStateWrapper
          notEmpty={filteredEntries.length > 0}
          graphic={EmptyStateGraphic.no_crop_results}
          title={t("No search results")}
          colorScheme={"sceneObjects"}>
          <div className={"scene-object-catalog-grid"}>
            {filteredEntries.map(entry =>
              <button type={"button"}
                className={"scene-object-catalog-tile"}
                key={entry.key}
                onClick={() => select(entry)}>
                <img src={entry.thumbnail} alt={""} />
                <span className={"scene-object-catalog-name"}>
                  {entry.name}
                </span>
                <span className={"scene-object-catalog-scene"}>
                  {entry.scene}
                </span>
              </button>)}
          </div>
        </EmptyStateWrapper>
      </Row>
    </DesignerPanelContent>
  </DesignerPanel>;
};

export const SceneObjectCatalog = connect(mapStateToProps)(RawSceneObjectCatalog);
export default SceneObjectCatalog;
