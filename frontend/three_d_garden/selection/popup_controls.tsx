import React from "react";
import {
  FirmwareHardware, TaggedFbosConfig, TaggedPlantPointer, TaggedSequence,
  TaggedSceneObject, Vector3, Xyz,
} from "farmbot";
import moment from "moment";
import { isUndefined, round } from "lodash";
import { ThreeDObjectSelectionLayerProps } from "./props";
import {
  ResolvedLocationObject, ResolvedThreeDObject,
} from "./resolve";
import { TaggedPlant } from "../../farm_designer/map/interfaces";
import { PlantOptions } from "../../farm_designer/interfaces";
import { SlotWithTool } from "../../resources/interfaces";
import { t } from "../../i18next_wrapper";
import { Actions, Content, DeviceSetting } from "../../constants";
import { BooleanSetting } from "../../session_keys";
import { setWebAppConfigValue } from "../../config_storage/actions";
import { destroy, edit, save } from "../../api/crud";
import {
  findHome, moveToHome, powerOff, reboot, takePhoto,
} from "../../devices/actions";
import { resetVirtualTrail } from
  "../../farm_designer/map/layers/farmbot/bot_trail";
import {
  EditDatePlanted, EditPlantDepth, EditPlantRadius,
} from "../../plants/plant_panel";
import {
  EditPlantStatus, EditWeedStatus,
} from "../../plants/edit_plant_status";
import {
  EditPointColor, EditPointRadius, EditPointSoilHeightTag, updatePoint,
} from "../../points/point_edit_actions";
import { GoToThisLocationButton } from "../../farm_designer/move_to";
import {
  ToolInputRow, ToolSelection,
} from "../../tools/tool_slot_edit_components";
import { ToolVerification } from "../../tools/tool_verification";
import {
  BlurableInput, DropDownItem, FBSelect, Help, ToggleButton,
} from "../../ui";
import { XYZ } from "../../devices/constants";
import { betterCompact, parseIntInput } from "../../util";
import { getModifiedClassName } from
  "../../settings/fbos_settings/default_values";
import { getFwHardwareValue } from
  "../../settings/firmware/firmware_hardware_support";
import { cameraBtnProps } from
  "../../photos/capture_settings/camera_selection";
import { ToolActionRow } from "../../tools/tool_action_row";
import {
  sceneObjectShowsTextureAndColor, sceneObjectTextureChoices,
  validSceneObjectColor,
} from "../../scene_objects/appearance";
import { toggleSceneObjectVisibility } from "../../scene_objects/actions";

interface PopupControlProps extends ThreeDObjectSelectionLayerProps {
  object: ResolvedThreeDObject;
}

interface LocationControlProps extends ThreeDObjectSelectionLayerProps {
  object: ResolvedLocationObject;
}

interface GoButtonProps extends ThreeDObjectSelectionLayerProps {
  locationCoordinate: Vector3;
}

interface PopupLocationRowProps extends GoButtonProps {
  disabledAxes?: Xyz[];
  disabledValues?: Partial<Record<Xyz, string>>;
  onCoordinateCommit?(axis: Xyz, value: string): void;
}

const isPlantPointer = (plant: TaggedPlant): plant is TaggedPlantPointer =>
  plant.kind == "Point";

const GoButton = (props: GoButtonProps) =>
  props.dispatch &&
  <GoToThisLocationButton
    usePortal={false}
    dispatch={props.dispatch}
    locationCoordinate={props.locationCoordinate}
    botOnline={props.botOnline}
    arduinoBusy={props.arduinoBusy}
    currentBotLocation={props.currentBotLocation}
    movementState={props.movementState}
    noOptions={true}
    defaultAxes={props.defaultAxes} />;

