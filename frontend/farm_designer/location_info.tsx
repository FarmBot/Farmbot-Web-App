import React from "react";
import { Everything, TimeSettings } from "../interfaces";
import { BotPosition, UserEnv } from "../devices/interfaces";
import { connect } from "react-redux";
import { validBotLocationData } from "../util/util";
import {
  DesignerPanel, DesignerPanelContent, DesignerPanelHeader,
} from "./designer_panel";
import { t } from "../i18next_wrapper";
import { isBotOnlineFromState } from "../devices/must_be_online";
import { PanelColor } from "./panel_header";
import {
  maybeGetTimeSettings, selectAllGenericPointers, selectAllImages,
  selectAllPlantPointers, selectAllSensorReadings, selectAllSensors,
} from "../resources/selectors";
import { getSoilHeightColor, soilHeightPoint } from "../points/soil_height";
import {
  TaggedGenericPointer, TaggedImage, TaggedPlantPointer, TaggedPoint,
  TaggedSensor, TaggedSensorReading, Xyz,
} from "farmbot";
import { MoveToForm } from "./move_to";
import { Actions } from "../constants";
import { push } from "../history";
import { distance } from "../point_groups/paths";
import { isUndefined, noop, round, sortBy } from "lodash";
import { PlantInventoryItem } from "../plants/plant_inventory_item";
import { PointInventoryItem } from "../points/point_inventory_item";
import { FlipperImage } from "../photos/images/flipper_image";
import {
  GetWebAppConfigValue, getWebAppConfigValue,
} from "../config_storage/actions";
import { getEnv } from "../farmware/state_to_props";
import { TableRow } from "../sensors/sensor_readings/table";
import { unselectPlant } from "./map/actions";
import { Col, EmptyStateGraphic, EmptyStateWrapper, Row } from "../ui";
import { formatLogTime } from "../logs";
import moment from "moment";

export const mapStateToProps = (props: Everything): LocationInfoProps => ({
  chosenLocation: props.resources.consumers.farm_designer.chosenLocation,
  currentBotLocation: validBotLocationData(props.bot.hardware.location_data)
    .position,
  hoveredSensorReading: props.resources.consumers.farm_designer
    .hoveredSensorReading,
  dispatch: props.dispatch,
  botOnline: isBotOnlineFromState(props.bot),
  plants: selectAllPlantPointers(props.resources.index),
  genericPoints: selectAllGenericPointers(props.resources.index),
  sensorReadings: selectAllSensorReadings(props.resources.index),
  images: selectAllImages(props.resources.index),
  getConfigValue: getWebAppConfigValue(() => props),
  env: getEnv(props.resources.index),
  sensors: selectAllSensors(props.resources.index),
  timeSettings: maybeGetTimeSettings(props.resources.index),
});

export interface LocationInfoProps {
  chosenLocation: BotPosition;
  currentBotLocation: BotPosition;
  hoveredSensorReading: string | undefined;
  botOnline: boolean;
  dispatch: Function;
  plants: TaggedPlantPointer[];
  genericPoints: TaggedGenericPointer[];
  sensorReadings: TaggedSensorReading[];
  images: TaggedImage[];
  getConfigValue: GetWebAppConfigValue;
  env: UserEnv;
  sensors: TaggedSensor[];
  timeSettings: TimeSettings;
}

export const SORT_KEYS = ["points.body.created_at", "distance"];

export class RawLocationInfo extends React.Component<LocationInfoProps, {}> {

  componentDidMount() {
    unselectPlant(this.props.dispatch)();
  }

  componentWillUnmount() {
    this.props.dispatch({
      type: Actions.CHOOSE_LOCATION,
      payload: { x: undefined, y: undefined, z: undefined }
    });
  }

