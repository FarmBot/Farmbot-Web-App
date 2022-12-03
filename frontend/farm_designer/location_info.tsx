import React from "react";
import { Everything, MovementState, TimeSettings } from "../interfaces";
import { BotPosition, UserEnv } from "../devices/interfaces";
import { connect } from "react-redux";
import { getUrlQuery } from "../util";
import { validBotLocationData } from "../util/location";
import {
  DesignerPanel, DesignerPanelContent, DesignerPanelHeader,
} from "./designer_panel";
import { t } from "../i18next_wrapper";
import { isBotOnlineFromState } from "../devices/must_be_online";
import { PanelColor } from "./panel_header";
import {
  maybeGetTimeSettings, selectAllFarmwareEnvs, selectAllGenericPointers,
  selectAllImages,
  selectAllPlantPointers, selectAllSensorReadings, selectAllSensors,
} from "../resources/selectors";
import { getSoilHeightColor, soilHeightPoint } from "../points/soil_height";
import {
  TaggedFarmwareEnv,
  TaggedGenericPointer, TaggedImage, TaggedPlantPointer, TaggedPoint,
  TaggedSensor, TaggedSensorReading,
} from "farmbot";
import {
  chooseLocationAction, MoveToForm, unChooseLocationAction, validGoButtonAxes,
} from "./move_to";
import { Actions } from "../constants";
import { push } from "../history";
import { distance } from "../point_groups/paths";
import { isUndefined, round, sortBy, sum } from "lodash";
import { PlantInventoryItem } from "../plants/plant_inventory_item";
import { PointInventoryItem } from "../points/point_inventory_item";
import {
  GetWebAppConfigValue, getWebAppConfigValue,
} from "../config_storage/actions";
import { getEnv } from "../farmware/state_to_props";
import { TableRow } from "../sensors/sensor_readings/table";
import { unselectPlant } from "./map/actions";
import { EmptyStateGraphic, EmptyStateWrapper, ExpandableHeader } from "../ui";
import {
  fetchInterpolationOptions, interpolatedZ,
} from "./map/layers/points/interpolation_map";
import { Collapse } from "@blueprintjs/core";
import { ImageFlipper } from "../photos/images/image_flipper";
import { PhotoFooter } from "../photos/images/photos";
import { Path } from "../internal_urls";

export const mapStateToProps = (props: Everything): LocationInfoProps => ({
  chosenLocation: props.resources.consumers.farm_designer.chosenLocation,
  currentBotLocation: validBotLocationData(props.bot.hardware.location_data)
    .position,
  hoveredSensorReading: props.resources.consumers.farm_designer
    .hoveredSensorReading,
  dispatch: props.dispatch,
  botOnline: isBotOnlineFromState(props.bot),
  locked: props.bot.hardware.informational_settings.locked,
  plants: selectAllPlantPointers(props.resources.index),
  genericPoints: selectAllGenericPointers(props.resources.index),
  sensorReadings: selectAllSensorReadings(props.resources.index),
  images: selectAllImages(props.resources.index),
  getConfigValue: getWebAppConfigValue(() => props),
  env: getEnv(props.resources.index),
  farmwareEnvs: selectAllFarmwareEnvs(props.resources.index),
  sensors: selectAllSensors(props.resources.index),
  timeSettings: maybeGetTimeSettings(props.resources.index),
  arduinoBusy: props.bot.hardware.informational_settings.busy,
  movementState: props.app.movement,
});

export interface LocationInfoProps {
  chosenLocation: BotPosition;
  currentBotLocation: BotPosition;
  hoveredSensorReading: string | undefined;
  botOnline: boolean;
  locked: boolean;
  dispatch: Function;
  plants: TaggedPlantPointer[];
  genericPoints: TaggedGenericPointer[];
  sensorReadings: TaggedSensorReading[];
  images: TaggedImage[];
  getConfigValue: GetWebAppConfigValue;
  env: UserEnv;
  sensors: TaggedSensor[];
  timeSettings: TimeSettings;
  farmwareEnvs: TaggedFarmwareEnv[];
  arduinoBusy: boolean;
  movementState: MovementState;
}

export class RawLocationInfo extends React.Component<LocationInfoProps, {}> {

