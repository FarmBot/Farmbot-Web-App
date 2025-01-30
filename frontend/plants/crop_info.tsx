import React from "react";
import {
  CropInfoProps, DesignerState,
} from "../farm_designer/interfaces";
import { connect } from "react-redux";
import { Everything } from "../interfaces";
import { unselectPlant, setDragIcon } from "../farm_designer/map/actions";
import { validBotLocationData } from "../util/location";
import { createPlant } from "../farm_designer/map/layers/plants/plant_actions";
import { round } from "../farm_designer/map/util";
import { BotPosition } from "../devices/interfaces";
import {
  DesignerPanel, DesignerPanelHeader, DesignerPanelContent,
} from "../farm_designer/designer_panel";
import { Actions } from "../constants";
import { startCase, chain, isNumber } from "lodash";
import { t } from "../i18next_wrapper";
import { Panel } from "../farm_designer/panel_header";
import { PlantGrid } from "./grid/plant_grid";
import {
  GetWebAppConfigValue, getWebAppConfigValue,
} from "../config_storage/actions";
import { BooleanSetting, NumericSetting } from "../session_keys";
import { Path } from "../internal_urls";
import { Link } from "../link";
import { botSize } from "../farm_designer/state_to_props";
import { getFbosConfig } from "../resources/getters";
import { sourceFbosConfigValue } from "../settings/source_config_value";
import { validFbosConfig } from "../util";
import { selectAllCurves } from "../resources/selectors_by_kind";
import { selectAllPlantPointers } from "../resources/selectors";
import {
  AllCurveInfo, changeCurve, findCurve, findMostUsedCurveForCrop,
} from "./curve_info";
import { CurveType } from "../curves/templates";
import { BlurableInput, FBSelect, Popover } from "../ui";
import { PLANT_STAGE_DDI_LOOKUP, PLANT_STAGE_LIST } from "./edit_plant_status";
import moment from "moment";
import { Position } from "@blueprintjs/core";
import { findCrop, findIcon, findImage } from "../crops/find";
import { Crop } from "../crops/interfaces";
import { DEFAULT_PLANT_RADIUS } from "../farm_designer/plant";

interface InfoFieldProps {
  title: string;
  children?: React.ReactNode;
}

const EMOJI: { [field: string]: string } = {
  binomial_name: "🏷",
  common_names: "🪪",
  sun_requirements: "🌞",
  sowing_method: "🌱",
  spread: "🟢",
  row_spacing: "📏",
  height: "🌿",
  growing_degree_days: "🗓",
  companions: "🌈",
};

const shortenTitle = (title: string) => {
  switch (title) {
    case "sun_requirements": return "sun";
    case "sowing_method": return "sowing";
    default: return title;
  }
};

/** Basic field: value display for crop properties. */
const InfoField = (props: InfoFieldProps) =>
  <div className="grid no-gap info-box">
    <div className={"row grid-exp-2"}>
      <span>{EMOJI[props.title]}</span>
      <label>
        {t(startCase(shortenTitle(props.title)))}
      </label>
    </div>
    <div className={"crop-info-field-data"}>
      {props.children}
    </div>
  </div>;

const OMITTED_PROPERTIES = [
  "name",
  "description",
  "image",
  "icon",
  "companions",
];

const NO_VALUE = t("Not available");

interface SummaryItemPropsBase {
  key: string;
  i: number;
  field: string;
}

interface CmPropertyProps extends SummaryItemPropsBase {
  value: number;
}

interface CommonNamesProps extends SummaryItemPropsBase {
  value: string[];
}

interface DefaultPropertyDisplayProps extends SummaryItemPropsBase {
  value: string;
}

/**
 * Need to convert the `cm` provided by crop data to `mm`
 * to match the Farm Designer units.
 */
const CmProperty = ({ i, field, value }: CmPropertyProps) =>
  <InfoField key={i} title={field}>
    {value
      ? (value * 10) + t("mm")
      : NO_VALUE}
  </InfoField>;

/** Comma-separated list of crop common names. */
const CommonNames = ({ i, field, value }: CommonNamesProps) =>
  <InfoField key={i} title={field}>
    {value.join(", ") || NO_VALUE}
  </InfoField>;

/** Default behavior for all other properties. */
const DefaultPropertyDisplay = ({ i, field, value }: DefaultPropertyDisplayProps) =>
  <InfoField key={i} title={field}>
    {value || NO_VALUE}
  </InfoField>;