  render() {
    const chosenXY = !isUndefined(this.props.chosenLocation.x)
      && !isUndefined(this.props.chosenLocation.y)
      ? { x: this.props.chosenLocation.x, y: this.props.chosenLocation.y }
      : undefined;
    const allSoilHeightPoints = this.props.genericPoints
      .filter(p => soilHeightPoint(p));
    const getColorOverride = getSoilHeightColor(allSoilHeightPoints);
    const sensorReadings = this.props.sensorReadings
      .filter(p => p.body.pin != 63);
    const sensorNameByPinLookup: Record<number, string> = {};
    this.props.sensors.map(x => {
      sensorNameByPinLookup[x.body.pin || 0] = x.body.label;
    });
    return <DesignerPanel panelName={"location-info"} panelColor={PanelColor.gray}>
      <DesignerPanelHeader
        panelName={"location-info"}
        panelColor={PanelColor.gray}
        title={t("Location info")} />
      <DesignerPanelContent panelName={"location-info"}>
        <EmptyStateWrapper
          notEmpty={!isUndefined(this.props.chosenLocation.x)}
          title={t("No location chosen.")}
          text={t("Select a location in the map.")}
          colorScheme={"location"}
          graphic={EmptyStateGraphic.points}>
          <div className={"location-info-content"}>
            <LocationActions
              currentBotLocation={this.props.currentBotLocation}
              chosenLocation={this.props.chosenLocation}
              botOnline={this.props.botOnline}
              dispatch={this.props.dispatch} />
            <h1>{t("Nearby")}</h1>
            {[
              {
                title: t("Plants"),
                items: this.props.plants,
              },
              {
                title: t("Soil height measurements"),
                items: allSoilHeightPoints,
              },
              {
                title: t("Sensor readings"),
                items: sensorReadings,
              },
              {
                title: t("Images"),
                items: this.props.images,
              },
            ].map(resource =>
              <ItemListWrapper
                key={resource.title}
                items={resource.items}
                dispatch={this.props.dispatch}
                title={resource.title}
                timeSettings={this.props.timeSettings}
                sensorNameByPinLookup={sensorNameByPinLookup}
                hoveredSensorReading={this.props.hoveredSensorReading}
                getConfigValue={this.props.getConfigValue}
                env={this.props.env}
                getColorOverride={getColorOverride}
                chosenXY={chosenXY} />)}
          </div>
        </EmptyStateWrapper>
      </DesignerPanelContent>
    </DesignerPanel>;
  }
}

export const LocationInfo = connect(mapStateToProps)(RawLocationInfo);

type Item = TaggedPlantPointer
  | TaggedGenericPointer
  | TaggedSensorReading
  | TaggedImage;

const getLocation = (item: Item) => {
  switch (item.kind) {
    case "Image": return item.body.meta;
    default: return item.body;
  }
};

interface ItemData<T> {
  xy: Record<"x" | "y", number>;
  distance: number | undefined;
  items: T[];
}

export function groupItemsByLocation<T extends Item>(
  items: T[],
  chosenXY: Record<"x" | "y", number> | undefined,
) {
  const byLocation: Record<string, ItemData<T>> = {};
  items.map(item => {
    const itemLocation = getLocation(item);
    if (isUndefined(itemLocation.x) || isUndefined(itemLocation.y)) { return; }
    const roundedXY = {
      x: round(itemLocation.x, -1),
      y: round(itemLocation.y, -1),
    };
    if (Object.keys(byLocation).includes(JSON.stringify(roundedXY))) {
      byLocation[JSON.stringify(roundedXY)].items.push(item);
    } else {
      byLocation[JSON.stringify(roundedXY)] = {
        xy: roundedXY,
        distance: chosenXY ? distance(chosenXY, roundedXY) : undefined,
        items: [item],
      };
    }
  });
  return byLocation;
}

interface ItemListWrapperProps {
  items: Item[];
  dispatch: Function;
  title: string;
  getColorOverride(z: number): string;
  showZ?: boolean;
  timeSettings: TimeSettings;
  sensorNameByPinLookup: Record<number, string>,
  getConfigValue: GetWebAppConfigValue,
  env: UserEnv,
  chosenXY: Record<"x" | "y", number> | undefined;
  hoveredSensorReading: string | undefined;
}