const PopupLocationRow = (props: PopupLocationRowProps) =>
  <div className={"object-popup-location-row row grid-exp-2"}>
    <div className={"object-popup-coordinate-inputs row grid-3-col"}>
      {XYZ.map((axis: Xyz) =>
        <div key={axis} className={"grid half-gap"}>
          <label>{t("{{axis}} (mm)", { axis })}</label>
          {props.disabledAxes?.includes(axis)
            ? <input
              disabled={true}
              name={axis}
              value={props.disabledValues?.[axis]
                || props.locationCoordinate[axis]} />
            : <BlurableInput
              type={"number"}
              name={axis}
              value={props.locationCoordinate[axis]}
              min={axis == "z" ? undefined : 0}
              onCommit={e =>
                props.onCoordinateCommit?.(axis, e.currentTarget.value)} />}
        </div>)}
    </div>
    <GoButton {...props} />
  </div>;

const disabledObjectCoordinateAxes = (props: PopupControlProps): Xyz[] => {
  if (!props.dispatch) { return [...XYZ]; }
  if (props.object.kind == "slot"
    && props.object.slot.toolSlot.body.gantry_mounted) {
    return ["x"];
  }
  return [];
};

const updateToolSlot = (
  props: Pick<ThreeDObjectSelectionLayerProps, "dispatch">,
  slot: SlotWithTool,
  update: Partial<SlotWithTool["toolSlot"]["body"]>,
) => {
  props.dispatch?.(edit(slot.toolSlot, update));
  props.dispatch?.(save(slot.toolSlot.uuid));
};

const commitObjectCoordinate = (
  props: PopupControlProps,
  axis: Xyz,
  value: string,
) => {
  if (!props.dispatch) { return; }
  switch (props.object.kind) {
    case "plant":
      props.dispatch(edit(props.object.plant, {
        [axis]: parseIntInput(value),
      }));
      props.dispatch(save(props.object.plant.uuid));
      break;
    case "point":
      updatePoint(props.object.point, props.dispatch)({
        [axis]: round(parseIntInput(value)),
      });
      break;
    case "weed":
      updatePoint(props.object.weed, props.dispatch)({
        [axis]: round(parseIntInput(value)),
      });
      break;
    case "slot":
      updateToolSlot(props, props.object.slot, {
        [axis]: parseFloat(value),
      });
      break;
  }
};

export const PopupObjectLocationRow = (props: PopupControlProps) =>
  <PopupLocationRow
    {...props}
    locationCoordinate={props.object.locationCoordinate}
    disabledAxes={disabledObjectCoordinateAxes(props)}
    disabledValues={{ x: t("Gantry") }}
    onCoordinateCommit={(axis, value) =>
      commitObjectCoordinate(props, axis, value)} />;

export const PopupSelectedLocationRow = (props: LocationControlProps) =>
  <PopupLocationRow
    {...props}
    locationCoordinate={props.object.locationCoordinate}
    onCoordinateCommit={(axis, value) =>
      props.onUpdateLocationSelection({
        ...props.object.selection,
        [axis]: round(parseIntInput(value)),
      })} />;

const PlantPopupControls = (props: PopupControlProps) => {
  if (props.object.kind != "plant" || !props.dispatch) { return undefined; }
  const { plant } = props.object;
  const updatePlant = (uuid: string, update: PlantOptions) => {
    props.dispatch?.(edit(plant, update));
    props.dispatch?.(save(uuid));
  };
  const commonProps = { uuid: plant.uuid, updatePlant };
  return <>
    {props.timeSettings && isPlantPointer(plant) &&
      <div className={"row grid-2-col"}>
        <div className={"grid half-gap"}>
          <label>{t("Started")}</label>
          <EditDatePlanted
            {...commonProps}
            datePlanted={plant.body.planted_at
              ? moment(plant.body.planted_at)
              : undefined}
            timeSettings={props.timeSettings} />
        </div>
        <EditPlantStatus
          {...commonProps}
          usePortal={false}
          plantStatus={plant.body.plant_stage} />
      </div>}
    <div className={"row grid-2-col"}>
      <EditPlantRadius
        {...commonProps}
        radius={plant.body.radius} />
      {isPlantPointer(plant) && !isUndefined(plant.body.depth) &&
        <EditPlantDepth
          {...commonProps}
          depth={plant.body.depth} />}
    </div>
  </>;
};

