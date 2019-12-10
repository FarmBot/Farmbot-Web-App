import * as React from "react";
import { t } from "../../i18next_wrapper";
import { getDevice } from "../../device";
import { destroy, edit, save } from "../../api/crud";
import { ResourceColor } from "../../interfaces";
import { TaggedGenericPointer } from "farmbot";
import { ListItem } from "../plants/plant_panel";
import { round } from "lodash";
import { Row, Col, BlurableInput, ColorPicker } from "../../ui";
import { parseIntInput } from "../../util";
import { UUID } from "../../resources/interfaces";

export const updatePoint =
  (point: TaggedGenericPointer | undefined, dispatch: Function) =>
    (update: Partial<TaggedGenericPointer["body"]>) => {
      if (point) {
        dispatch(edit(point, update));
        dispatch(save(point.uuid));
      }
    };

export interface EditPointPropertiesProps {
  point: TaggedGenericPointer;
  updatePoint(update: Partial<TaggedGenericPointer["body"]>): void;
}

export const EditPointProperties = (props: EditPointPropertiesProps) =>
  <ul>
    <li>
      <div>
        <EditPointName
          name={props.point.body.name}
          updatePoint={props.updatePoint} />
      </div>
    </li>
    <ListItem name={t("Location")}>
      <EditPointLocation
        location={{ x: props.point.body.x, y: props.point.body.y }}
        updatePoint={props.updatePoint} />
    </ListItem>
    <ListItem name={t("Size")}>
      <EditPointRadius
        radius={props.point.body.radius}
        updatePoint={props.updatePoint} />
    </ListItem>
    <ListItem name={t("Color")}>
      <EditPointColor
        color={props.point.body.meta.color}
        updatePoint={props.updatePoint} />
    </ListItem>
  </ul>;

export interface PointActionsProps {
  x: number;
  y: number;
  z: number;
  uuid: UUID;
  dispatch: Function;
}

export const PointActions = ({ x, y, z, uuid, dispatch }: PointActionsProps) =>
  <div>
    <button
      className="fb-button gray no-float"
      type="button"
      onClick={() => getDevice().moveAbsolute({ x, y, z })}>
      {t("Move Device to location")}
    </button>
    <button
      className="fb-button red no-float"
      onClick={() => dispatch(destroy(uuid))}>
      {t("Delete")}
    </button>
  </div>;

export interface EditPointNameProps {
  updatePoint(update: Partial<TaggedGenericPointer["body"]>): void;
  name: string;
}

export const EditPointName = (props: EditPointNameProps) =>
  <Row>
    <Col xs={12}>
      <label>{t("Name")}</label>
      <BlurableInput
        type="text"
        value={props.name}
        onCommit={e => props.updatePoint({ name: e.currentTarget.value })} />
    </Col>
  </Row>;

export interface EditPointLocationProps {
  updatePoint(update: Partial<TaggedGenericPointer["body"]>): void;
  location: Record<"x" | "y", number>;
}

export const EditPointLocation = (props: EditPointLocationProps) =>
  <Row>
    {["x", "y"].map((axis: "x" | "y") =>
      <Col xs={6} key={axis}>
        <label style={{ marginTop: 0 }}>{t("{{axis}} (mm)", { axis })}</label>
        <BlurableInput
          type="number"
          value={props.location[axis]}
          min={0}
          onCommit={e => props.updatePoint({
            [axis]: round(parseIntInput(e.currentTarget.value))
          })} />
      </Col>)}
  </Row>;

export interface EditPointRadiusProps {
  updatePoint(update: Partial<TaggedGenericPointer["body"]>): void;
  radius: number;
}

export const EditPointRadius = (props: EditPointRadiusProps) =>
  <Row>
    <Col xs={6}>
      <label style={{ marginTop: 0 }}>{t("radius (mm)")}</label>
      <BlurableInput
        type="number"
        value={props.radius}
        min={0}
        onCommit={e => props.updatePoint({
          radius: round(parseIntInput(e.currentTarget.value))
        })} />
    </Col>
  </Row>;

export interface EditPointColorProps {
  updatePoint(update: Partial<TaggedGenericPointer["body"]>): void;
  color: string | undefined;
}

export const EditPointColor = (props: EditPointColorProps) =>
  <Row>
    <ColorPicker
      current={(props.color || "green") as ResourceColor}
      onChange={color => props.updatePoint({ meta: { color } })} />
  </Row>;