/** Choose the appropriate display function for the crop property. */
const handleDisplay = (
  [field, value]: [string, string | string[] | number],
  i: number,
) => {
  const commonProps: SummaryItemPropsBase = { key: field, i, field };
  switch (field) {
    case "spread":
    case "row_spacing":
    case "height":
      return <CmProperty {...commonProps} value={value as number} />;
    case "common_names":
      return <CommonNames {...commonProps} value={value as string[]} />;
    default:
      return <DefaultPropertyDisplay {...commonProps} value={value as string} />;
  }
};

interface CropInfoListProps {
  crop: Crop;
  dispatch: Function;
  selectMostUsedCurves(slug: string): void;
}

/** Display crop properties. */
const CropInfoList = (props: CropInfoListProps) => {
  return <div className="grid crop-info-grid">
    {chain(props.crop)
      .omit(OMITTED_PROPERTIES)
      .toPairs()
      .map(handleDisplay)
      .value()}
    <Companions {...props} />
  </div>;
};

/** Display companion plant list. */
const Companions = (props: CropInfoListProps) => {
  const { crop, dispatch } = props;
  const companions = crop.companions
    .filter(slug => findCrop(slug).name != "Generic plant");
  if (companions.length == 0) { return; }
  return <InfoField title={"companions"}>
    <div className="crop-companions">
      {companions.map((companionSlug, index) => {
        const companion = findCrop(companionSlug);
        return <Link key={companionSlug}
          className={"companion"}
          onClick={() => {
            unselectPlant(dispatch)();
            props.selectMostUsedCurves(companionSlug);
          }}
          onDragStart={() => {
            dispatch({
              type: Actions.SET_COMPANION_INDEX,
              payload: index,
            });
          }}
          onDragEnd={() => {
            setTimeout(() => dispatch({
              type: Actions.SET_COMPANION_INDEX,
              payload: undefined,
            }), 500);
          }}
          to={Path.cropSearch(companionSlug)}>
          <img
            src={findIcon(companionSlug)}
            width={20}
            height={20} />
          <p>{companion.name}</p>
        </Link>;
      })}
    </div>
  </InfoField>;
};

interface AddPlantHereButtonProps {
  botPosition: BotPosition;
  openedSavedGarden: number | undefined;
  cropName: string;
  slug: string;
  dispatch: Function;
  getConfigValue: GetWebAppConfigValue;
  designer: DesignerState;
}

/** Button to add a plant to the garden at the current bot position. */
const AddPlantHereButton = (props: AddPlantHereButtonProps) => {
  const {
    botPosition, openedSavedGarden, cropName, slug, dispatch, getConfigValue,
  } = props;
  const { x, y } = botPosition;
  const botXY = isNumber(x) && isNumber(y)
    ? { x: round(x), y: round(y) }
    : undefined;
  const botXYLabel = botXY ? `(${botXY.x}, ${botXY.y})` : `(${t("unknown")})`;
  const click = () => botXY &&
    createPlant({
      cropName, slug, gardenCoords: botXY, gridSize: undefined,
      dispatch, openedSavedGarden,
      depth: parseInt("" + getConfigValue(NumericSetting.default_plant_depth)),
      designer: props.designer,
    });
  return <button className="fb-button gray no-float"
    title={t("Add plant at current location")}
    disabled={!botXY} onClick={click}>
    {t("Add plant at current FarmBot location {{coordinate}}",
      { coordinate: botXYLabel })}
  </button>;
};

/** Image of crop to drag into map. */
const CropDragInfoTile =
  ({ slug }: { slug: string }) =>
    <div className="crop-drag-info-tile">
      <img className="crop-drag-info-image"
        src={findIcon(slug)}
        onDragStart={setDragIcon(slug)} />
    </div>;

export function mapStateToProps(props: Everything): CropInfoProps {
  return {
    dispatch: props.dispatch,
    botPosition: validBotLocationData(props.bot.hardware.location_data).position,
    xySwap: !!getWebAppConfigValue(() => props)(BooleanSetting.xy_swap),
    getConfigValue: getWebAppConfigValue(() => props),
    sourceFbosConfig: sourceFbosConfigValue(
      validFbosConfig(getFbosConfig(props.resources.index)),
      props.bot.hardware.configuration),
    botSize: botSize(props),
    curves: selectAllCurves(props.resources.index),
    plants: selectAllPlantPointers(props.resources.index),
    designer: props.resources.consumers.farm_designer,
  };
}