function ItemListWrapper(props: ItemListWrapperProps) {
  const items = sortBy(groupItemsByLocation(props.items, props.chosenXY),
    SORT_KEYS);
  if (items.length < 1) { return <div className={"no-items"} />; }
  return <div className={"location-items-wrapper"}>
    <label>{props.title}</label>
    <div className={"location-items"}>
      {items.map(data => {
        const key = JSON.stringify(data.xy);
        if (isUndefined(data.distance)
          || (items[0].distance && data.distance > items[0].distance)) {
          return <div key={key} className={"no-items"} />;
        }
        const item = items[0].items[0];
        switch (item.kind) {
          case "Point":
            return (item as TaggedPoint).body.pointer_type == "Plant"
              ? <PlantListItem
                key={key}
                plants={data as ItemData<TaggedPlantPointer>}
                dispatch={props.dispatch} />
              : <SoilHeightListItem
                key={key}
                soilHeightPoints={data as ItemData<TaggedGenericPointer>}
                getColorOverride={props.getColorOverride}
                dispatch={props.dispatch} />;
          case "SensorReading":
            return <ReadingsListItem
              key={key}
              sensorReadings={data as ItemData<TaggedSensorReading>}
              dispatch={props.dispatch}
              timeSettings={props.timeSettings}
              hoveredSensorReading={props.hoveredSensorReading}
              sensorNameByPinLookup={props.sensorNameByPinLookup} />;
          case "Image":
            return <ImageListItem
              key={key}
              images={data as ItemData<TaggedImage>}
              dispatch={props.dispatch}
              getConfigValue={props.getConfigValue}
              chosenXY={props.chosenXY}
              timeSettings={props.timeSettings}
              env={props.env} />;
        }
      })}
    </div>
  </div>;
}

interface LocationDistanceProps {
  xy: Record<"x" | "y", number>;
  distance: number | undefined;
  soilZ?: number;
}

const LocationDistance = (props: LocationDistanceProps) =>
  <div className={"location-distance"}>
    <Row>
      <Col xs={3}>
        <p className={"title"}>{t("X axis")}</p>
      </Col>
      <Col xs={3}>
        <p className={"title"}>{t("Y axis")}</p>
      </Col>
      <Col xs={3}>
        <p className={"title"}>{t("Distance")}</p>
      </Col>
      {!isUndefined(props.soilZ) &&
        <Col xs={3}>
          <p className={"title"}>{t("Soil Z")}</p>
        </Col>}
    </Row>
    <Row>
      <Col xs={3}>
        <p>{props.xy.x}</p>
      </Col>
      <Col xs={3}>
        <p>{props.xy.y}</p>
      </Col>
      <Col xs={3}>
        <p>{round(props.distance || 0)}mm</p>
      </Col>
      {!isUndefined(props.soilZ) &&
        <Col xs={3}>
          <p>{!isUndefined(props.distance) && props.soilZ}mm</p>
        </Col>}
    </Row>
    <hr />
  </div>;

interface PlantListItemProps {
  plants: ItemData<TaggedPlantPointer>;
  dispatch: Function;
}

const PlantListItem = (props: PlantListItemProps) =>
  <div className={"plant-items"}>
    <LocationDistance xy={props.plants.xy} distance={props.plants.distance} />
    {props.plants.items.map(p =>
      <PlantInventoryItem
        key={p.uuid}
        plant={p}
        hovered={false}
        dispatch={props.dispatch} />)}
  </div>;

interface SoilHeightListItemProps {
  soilHeightPoints: ItemData<TaggedGenericPointer>;
  dispatch: Function;
  getColorOverride: Function;
}

const SoilHeightListItem = (props: SoilHeightListItemProps) =>
  <div className={"soil-height-items"}>
    <LocationDistance
      xy={props.soilHeightPoints.xy}
      soilZ={props.soilHeightPoints.items[0].body.z}
      distance={props.soilHeightPoints.distance} />
    {props.soilHeightPoints.items.map(p =>
      <PointInventoryItem
        key={p.uuid}
        tpp={p}
        hovered={false}
        colorOverride={props.getColorOverride(p.body.z)}
        dispatch={props.dispatch} />)}</div>;

