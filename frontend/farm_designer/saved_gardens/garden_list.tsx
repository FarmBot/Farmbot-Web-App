import * as React from "react";
import { Col } from "../../ui";
import { isNumber, isString } from "lodash";
import { openSavedGarden } from "./actions";
import {
  SavedGardenItemProps, SavedGardenInfoProps, SavedGardensListProps
} from "./interfaces";
import { t } from "../../i18next_wrapper";

/** Name input and PlantTemplate count for a single SavedGarden. */
export const GardenInfo = (props: SavedGardenInfoProps) => {
  const { savedGarden, dispatch } = props;
  return <div className="saved-garden-info"
    onClick={() => dispatch(openSavedGarden(savedGarden.uuid))}>
    <Col>
      <span>{savedGarden.body.name}</span>
      <p><i>{props.plantTemplateCount} {t("plants")}</i></p>
    </Col>
  </div>;
};

/** Info and actions for a single SavedGarden. */
const SavedGardenItem = (props: SavedGardenItemProps) => {
  return <div className={
    `saved-garden-search-item ${props.gardenIsOpen ? "selected" : ""}`}>
    <GardenInfo
      savedGarden={props.savedGarden}
      plantTemplateCount={props.plantTemplateCount}
      dispatch={props.dispatch} />
  </div>;
};

/** Info and action list for all SavedGardens. */
export const SavedGardenList = (props: SavedGardensListProps) =>
  <div className="saved-garden-list">
    {props.savedGardens.map(sg => {
      const validSavedGarden =
        isString(sg.uuid) && isNumber(sg.body.id) && isString(sg.body.name);
      if (validSavedGarden && (sg.body.name || "").toLowerCase()
        .includes(props.searchTerm.toLowerCase())) {
        return <SavedGardenItem
          key={sg.uuid}
          savedGarden={sg}
          gardenIsOpen={sg.uuid === props.openedSavedGarden}
          dispatch={props.dispatch}
          plantPointerCount={props.plantPointerCount}
          plantTemplateCount={props.plantTemplates.filter(pt =>
            pt.body.saved_garden_id === sg.body.id).length} />;
      }
    })}
  </div>;
