import React from "react";
import { Html } from "@react-three/drei";
import type { BotPosition } from "../../devices/interfaces";
import type { MovementState } from "../../interfaces";
import type { PlantStage, Vector3 } from "farmbot";
import { EditPlantStatus } from "../../plants/edit_plant_status";
import { GoToThisLocationButton } from "../../farm_designer/move_to";
import { t } from "../../i18next_wrapper";
import type { UpdatePlant } from "../../plants/plant_info";
import { useNavigate } from "react-router";
import { Path } from "../../internal_urls";
import { setPanelOpen } from "../../farm_designer/panel_header";

export interface PlantPopupActions {
  updatePlant: UpdatePlant;
  onDelete(plantUuid: string): void;
  dispatch: Function;
  botOnline: boolean;
  arduinoBusy: boolean;
  currentBotLocation: BotPosition;
  movementState: MovementState;
  defaultAxes: string;
}

export interface PlantPopupProps extends PlantPopupActions {
  position: [number, number, number];
  plantName: string;
  plantStatus: PlantStage;
  plantUuid: string;
  plantId?: number;
  locationCoordinate: Vector3;
  expanded: boolean;
}

export const PlantPopup = (props: PlantPopupProps) => {
  const navigate = useNavigate();
  const stopPropagation = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  const popupClass = [
    "plant-popup",
    props.expanded ? "expanded" : "collapsed",
  ].join(" ");
  const deletePlant = () => props.onDelete(props.plantUuid);
  const openPlant = () => {
    if (!props.plantId) { return; }
    props.dispatch(setPanelOpen(true));
    navigate(Path.plants(props.plantId));
  };

  return <Html
    center={true}
    position={props.position}
    wrapperClass={"plant-popup-wrapper"}
    style={{
      transform: "translate(-50%, -100%)",
    }}>
    {!props.expanded &&
      <p className={"plant-popup-name-hover"}>{props.plantName}</p>}
    <div className={popupClass}
      onPointerDown={stopPropagation}
      onPointerMove={stopPropagation}>
      <div className={"plant-popup-body"} aria-hidden={!props.expanded}>
        <div className={"plant-popup-header row"}>
          <p className={"plant-popup-name-header"}>{props.plantName}</p>
          <div className={"row no-gap"}>
            {props.plantId &&
              <i title={t("open")}
                className={"fa fa-external-link fb-icon-button invert"}
                onClick={openPlant} />}
            <i title={t("delete")}
              className={"fa fa-trash fb-icon-button invert"}
              onClick={deletePlant} />
          </div>
        </div>
        <EditPlantStatus
          plantStatus={props.plantStatus}
          updatePlant={props.updatePlant}
          uuid={props.plantUuid} />
        <GoToThisLocationButton
          dispatch={props.dispatch}
          locationCoordinate={props.locationCoordinate}
          botOnline={props.botOnline}
          arduinoBusy={props.arduinoBusy}
          currentBotLocation={props.currentBotLocation}
          movementState={props.movementState}
          defaultAxes={props.defaultAxes} />
      </div>
    </div>
  </Html>;
};