const PointPopupControls = (props: PopupControlProps) => {
  if (props.object.kind != "point" || !props.dispatch) { return undefined; }
  const { point } = props.object;
  const update = updatePoint(point, props.dispatch);
  return <>
    <div className={"row grid-exp-2"}>
      <EditPointRadius
        radius={point.body.radius}
        updatePoint={update} />
      <EditPointSoilHeightTag
        point={point}
        updatePoint={update} />
    </div>
  </>;
};

const WeedPopupControls = (props: PopupControlProps) => {
  if (props.object.kind != "weed" || !props.dispatch) { return undefined; }
  const { weed } = props.object;
  const update = updatePoint(weed, props.dispatch);
  return <>
    <div className={"row grid-2-col"}>
      <div className={"grid half-gap"}>
        <label>{t("Status")}</label>
        <EditWeedStatus weed={weed} updateWeed={update} usePortal={false} />
      </div>
      <EditPointRadius
        radius={weed.body.radius}
        updatePoint={update} />
    </div>
  </>;
};

const SlotPopupControls = (props: PopupControlProps) => {
  if (props.object.kind != "slot" || !props.dispatch) { return undefined; }
  const { slot } = props.object;
  const isActive = (id: number | undefined) =>
    props.toolSlots.some(toolSlot =>
      toolSlot.toolSlot.body.tool_id == id
      && toolSlot.toolSlot.body.id != slot.toolSlot.body.id);
  return <>
    <ToolInputRow
      noUTM={props.noUTM}
      tools={props.tools}
      selectedTool={slot.tool}
      isActive={isActive}
      onChange={update => updateToolSlot(props, slot, update)} />
  </>;
};

const UtmPopupControls = (props: PopupControlProps) => {
  if (props.object.kind != "utm") { return undefined; }
  const mountedTool = props.tools.find(tool =>
    tool.body.id == props.deviceAccount?.body.mounted_tool_id);
  const isActive = (id: number | undefined) =>
    props.toolSlots.some(toolSlot =>
      toolSlot.toolSlot.body.tool_id == id);
  return <>
    <div className={"object-popup-mounted-tool-row row grid-2-col"}>
      <label>{t("Mounted Tool")}</label>
      <ToolSelection
        usePortal={false}
        tools={props.tools}
        selectedTool={mountedTool}
        onChange={({ tool_id }) => {
          if (!props.dispatch || !props.deviceAccount) { return; }
          props.dispatch(edit(props.deviceAccount, { mounted_tool_id: tool_id }));
          props.dispatch(save(props.deviceAccount.uuid));
        }}
        noUTM={props.noUTM}
        isActive={isActive}
        filterSelectedTool={true}
        filterActiveTools={false} />
    </div>
    <ToolActionRow
      className={"object-popup-tool-action-row"}
      mountedTool={mountedTool}
      sensors={props.sensors}
      peripherals={props.peripherals}
      peripheralValues={props.peripheralValues}
      botOnline={props.botOnline}
      arduinoBusy={props.arduinoBusy}
      locked={!!props.bot?.hardware.informational_settings.locked} />
    <div className={"object-popup-tool-verification-row"}>
      {props.bot &&
        <ToolVerification sensors={props.sensors} bot={props.bot} />}
    </div>
    <div className={"object-popup-trail-row row grid-exp-1"}>
      <label>{t(DeviceSetting.trail)}</label>
      <ToggleButton
        toggleValue={props.config.trail}
        toggleAction={() => {
          props.dispatch?.(setWebAppConfigValue(
            BooleanSetting.display_trail, !props.config.trail));
          resetVirtualTrail();
        }}
        disabled={!props.dispatch}
        title={`${t("toggle")} ${t(DeviceSetting.trail)}`}
        customText={{ textFalse: t("off"), textTrue: t("on") }} />
    </div>
    {props.set3DConfigValue &&
      <div className={"object-popup-laser-row row grid-exp-1"}>
        <label>{t("LASER")}</label>
        <ToggleButton
          toggleValue={props.config.laser}
          toggleAction={() => props.set3DConfigValue?.(
            "laser", props.config.laser ? "0" : "1")}
          title={`${t("toggle")} ${t("LASER")}`}
          customText={{ textFalse: t("off"), textTrue: t("on") }} />
      </div>}
    <UtmHomeRow {...props} />
  </>;
};

