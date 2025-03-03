import React from "react";
import { t } from "../i18next_wrapper";
import { edit, save } from "../api/crud";
import { MovementState, ResourceColor } from "../interfaces";
import {
  TaggedGenericPointer, TaggedPoint, TaggedWeedPointer, Xyz,
} from "farmbot";
import { ListItem } from "../plants/plant_panel";
import { round, cloneDeep } from "lodash";
import { Row, BlurableInput, ColorPicker } from "../ui";
import { parseIntInput } from "../util";
import { plantAgeAndStage } from "../plants/map_state_to_props";
import { EditWeedStatus } from "../plants/edit_plant_status";
import {
  MEASURE_SOIL_HEIGHT_NAME, soilHeightPoint, toggleSoilHeight,
} from "./soil_height";
import { daysOldText } from "../plants/plant_inventory_item";
import { GoToThisLocationButton } from "../farm_designer/move_to";
import { BotPosition } from "../devices/interfaces";

type PointUpdate =
  Partial<TaggedGenericPointer["body"] | TaggedWeedPointer["body"]>;

export const updatePoint =
  (point: TaggedGenericPointer | TaggedWeedPointer | undefined,
    dispatch: Function) =>
    (update: PointUpdate) => {
      if (point) {
        dispatch(edit(point, update));
        dispatch(save(point.uuid));
      }
    };

interface EditPointPropertiesProps extends EditPointLocationBaseProps {
  point: TaggedGenericPointer;
}

export interface EditWeedPropertiesProps extends EditPointLocationBaseProps {
  weed: TaggedWeedPointer;
}

export const EditPointProperties = (props: EditPointPropertiesProps) =>
  <ul className="grid">
    <ListItem>
      <EditPointLocation
        pointLocation={{
          x: props.point.body.x,
          y: props.point.body.y,
          z: props.point.body.z,
        }}
        botOnline={props.botOnline}
        dispatch={props.dispatch}
        arduinoBusy={props.arduinoBusy}
        currentBotLocation={props.currentBotLocation}
        movementState={props.movementState}
        defaultAxes={props.defaultAxes}
        updatePoint={props.updatePoint} />
    </ListItem>
    <ListItem>
      <EditPointRadius
        radius={props.point.body.radius}
        updatePoint={props.updatePoint} />
    </ListItem>
    <ListItem>
      <EditPointSoilHeightTag
        point={props.point}
        updatePoint={props.updatePoint} />
    </ListItem>
    {Object.entries(props.point.body.meta).map(([key, value]) => {
      switch (key) {
        case "color":
        case "at_soil_level":
        case "removal_method":
        case "type":
        case "gridId":
          return <div key={key} style={{ display: "none" }}
            className={`meta-${key}-not-displayed`} />;
        case "created_by":
          return <ListItem name={t("Source")} key={key}>
            {lookupPointSource(value)}
          </ListItem>;
        default:
          return <ListItem key={key} name={key}>
            {value || ""}
          </ListItem>;
      }
    })}
  </ul>;

export const EditWeedProperties = (props: EditWeedPropertiesProps) =>
  <ul className="grid">
    <ListItem>
      <EditPointLocation
        pointLocation={{
          x: props.weed.body.x,
          y: props.weed.body.y,
          z: props.weed.body.z,
        }}
        botOnline={props.botOnline}
        dispatch={props.dispatch}
        arduinoBusy={props.arduinoBusy}
        currentBotLocation={props.currentBotLocation}
        movementState={props.movementState}
        defaultAxes={props.defaultAxes}
        updatePoint={props.updatePoint} />
    </ListItem>
    <div className="row grid-exp-1 info-box">
      <div className="grid half-gap">
        <label>{t("Status")}</label>
        <EditWeedStatus weed={props.weed} updateWeed={props.updatePoint} />
      </div>
      <EditPointRadius
        radius={props.weed.body.radius}
        updatePoint={props.updatePoint} />
      <div className="grid half-gap">
        <label>{t("Age")}</label>
        {daysOldText(plantAgeAndStage(props.weed))}
      </div>
    </div>
    {Object.entries(props.weed.body.meta).map(([key, value]) => {
      switch (key) {
        case "color":
        case "type": return <div key={key} style={{ display: "none" }}
          className={`meta-${key}-not-displayed`} />;
        case "created_by":
          return <ListItem name={t("Source")} key={key}>
            {lookupPointSource(value)}
          </ListItem>;
        case "removal_method":
          return <ListItem name={t("Removal method")} key={key}>
            <div className="weed-removal-method-section">
              {REMOVAL_METHODS.map(method =>
                <div className={"weed-removal-method"} key={method}>
                  <input type="radio" name="weed-removal-method"
                    checked={value == method}
                    onChange={() => {
                      const newMeta = cloneDeep(props.weed.body.meta);
                      newMeta.removal_method = method;
                      props.updatePoint({ meta: newMeta });
                    }} />
                  <label>{t(method)}</label>
                </div>)}
            </div>
          </ListItem>;
        default:
          return <ListItem name={key} key={key}>
            {value || ""}
          </ListItem>;
      }
    })}
  </ul>;