export class RawCropInfo extends React.Component<CropInfoProps, {}> {
  componentDidMount() {
    this.selectMostUsedCurves(Path.getCropSlug());
  }

  selectMostUsedCurves = (slug: string) => {
    const findCurve = findMostUsedCurveForCrop({
      plants: this.props.plants,
      curves: this.props.curves,
      slug: slug,
    });
    [CurveType.water, CurveType.spread, CurveType.height].map(curveType => {
      const id = findCurve(curveType)?.body.id;
      changeCurve(this.props.dispatch)(id, curveType);
    });
  };

  render() {
    const { dispatch, designer } = this.props;
    const slug = Path.getCropSlug();
    const crop = findCrop(slug);
    const image = findImage(slug);
    const panelName = "crop-info";
    return <DesignerPanel panelName={panelName} panel={Panel.Plants}>
      <DesignerPanelHeader
        panelName={panelName}
        panel={Panel.Plants}
        title={crop.name}
        backTo={Path.cropSearch()}
        onBack={() => !designer.cropSearchQuery && dispatch({
          type: Actions.SEARCH_QUERY_CHANGE,
          payload: startCase(slug).toLowerCase(),
        })}
        style={{
          background: `linear-gradient(
    rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${image})`
        }}
        description={crop.description}>
        <CropDragInfoTile slug={slug} />
        <Popover portalClassName={"dark-portal"}
          position={Position.BOTTOM_RIGHT}
          target={<button className={"plus-grid-btn fb-button clear"}>
            + {t("grid")}
          </button>}
          content={<div className={"grid-popup-content"}>
            <PlantGrid
              xy_swap={this.props.xySwap}
              dispatch={dispatch}
              openfarm_slug={slug}
              spread={crop.spread}
              botPosition={this.props.botPosition}
              designer={designer}
              itemName={crop.name} />
          </div>} />
      </DesignerPanelHeader>
      <DesignerPanelContent panelName={panelName} className="grid">
        <AddPlantHereButton
          botPosition={this.props.botPosition}
          openedSavedGarden={designer.openedSavedGarden}
          cropName={crop.name}
          slug={slug}
          getConfigValue={this.props.getConfigValue}
          designer={designer}
          dispatch={dispatch} />
        <CropInfoList crop={crop}
          dispatch={dispatch}
          selectMostUsedCurves={this.selectMostUsedCurves} />
        <div className={"row grid-2-col info-box"}>
          <label className="stage">{t("status")}</label>
          <FBSelect
            list={PLANT_STAGE_LIST()}
            selectedItem={designer.cropStage
              ? PLANT_STAGE_DDI_LOOKUP()[designer.cropStage]
              : undefined}
            onChange={ddi => dispatch({
              type: Actions.SET_CROP_STAGE,
              payload: ddi.value,
            })} />
        </div>
        <div className={"row grid-2-col info-box"}>
          <label className="planted-at">{t("start date")}</label>
          <BlurableInput
            type="date"
            value={designer.cropPlantedAt
              ? moment(designer.cropPlantedAt).format("YYYY-MM-DD")
              : ""}
            onCommit={e => dispatch({
              type: Actions.SET_CROP_PLANTED_AT,
              payload: e.currentTarget.value,
            })
            } />
        </div>
        <div className={"row grid-2-col info-box"}>
          <label className="radius">{t("radius (mm)")}</label>
          <BlurableInput
            type="number"
            value={designer.cropRadius || DEFAULT_PLANT_RADIUS}
            onCommit={e => dispatch({
              type: Actions.SET_CROP_RADIUS,
              payload: parseInt(e.currentTarget.value),
            })
            } />
        </div>
        <AllCurveInfo
          dispatch={dispatch}
          sourceFbosConfig={this.props.sourceFbosConfig}
          botSize={this.props.botSize}
          curves={this.props.curves}
          findCurve={findCurve(this.props.curves, designer)}
          plants={this.props.plants}
          onChange={changeCurve(dispatch)} />
        <img src={image} />
      </DesignerPanelContent>
    </DesignerPanel>;
  }
}

export const CropInfo = connect(mapStateToProps)(RawCropInfo);
// eslint-disable-next-line import/no-default-export
export default CropInfo;