const UtmHomeRow = (props: PopupControlProps) => {
  const disabled = !props.botOnline || props.arduinoBusy
    || !!props.bot?.hardware.informational_settings.locked;
  return <div className={"object-popup-home-row row grid-exp-1"}>
    <label>{t("HOME")}</label>
    <div className={"object-popup-action-buttons row half-gap"}>
      <button type={"button"} className={"fb-button gray"} disabled={disabled}
        onClick={() => void moveToHome("all")}>
        {t("MOVE TO HOME")}
      </button>
      <button type={"button"} className={"fb-button gray"} disabled={disabled}
        onClick={() => void findHome("all")}>
        {t("FIND HOME")}
      </button>
    </div>
  </div>;
};

const CameraPopupControls = (props: PopupControlProps) => {
  if (props.object.kind != "camera") { return undefined; }
  const cameraButton = cameraBtnProps(props.env, props.botOnline);
  const photoTitle = cameraButton.title || t("Take a photo");
  const takePhotoClick = () => cameraButton.click
    ? cameraButton.click()
    : void takePhoto();
  return <>
    <div className={"object-popup-camera-row row grid-exp-1"}>
      <label>{t("Take photo")}</label>
      <button
        className={betterCompact([
          "fb-button green no-float",
          cameraButton.class,
        ]).join(" ")}
        type={"button"}
        onClick={takePhotoClick}
        title={photoTitle}>
        {t("Take photo")}
      </button>
    </div>
    <div className={"object-popup-camera-row row grid-exp-1"}>
      <label>{t(DeviceSetting.cameraView)}</label>
      <ToggleButton
        toggleValue={props.config.cameraView}
        toggleAction={() => props.dispatch?.(setWebAppConfigValue(
          BooleanSetting.show_camera_view_area, !props.config.cameraView))}
        disabled={!props.dispatch}
        title={`${t("toggle")} ${t(DeviceSetting.cameraView)}`}
        customText={{ textFalse: t("off"), textTrue: t("on") }} />
    </div>
    <div className={"object-popup-camera-row row grid-exp-1"}>
      <label>{t("FOLLOW CAMERA VIEW")}</label>
      <ToggleButton
        toggleValue={props.cameraFollow}
        toggleAction={() => props.dispatch?.({
          type: Actions.SET_3D_CAMERA_FOLLOW,
          payload: !props.cameraFollow,
        })}
        disabled={!props.dispatch}
        title={`${t("toggle")} ${t("FOLLOW CAMERA VIEW")}`}
        customText={{ textFalse: t("off"), textTrue: t("on") }} />
    </div>
  </>;
};

interface ElectronicsPopupButtonRowProps {
  botOnline: boolean;
  label: DeviceSetting;
  description: string;
  buttonText: string;
  color: string;
  action(): void;
}

const ElectronicsPopupButtonRow = (props: ElectronicsPopupButtonRowProps) =>
  <div className={"row grid-exp-1"}>
    <div className={"row half-gap grid-exp-2"}>
      <label>{t(props.label)}</label>
      <Help text={props.description} />
    </div>
    <button
      className={`fb-button ${props.color}`}
      type={"button"}
      onClick={props.action}
      title={t(props.buttonText)}
      disabled={!props.botOnline}>
      {t(props.buttonText)}
    </button>
  </div>;

const sequence2DropdownItem = (
  sequence: TaggedSequence,
): DropDownItem | undefined => {
  const emptyScope = (sequence.body.args.locals.body || []).length == 0;
  if (emptyScope && sequence.body.id) {
    return { label: sequence.body.name, value: sequence.body.id };
  }
};

interface PopupBootSequenceSelectorProps {
  dispatch: Function | undefined;
  fbosConfig: TaggedFbosConfig | undefined;
  sequences: TaggedSequence[];
}

const disabledBootSequenceRow = () =>
  <div className={"row grid-2-col"}>
    <label>{t("BOOT SEQUENCE")}</label>
    <input disabled={true} readOnly={true} value={t("Unavailable")} />
  </div>;