const REMOVAL_METHODS = ["automatic", "manual"];

const SOURCE_LOOKUP = (): Record<string, string> => ({
  "plant-detection": t("Weed Detector"),
  "farm-designer": t("Farm Designer"),
  [MEASURE_SOIL_HEIGHT_NAME]: t("Soil Height Detector"),
});

export const lookupPointSource = (createdBy: string | undefined) =>
  SOURCE_LOOKUP()[createdBy || ""] || t("unknown");

export interface EditPointNameProps {
  updatePoint(update: PointUpdate): void;
  name: string;
}

export const EditPointName = (props: EditPointNameProps) =>
  <div className={"point-name-input row grid-exp-2"}>
    <label>{t("Name")}</label>
    <BlurableInput
      type="text"
      name="pointName"
      value={props.name}
      onCommit={e => props.updatePoint({ name: e.currentTarget.value })} />
  </div>;

interface EditPointLocationBaseProps {
  updatePoint(update: PointUpdate): void;
  botOnline: boolean;
  defaultAxes: string;
  arduinoBusy: boolean;
  dispatch: Function;
  currentBotLocation: BotPosition;
  movementState: MovementState;
}

export interface EditPointLocationProps extends EditPointLocationBaseProps {
  pointLocation: Record<Xyz, number>;
}

export const EditPointLocation = (props: EditPointLocationProps) =>
  <Row className={"edit-point-location"}>
    {["x", "y", "z"].map((axis: Xyz) =>
      <div key={axis}>
        <label style={{ marginTop: 0 }}>{t("{{axis}} (mm)", { axis })}</label>
        <BlurableInput
          type="number"
          name={axis}
          value={props.pointLocation[axis]}
          min={axis == "z" ? undefined : 0}
          onCommit={e => props.updatePoint({
            [axis]: round(parseIntInput(e.currentTarget.value))
          })} />
      </div>)}
    <GoToThisLocationButton
      dispatch={props.dispatch}
      locationCoordinate={props.pointLocation}
      botOnline={props.botOnline}
      arduinoBusy={props.arduinoBusy}
      currentBotLocation={props.currentBotLocation}
      movementState={props.movementState}
      defaultAxes={props.defaultAxes} />
  </Row>;

export interface EditPointRadiusProps {
  updatePoint(update: PointUpdate): void;
  radius: number;
}

export const EditPointRadius = (props: EditPointRadiusProps) =>
  <div className="grid half-gap">
    <label style={{ marginTop: 0 }}>{t("radius (mm)")}</label>
    <BlurableInput
      type="number"
      name="radius"
      value={props.radius}
      min={0}
      onCommit={e => props.updatePoint({
        radius: round(parseIntInput(e.currentTarget.value))
      })} />
  </div>;

export interface EditPointColorProps {
  updatePoint(update: PointUpdate): void;
  color: string | undefined;
}

export const EditPointColor = (props: EditPointColorProps) =>
  <div className={"point-color-input"}>
    <ColorPicker
      current={(props.color || "green") as ResourceColor}
      onChange={color => props.updatePoint({ meta: { color } })} />
  </div>;

export interface EditPointSoilHeightTagProps {
  updatePoint(update: PointUpdate): void;
  point: TaggedPoint;
}

export const EditPointSoilHeightTag = (props: EditPointSoilHeightTagProps) =>
  <Row className="grid-exp-1">
    <label>{t("at soil level")}</label>
    <input type="checkbox" name="is_soil_height"
      onChange={() => props.updatePoint(toggleSoilHeight(props.point))}
      checked={soilHeightPoint(props.point)} />
  </Row>;
