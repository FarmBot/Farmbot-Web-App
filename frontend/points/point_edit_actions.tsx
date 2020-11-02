import React from "react";
import { t } from "../i18next_wrapper";
import { getDevice } from "../device";
import { destroy, edit, save } from "../api/crud";
import { ResourceColor } from "../interfaces";
import { TaggedGenericPointer, TaggedWeedPointer, Xyz } from "farmbot";
import { ListItem } from "../plants/plant_panel";
import { round, cloneDeep } from "lodash";
import { Row, Col, BlurableInput, ColorPicker } from "../ui";
import { parseIntInput } from "../util";
import { UUID } from "../resources/interfaces";
import { plantAge } from "../plants/map_state_to_props";
import { EditWeedStatus } from "../plants/edit_plant_status";
import {
  MEASURE_SOIL_HEIGHT_NAME, soilHeightPoint, toggleSoilHeight,
} from "./soil_height";

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

export interface EditPointPropertiesProps {
  point: TaggedGenericPointer | TaggedWeedPointer;
  updatePoint(update: PointUpdate): void;
}

export interface AdditionalWeedPropertiesProps {
  point: TaggedWeedPointer;
  updatePoint(update: PointUpdate): void;
}

export const EditPointProperties = (props: EditPointPropertiesProps) =>
  <ul>
    <li>
      <Row>
        <EditPointName
          name={props.point.body.name}
          updatePoint={props.updatePoint} />
        <EditPointColor
          color={props.point.body.meta.color}
          updatePoint={props.updatePoint} />
      </Row>
    </li>
    <ListItem name={t("Location")}>
      <EditPointLocation
        pointLocation={{
          x: props.point.body.x,
          y: props.point.body.y,
          z: props.point.body.z,
        }}
        updatePoint={props.updatePoint} />
    </ListItem>
    <ListItem name={t("Size")}>
      <EditPointRadius
        radius={props.point.body.radius}
        updatePoint={props.updatePoint} />
    </ListItem>
    {props.point.body.pointer_type == "GenericPointer" &&
      <ListItem>
        <EditPointSoilHeightTag
          point={props.point as TaggedGenericPointer}
          updatePoint={props.updatePoint} />
      </ListItem>}
  </ul>;

export const AdditionalWeedProperties = (props: AdditionalWeedPropertiesProps) =>
  <ul className="additional-weed-properties">
    <ListItem name={t("Age")}>
      {`${plantAge(props.point)} ${t("days old")}`}
    </ListItem>
    <ListItem name={t("Status")}>
      <EditWeedStatus weed={props.point} updateWeed={props.updatePoint} />
    </ListItem>
    {Object.entries(props.point.body.meta).map(([key, value]) => {
      switch (key) {
        case "color":
        case "type": return <div key={key}
          className={`meta-${key}-not-displayed`} />;
        case "created_by":
          return <ListItem name={t("Source")} key={key}>
            {SOURCE_LOOKUP()[value || ""] || t("unknown")}
          </ListItem>;
        case "removal_method":
          return <ListItem name={t("Removal method")} key={key}>
            <div className="weed-removal-method-section">
              {REMOVAL_METHODS.map(method =>
                <div className={"weed-removal-method"} key={method}>
                  <input type="radio" name="weed-removal-method"
                    checked={value == method}
                    onChange={() => {
                      const newMeta = cloneDeep(props.point.body.meta);
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

export const SOURCE_LOOKUP = (): Record<string, string> => ({
  "plant-detection": t("Weed Detector"),
  "farm-designer": t("Farm Designer"),
  [MEASURE_SOIL_HEIGHT_NAME]: t("Soil Height Detector"),
});

export interface PointActionsProps {
  x: number;
  y: number;
  z: number;
  uuid: UUID;
  dispatch: Function;
}

export const PointActions = ({ x, y, z, uuid, dispatch }: PointActionsProps) =>
  <div className={"point-actions"}>
    <button
      className="fb-button gray no-float"
      type="button"
      title={t("move to location")}
      onClick={() => getDevice().moveAbsolute({ x, y, z })}>
      {t("Move Device to location")}
    </button>
    <button
      className="fb-button red no-float"
      title={t("delete")}
      onClick={() => dispatch(destroy(uuid))}>
      {t("Delete")}
    </button>
  </div>;

export interface EditPointNameProps {
  updatePoint(update: PointUpdate): void;
  name: string;
}

export const EditPointName = (props: EditPointNameProps) =>
  <div className={"point-name-input"}>
    <Col xs={10}>
      <label>{t("Name")}</label>
      <BlurableInput
        type="text"
        name="name"
        value={props.name}
        onCommit={e => props.updatePoint({ name: e.currentTarget.value })} />
    </Col>
  </div>;

export interface EditPointLocationProps {
  updatePoint(update: PointUpdate): void;
  pointLocation: Record<Xyz, number>;
}

export const EditPointLocation = (props: EditPointLocationProps) =>
  <Row>
    {["x", "y", "z"].map((axis: Xyz) =>
      <Col xs={4} key={axis}>
        <label style={{ marginTop: 0 }}>{t("{{axis}} (mm)", { axis })}</label>
        <BlurableInput
          type="number"
          name={axis}
          value={props.pointLocation[axis]}
          min={axis == "z" ? undefined : 0}
          onCommit={e => props.updatePoint({
            [axis]: round(parseIntInput(e.currentTarget.value))
          })} />
      </Col>)}
  </Row>;

export interface EditPointRadiusProps {
  updatePoint(update: PointUpdate): void;
  radius: number;
}

export const EditPointRadius = (props: EditPointRadiusProps) =>
  <Row>
    <Col xs={6}>
      <label style={{ marginTop: 0 }}>{t("radius (mm)")}</label>
      <BlurableInput
        type="number"
        name="radius"
        value={props.radius}
        min={0}
        onCommit={e => props.updatePoint({
          radius: round(parseIntInput(e.currentTarget.value))
        })} />
    </Col>
  </Row>;

export interface EditPointColorProps {
  updatePoint(update: PointUpdate): void;
  color: string | undefined;
}

export const EditPointColor = (props: EditPointColorProps) =>
  <div className={"point-color-input"}>
    <Col xs={2}>
      <ColorPicker
        current={(props.color || "green") as ResourceColor}
        onChange={color => props.updatePoint({ meta: { color } })} />
    </Col>
  </div>;

export interface EditPointSoilHeightTagProps {
  updatePoint(update: PointUpdate): void;
  point: TaggedGenericPointer;
}

export const EditPointSoilHeightTag = (props: EditPointSoilHeightTagProps) =>
  <Row>
    <Col xs={6} className={"soil-height-checkbox"}>
      <label>{t("at soil level")}</label>
      <input type="checkbox" name="is_soil_height"
        onChange={() => props.updatePoint(toggleSoilHeight(props.point))}
        checked={soilHeightPoint(props.point)} />
    </Col>
  </Row>;