const PopupBootSequenceSelector = (props: PopupBootSequenceSelectorProps) => {
  const { dispatch, fbosConfig, sequences } = props;
  if (!dispatch || !fbosConfig) { return disabledBootSequenceRow(); }
  const list = betterCompact(sequences.map(sequence2DropdownItem));
  const bootSequenceId = fbosConfig.body.boot_sequence_id;
  const selectedSequence = sequences.filter(sequence =>
    sequence.body.id == bootSequenceId)[0];
  const selectedItem = selectedSequence
    ? sequence2DropdownItem(selectedSequence)
    : undefined;
  const firmwareHardware: FirmwareHardware | undefined =
    getFwHardwareValue(fbosConfig);
  return <div className={"row grid-2-col"}>
    <label>{t("BOOT SEQUENCE")}</label>
    <FBSelect
      usePortal={false}
      extraClass={getModifiedClassName("boot_sequence_id",
        selectedItem?.value, firmwareHardware)}
      allowEmpty={true}
      list={list}
      selectedItem={selectedItem}
      onChange={selected => {
        const boot_sequence_id = selected.isNull
          ? undefined
          : selected.value as number;
        dispatch(edit(fbosConfig, { boot_sequence_id }));
        dispatch(save(fbosConfig.uuid));
      }} />
  </div>;
};

const ElectronicsPopupControls = (props: PopupControlProps) => {
  if (props.object.kind != "electronics") { return undefined; }
  return <div className={"object-popup-electronics-controls grid"}>
    <ElectronicsPopupButtonRow
      botOnline={props.botOnline}
      label={DeviceSetting.restartFarmbot}
      description={Content.RESTART_FARMBOT}
      buttonText={"RESTART"}
      color={"yellow"}
      action={reboot} />
    <ElectronicsPopupButtonRow
      botOnline={props.botOnline}
      label={DeviceSetting.shutdownFarmbot}
      description={Content.SHUTDOWN_FARMBOT}
      buttonText={"SHUTDOWN"}
      color={"red"}
      action={powerOff} />
    <PopupBootSequenceSelector
      dispatch={props.dispatch}
      fbosConfig={props.fbosConfig}
      sequences={props.sequences} />
  </div>;
};

const updateSceneObject = (
  dispatch: Function,
  sceneObject: TaggedSceneObject,
  update: Partial<TaggedSceneObject["body"]>,
) => {
  dispatch(edit(sceneObject, update));
  dispatch(save(sceneObject.uuid));
};

const SceneObjectPopupControls = (props: PopupControlProps) => {
  if (props.object.kind != "sceneObject" || !props.dispatch) {
    return undefined;
  }
  const dispatch = props.dispatch;
  const { sceneObject } = props.object;
  if (!sceneObjectShowsTextureAndColor(sceneObject.body.shape)) {
    return undefined;
  }
  const texture = sceneObjectTextureChoices.find(item =>
    item.value == sceneObject.body.texture)
    || sceneObjectTextureChoices[0];
  return <>
    <div className={"object-popup-scene-object-row row grid-2-col"}>
      <label>{t("Texture")}</label>
      <FBSelect
        usePortal={false}
        list={sceneObjectTextureChoices}
        selectedItem={texture}
        onChange={item => updateSceneObject(
          dispatch,
          sceneObject,
          { texture: "" + item.value },
        )} />
    </div>
    <div className={"object-popup-scene-object-row row grid-2-col"}>
      <label htmlFor={"scene-object-popup-color"}>{t("Color")}</label>
      <input
        id={"scene-object-popup-color"}
        name={"color"}
        type={"color"}
        value={validSceneObjectColor(sceneObject.body.color)}
        onChange={event => updateSceneObject(
          dispatch,
          sceneObject,
          { color: event.currentTarget.value },
        )} />
    </div>
  </>;
};

const BED_POPUP_FIELDS = [
  {
    configKey: "bedWallThickness",
    label: DeviceSetting.bedWallThickness,
  },
  {
    configKey: "bedHeight",
    label: DeviceSetting.bedHeight,
  },
  {
    configKey: "bedZOffset",
    label: DeviceSetting.bedZOffset,
  },
  {
    configKey: "ccSupportSize",
    label: DeviceSetting.ccSupportSize,
  },
  {
    configKey: "legSize",
    label: DeviceSetting.legSize,
  },
] as const;

