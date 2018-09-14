import * as React from "react";
import { t } from "i18next";
import { Row, Col } from "../../ui";
import { error } from "farmbot-toastr";
import { isNumber, isString } from "lodash";
import { openOrCloseGarden, applyGarden, destroySavedGarden } from "./actions";
import {
  SavedGardensProps, GardenViewButtonProps, SavedGardenItemProps
} from "./interfaces";
import { TaggedSavedGarden } from "farmbot";

const GardenInfo = (props: {
  savedGarden: TaggedSavedGarden,
  gardenIsOpen: boolean,
  plantCount: number,
  dispatch: Function
}) => {
  const { savedGarden, gardenIsOpen, dispatch } = props;
  return <div className="saved-garden-info"
    onClick={openOrCloseGarden({
      savedGarden: savedGarden.uuid, gardenIsOpen, dispatch
    })}>
    <Col xs={4}>
      <p>{savedGarden.body.name}</p>
    </Col>
    <Col xs={2}>
      <p style={{ textAlign: "center" }}>{props.plantCount}</p>
    </Col>
  </div>;
};

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

const ApplyGardenButton =
  (props: { plantsInGarden: boolean, gardenId: number, dispatch: Function }) =>
    <button
      className="fb-button green"
      onClick={() => props.plantsInGarden
        ? error(t("Please clear current garden first."))
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

const SavedGardenItem = (props: SavedGardenItemProps) => {
  return <div
    className={`saved-garden-row ${props.gardenIsOpen ? "selected" : ""}`}>
    <Row>
      <GardenInfo
        savedGarden={props.savedGarden}
        gardenIsOpen={props.gardenIsOpen}
        plantCount={props.plantCount}
        dispatch={props.dispatch} />
      <Col xs={6}>
        <DestroyGardenButton
          dispatch={props.dispatch}
          gardenUuid={props.savedGarden.uuid} />
        <ApplyGardenButton
          dispatch={props.dispatch}
          plantsInGarden={props.plantsInGarden}
          gardenId={props.savedGarden.body.id || -1} />
        <GardenViewButton
          dispatch={props.dispatch}
          savedGarden={props.savedGarden.uuid}
          gardenIsOpen={props.gardenIsOpen} />
      </Col>
    </Row>
  </div>;
};

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
          plantCount={props.plantTemplates.filter(pt =>
            pt.body.saved_garden_id === sg.body.id).length}
          plantsInGarden={props.plantsInGarden} />;
      }
    })}
  </div>;