  get chosenXY() {
    return !isUndefined(this.props.chosenLocation.x)
      && !isUndefined(this.props.chosenLocation.y)
      ? { x: this.props.chosenLocation.x, y: this.props.chosenLocation.y }
      : undefined;
  }

  componentDidMount() {
    unselectPlant(this.props.dispatch)();
    const x = getUrlQuery("x");
    const y = getUrlQuery("y");
    const z = getUrlQuery("z") || "0";
    !this.chosenXY && !isUndefined(x) && !isUndefined(y) &&
      this.props.dispatch(chooseLocationAction({
        x: parseFloat(x), y: parseFloat(y), z: parseFloat(z)
      }));
  }

  componentWillUnmount() {
    this.props.dispatch(unChooseLocationAction());
  }

  render() {
    const { chosenXY } = this;
    const allSoilHeightPoints = this.props.genericPoints.filter(soilHeightPoint);
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
        backTo={Path.plants()}
        title={chosenXY ? `(${chosenXY.x}, ${chosenXY.y})` : t("Location info")} />
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
              locked={this.props.locked}
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
                arduinoBusy={this.props.arduinoBusy}
                currentBotLocation={this.props.currentBotLocation}
                movementState={this.props.movementState}
                title={resource.title}
                timeSettings={this.props.timeSettings}
                sensorNameByPinLookup={sensorNameByPinLookup}
                hoveredSensorReading={this.props.hoveredSensorReading}
                getConfigValue={this.props.getConfigValue}
                env={this.props.env}
                farmwareEnvs={this.props.farmwareEnvs}
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

function groupItemsByLocation<T extends Item>(
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

export function selectMostRecentPoints
  <T extends (TaggedGenericPointer | TaggedSensorReading)>(points: T[]) {
  return Object.values(groupItemsByLocation(points, undefined))
    .map(data => sortBy(data.items, "body.updated_at").reverse()[0]);
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
  farmwareEnvs: TaggedFarmwareEnv[];
  arduinoBusy: boolean;
  currentBotLocation: BotPosition;
  movementState: MovementState;
}

function ItemListWrapper(props: ItemListWrapperProps) {
  const { chosenXY } = props;
  const items = sortBy(groupItemsByLocation(props.items, chosenXY), "distance");
  const [expanded, setExpanded] = React.useState(false);
  if (items.length < 1) {
    return <label className={"no-items"}>
      {`${props.title} (0)`}
    </label>;
  }
  const hide = (distance: number | undefined) => isUndefined(distance) ||
    (!isUndefined(items[0].distance) && distance > items[0].distance);
  const title = `${props.title} (${sum(items.filter(data =>
    !hide(data.distance)).map(item => item.items.length))})`;
  const firstItem = items[0].items[0];
  const options = fetchInterpolationOptions(props.farmwareEnvs);
  const interpolationPoints =
    selectMostRecentPoints(props.items as TaggedGenericPointer[]);
  return <div className={"location-items-wrapper"}>
    <ExpandableHeader title={title} expanded={expanded}
      onClick={() => setExpanded(!expanded)} />
    <Collapse isOpen={expanded}>
      <div className={"location-items"}>
        {firstItem.kind == "Point" &&
          firstItem.body.pointer_type == "GenericPointer" &&
          chosenXY &&
          <div className={"interpolated-soil-height"}>
            <p className={"title"}>
              {t("Interpolated Soil Z at")} ({chosenXY.x}, {chosenXY.y}):
            </p>
            <p>{interpolatedZ(chosenXY, interpolationPoints, options)}mm</p>
          </div>}
        {items.map(data => {
          const key = JSON.stringify(data.xy);
          if (hide(data.distance)) {
            return <div key={key} className={"no-items"} />;
          }
          switch (firstItem.kind) {
            case "Point":
              return (firstItem as TaggedPoint).body.pointer_type == "Plant"
                ? <PlantListItem
                  key={key}
                  plants={data as ItemData<TaggedPlantPointer>}
                  dispatch={props.dispatch} />
                : <SoilHeightListItem
                  key={key}
                  chosenXY={chosenXY}
                  soilHeightPoints={data as ItemData<TaggedGenericPointer>}
                  allSoilHeightPoints={props.items as TaggedGenericPointer[]}
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
                chosenXY={chosenXY}
                arduinoBusy={props.arduinoBusy}
                currentBotLocation={props.currentBotLocation}
                movementState={props.movementState}
                timeSettings={props.timeSettings}
                env={props.env} />;
          }
        })}
      </div>
    </Collapse>
  </div>;
}

interface PlantListItemProps {
  plants: ItemData<TaggedPlantPointer>;
  dispatch: Function;
}

const PlantListItem = (props: PlantListItemProps) =>
  <div className={"plant-items"}>
    {props.plants.items.map(p =>
      <PlantInventoryItem
        key={p.uuid}
        plant={p}
        hovered={false}
        distance={props.plants.distance}
        dispatch={props.dispatch} />)}
  </div>;

interface SoilHeightListItemProps {
  soilHeightPoints: ItemData<TaggedGenericPointer>;
  allSoilHeightPoints: TaggedGenericPointer[];
  dispatch: Function;
  getColorOverride: Function;
  chosenXY: Record<"x" | "y", number> | undefined;
}

const SoilHeightListItem = (props: SoilHeightListItemProps) => {
  const { items, distance } = props.soilHeightPoints;
  return <div className={"soil-height-items"}>
    {items.map(p =>
      <PointInventoryItem
        key={p.uuid}
        tpp={p}
        hovered={false}
        colorOverride={props.getColorOverride(p.body.z)}
        distance={distance}
        dispatch={props.dispatch} />)}
  </div>;
};

interface ReadingsListItemProps {
  sensorReadings: ItemData<TaggedSensorReading>,
  dispatch: Function,
  timeSettings: TimeSettings,
  sensorNameByPinLookup: Record<number, string>,
  hoveredSensorReading: string | undefined;
}

const ReadingsListItem = (props: ReadingsListItemProps) =>
  <div className={"sensor-reading-items"}>
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
              distance={props.sensorReadings.distance}
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

export interface ImageListItemProps {
  images: ItemData<TaggedImage>;
  dispatch: Function;
  getConfigValue: GetWebAppConfigValue;
  env: UserEnv;
  chosenXY: Record<"x" | "y", number> | undefined;
  timeSettings: TimeSettings;
  arduinoBusy: boolean;
  currentBotLocation: BotPosition;
  movementState: MovementState;
}

export const ImageListItem = (props: ImageListItemProps) => {
  const images = sortBy(props.images.items, "body.created_at").reverse();
  const [currentImage, setCurrentImage] = React.useState(images[0]);
  return <div className={"image-items"}>
    <ImageFlipper id={"image-items-flipper"}
      currentImage={currentImage}
      dispatch={props.dispatch}
      flipActionOverride={nextIndex => setCurrentImage(images[nextIndex])}
      currentImageSize={{ width: undefined, height: undefined }}
      transformImage={true}
      getConfigValue={props.getConfigValue}
      env={props.env}
      crop={true}
      hover={hovered => props.dispatch({
        type: Actions.HOVER_IMAGE,
        payload: hovered,
      })}
      target={props.chosenXY}
      images={images} />
    <PhotoFooter
      image={images[0]}
      botOnline={false}
      distance={props.images.distance}
      arduinoBusy={props.arduinoBusy}
      currentBotLocation={props.currentBotLocation}
      movementState={props.movementState}
      defaultAxes={validGoButtonAxes(props.getConfigValue)}
      dispatch={props.dispatch}
      timeSettings={props.timeSettings} />
  </div>;
};

interface LocationActionsProps {
  dispatch: Function;
  currentBotLocation: BotPosition;
  botOnline: boolean;
  locked: boolean;
  chosenLocation: BotPosition;
}

const LocationActions = (props: LocationActionsProps) =>
  <div className={"location-actions"}>
    <MoveToForm
      chosenLocation={props.chosenLocation}
      currentBotLocation={props.currentBotLocation}
      locked={props.locked}
      dispatch={props.dispatch}
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
            cy: props.chosenLocation.y,
          }
        });
        push(Path.points("add"));
      }}>
      {t("Add point at this location")}
    </button>
  </div>;