interface ReadingsListItemProps {
  sensorReadings: ItemData<TaggedSensorReading>,
  dispatch: Function,
  timeSettings: TimeSettings,
  sensorNameByPinLookup: Record<number, string>,
  hoveredSensorReading: string | undefined;
}

const ReadingsListItem = (props: ReadingsListItemProps) =>
  <div className={"sensor-reading-items"}>
    <LocationDistance
      xy={props.sensorReadings.xy}
      distance={props.sensorReadings.distance} />
    <div className="sensor-history-table">
      <table className="sensor-history-table-contents">
        <tbody>
          {props.sensorReadings.items.map(item => {
            const pin = item.body.pin;
            const sensorName = `${props.sensorNameByPinLookup[pin]} (pin ${pin})`;
            return <TableRow
              key={item.uuid}
              sensorName={sensorName}
              sensorReading={item}
              timeSettings={props.timeSettings}
              period={"current"}
              hideLocation={true}
              hover={hovered => props.dispatch({
                type: Actions.HOVER_SENSOR_READING,
                payload: hovered,
              })}
              hovered={props.hoveredSensorReading} />;
          })}
        </tbody>
      </table>
    </div>
  </div>;

interface ImageListItemProps {
  images: ItemData<TaggedImage>;
  dispatch: Function;
  getConfigValue: GetWebAppConfigValue;
  env: UserEnv;
  chosenXY: Record<"x" | "y", number> | undefined;
  timeSettings: TimeSettings;
}

const ImageListItem = (props: ImageListItemProps) =>
  <div className={"image-items"}>
    <LocationDistance
      xy={props.images.xy}
      distance={props.images.distance} />
    <div className={"horizontal-scroll"}>
      {sortBy(props.images.items, "body.created_at").reverse().map(image =>
        <div className={"image-item"}
          key={image.body.attachment_url}>
          <FlipperImage
            crop={true}
            transformImage={true}
            dispatch={props.dispatch}
            getConfigValue={props.getConfigValue}
            flipperId={image.uuid}
            env={props.env}
            onImageLoad={noop}
            hover={hovered => props.dispatch({
              type: Actions.HOVER_IMAGE,
              payload: hovered,
            })}
            target={props.chosenXY}
            image={image} />
          <p>
            {formatLogTime(moment(image.body.created_at).unix(),
              props.timeSettings)}
          </p>
        </div>)}
    </div>
  </div>;

export const LocationInfoModeLink = () =>
  <div className={"location-info-mode"}>
    <button
      className={"fb-button gray"}
      title={t("open location info panel")}
      onClick={() => push("/app/designer/location_info")}>
      {t("location info")}
    </button>
  </div>;

interface LocationActionsProps {
  dispatch: Function;
  currentBotLocation: Record<Xyz, number | undefined>;
  botOnline: boolean;
  chosenLocation: Record<Xyz, number | undefined>;
}

const LocationActions = (props: LocationActionsProps) =>
  <div className={"location-actions"}>
    <MoveToForm
      chosenLocation={props.chosenLocation}
      currentBotLocation={props.currentBotLocation}
      botOnline={props.botOnline} />
    {!isUndefined(props.currentBotLocation.x)
      && !isUndefined(props.currentBotLocation.y)
      && !isUndefined(props.chosenLocation.x)
      && !isUndefined(props.chosenLocation.y) &&
      <p>{round(distance(
        { x: props.currentBotLocation.x, y: props.currentBotLocation.y },
        { x: props.chosenLocation.y, y: props.chosenLocation.y },
      ))}mm {t("from")} {t("FarmBot's current position")}
      &nbsp;({props.currentBotLocation.x}
      &nbsp;{props.currentBotLocation.y}
      &nbsp;{props.currentBotLocation.z})</p>}
    <button className={"fb-button gray add-point"}
      onClick={() => {
        props.dispatch({
          type: Actions.SET_DRAWN_POINT_DATA,
          payload: {
            cx: props.chosenLocation.x,
            cy: props.chosenLocation.x,
          }
        });
        push("/app/designer/points/add");
      }}>
      {t("Add point at this location")}
    </button>
  </div>;
