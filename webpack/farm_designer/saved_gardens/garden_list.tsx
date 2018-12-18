import * as React from "react";
import { t } from "i18next";
import { Row, Col, BlurableInput } from "../../ui";
import { error } from "farmbot-toastr";
import { isNumber, isString } from "lodash";
import { openOrCloseGarden, applyGarden, destroySavedGarden } from "./actions";
import {
  SavedGardensProps, GardenViewButtonProps, SavedGardenItemProps,
  SavedGardenInfoProps
} from "./interfaces";
import { edit, save } from "../../api/crud";
import { trim } from "../../util";

/** Name input and PlantTemplate count for a single SavedGarden. */
export const GardenInfo = (props: SavedGardenInfoProps) => {
  const { savedGarden, gardenIsOpen, dispatch } = props;
  return <div className="saved-garden-info"
    onClick={openOrCloseGarden({
      savedGarden: savedGarden.uuid, gardenIsOpen, dispatch
    })}>
    <Col xs={4}>
      <BlurableInput
        value={savedGarden.body.name || ""}
        onCommit={e => {
          dispatch(edit(savedGarden, { name: e.currentTarget.value }));
          dispatch(save(savedGarden.uuid));
        }} />
    </Col>
    <Col xs={2}>
      <p style={{ textAlign: "center" }}>{props.plantTemplateCount}</p>
    </Col>
  </div>;
};

/** Open or close a SavedGarden. */
const GardenViewButton = (props: GardenViewButtonProps) => {
  const { dispatch, savedGarden, gardenIsOpen } = props;
  const onClick = openOrCloseGarden({ savedGarden, gardenIsOpen, dispatch });
  const btnText = gardenIsOpen
    ? t("exit")
    : t("view");
  return <button
    className={`fb-button ${gardenIsOpen ? "gray" : "yellow"}`}
    onClick={onClick}>
    {btnText}
  </button>;
};

/** Apply a SavedGarden after checking that the current garden is empty. */
const ApplyGardenButton =
  (props: { plantPointerCount: number, gardenId: number, dispatch: Function }) =>
    <button
      className="fb-button green"
      onClick={() => props.plantPointerCount > 0
        ? error(trim(`${t("Please clear current garden first.")}
        (${props.plantPointerCount} ${t("plants")})`))
        : props.dispatch(applyGarden(props.gardenId))}>
      {t("apply")}
    </button>;

const DestroyGardenButton =
  (props: { dispatch: Function, gardenUuid: string }) =>
    <button
      className="fb-button red"
      onClick={() => props.dispatch(destroySavedGarden(props.gardenUuid))}>
      <i className="fa fa-times" />
    </button>;

/** Info and actions for a single SavedGarden. */
const SavedGardenItem = (props: SavedGardenItemProps) => {
  return <div
    className={`saved-garden-row ${props.gardenIsOpen ? "selected" : ""}`}>
    <Row>
      <GardenInfo
        savedGarden={props.savedGarden}
        gardenIsOpen={props.gardenIsOpen}
        plantTemplateCount={props.plantTemplateCount}
        dispatch={props.dispatch} />
      <Col xs={6}>
        <DestroyGardenButton
          dispatch={props.dispatch}
          gardenUuid={props.savedGarden.uuid} />
        <ApplyGardenButton
          dispatch={props.dispatch}
          plantPointerCount={props.plantPointerCount}
          gardenId={props.savedGarden.body.id || -1} />
        <GardenViewButton
          dispatch={props.dispatch}
          savedGarden={props.savedGarden.uuid}
          gardenIsOpen={props.gardenIsOpen} />
      </Col>
    </Row>
  </div>;
};

/** Info and action list for all SavedGardens. */
export const SavedGardenList = (props: SavedGardensProps) =>
  <div className="saved-garden-list">
    <Row>
      <Col xs={4}>
        <label>{t("name")}</label>
      </Col>
      <Col xs={2}>
        <label>{t("plants")}</label>
      </Col>
      <Col xs={6}>
        <label style={{ float: "right" }}>{t("actions")}</label>
      </Col>
    </Row>
    {props.savedGardens.map(sg => {
      if (isString(sg.uuid) && isNumber(sg.body.id) && isString(sg.body.name)) {
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