const BedPopupControls = (props: PopupControlProps) => {
  if (props.object.kind != "bed") { return undefined; }
  return <table className={"object-popup-bed-table"}>
    <tbody>
      {BED_POPUP_FIELDS.map(({ configKey, label }) =>
        <tr key={configKey}>
          <th>
            <label htmlFor={`bed-popup-${configKey}`}>{t(label)}</label>
          </th>
          <td>
            <BlurableInput
              id={`bed-popup-${configKey}`}
              name={configKey}
              type={"number"}
              min={0}
              disabled={!props.set3DConfigValue}
              value={props.config[configKey]}
              onCommit={event => props.set3DConfigValue?.(
                configKey, event.currentTarget.value)} />
          </td>
        </tr>)}
    </tbody>
  </table>;
};

export const ObjectPopupControls = (props: PopupControlProps) => {
  switch (props.object.kind) {
    case "plant": return <PlantPopupControls {...props} />;
    case "point": return <PointPopupControls {...props} />;
    case "weed": return <WeedPopupControls {...props} />;
    case "slot": return <SlotPopupControls {...props} />;
    case "utm": return <UtmPopupControls {...props} />;
    case "electronics": return <ElectronicsPopupControls {...props} />;
    case "camera": return <CameraPopupControls {...props} />;
    case "connectivity": return <></>;
    case "sceneObject": return <SceneObjectPopupControls {...props} />;
    case "bed": return <BedPopupControls {...props} />;
  }
};

export const ObjectPopupHeaderColor = (props: PopupControlProps) => {
  if (!props.dispatch) { return undefined; }
  const point = (() => {
    switch (props.object.kind) {
      case "point": return props.object.point;
      case "weed": return props.object.weed;
      default: return undefined;
    }
  })();
  if (!point) { return undefined; }
  const update = updatePoint(point, props.dispatch);
  return <EditPointColor
    color={point.body.meta.color}
    updatePoint={update} />;
};

export const ObjectPopupVisibilityButton = (props: PopupControlProps) => {
  if (!props.dispatch || props.object.kind != "sceneObject") {
    return undefined;
  }
  const dispatch = props.dispatch;
  const { sceneObject } = props.object;
  return <button
    type={"button"}
    className={[
      "fa",
      sceneObject.body.show ? "fa-eye" : "fa-eye-slash",
      "fb-icon-button",
      "invert",
    ].join(" ")}
    title={sceneObject.body.show ? t("hide") : t("show")}
    onClick={() =>
      toggleSceneObjectVisibility(dispatch, sceneObject)} />;
};

export const ObjectPopupCopyButton = (props: PopupControlProps) => {
  if (props.object.kind != "sceneObject") { return undefined; }
  const { sceneObject } = props.object;
  return <button
    type={"button"}
    className={"fa fa-copy fb-icon-button invert"}
    title={t("copy scene object")}
    onClick={() => props.onCopySceneObject(sceneObject)} />;
};

type DeletableResolvedThreeDObject = Exclude<
  ResolvedThreeDObject,
  { kind: "utm" } | { kind: "electronics" } | { kind: "camera" }
  | { kind: "connectivity" } | { kind: "bed" }
>;

const objectUuid = (object: DeletableResolvedThreeDObject) => {
  switch (object.kind) {
    case "plant": return object.plant.uuid;
    case "point": return object.point.uuid;
    case "weed": return object.weed.uuid;
    case "slot": return object.slot.toolSlot.uuid;
    case "sceneObject": return object.sceneObject.uuid;
  }
};

export const ObjectPopupDeleteButton = (props: PopupControlProps) => {
  const object = props.object;
  if (!props.dispatch
    || object.kind == "utm"
    || object.kind == "electronics"
    || object.kind == "camera"
    || object.kind == "connectivity"
    || object.kind == "bed") {
    return undefined;
  }
  return <button
    type={"button"}
    className={"fa fa-trash fb-icon-button invert"}
    title={t("delete")}
    onClick={() => {
      props.dispatch?.(destroy(objectUuid(object)));
      props.onClosePopup();
    }} />;
};
