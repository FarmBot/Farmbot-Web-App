import React from "react";
import { svgToUrl } from "../open_farm/icons";
import {
  CropInfoProps, CropLiveSearchResult, OpenfarmSearch,
} from "../farm_designer/interfaces";
import { connect } from "react-redux";
import { findBySlug } from "../farm_designer/search_selectors";
import { Everything } from "../interfaces";
import { OFCropFetch } from "../farm_designer/util";
import { unselectPlant, setDragIcon } from "../farm_designer/map/actions";
import { validBotLocationData } from "../util/location";
import { createPlant } from "../farm_designer/map/layers/plants/plant_actions";
import { round } from "../farm_designer/map/util";
import { BotPosition } from "../devices/interfaces";
import {
  DesignerPanel, DesignerPanelHeader, DesignerPanelContent,
} from "../farm_designer/designer_panel";
import { Actions } from "../constants";
import {
  EmptyStateWrapper, EmptyStateGraphic,
} from "../ui/empty_state_wrapper";
import { startCase, isArray, chain, isNumber } from "lodash";
import { t } from "../i18next_wrapper";
import { Panel } from "../farm_designer/panel_header";
import { ExternalUrl } from "../external_urls";
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
  AllCurveInfo, CURVE_ACTION_LOOKUP, findMostUsedCurveForCrop,
} from "./curve_info";
import { CurveType } from "../curves/templates";
import { TaggedCurve } from "farmbot";
import { DevSettings } from "../settings/dev/dev_support";

interface InfoFieldProps {
  title: string;
  children?: React.ReactNode;
}

interface SummaryItemProps {
  key: string;
  i: number;
  field: string;
  value: string;
}

/** Basic field: value display for OpenFarm crop properties. */
const InfoField = (props: InfoFieldProps) =>
  <li>
    <p>
      {t(startCase(props.title))}
    </p>
    <div className={"crop-info-field-data"}>
      {props.children}
    </div>
  </li>;

const OMITTED_PROPERTIES = [
  "slug",
  "processing_pictures",
  "description",
  "main_image_path",
  "tags_array",
  "guides_count",
];

const NO_VALUE = t("Not available");

/**
* If there's a value, give it an img element to render the
* actual graphic. If no value, return NO_VALUE.
*/
const SvgIcon = ({ i, field, value }: SummaryItemProps) =>
  <InfoField key={i} title={field}>
    {value
      ? <div className={"svg-img"}>
        <img
          src={svgToUrl(value)}
          width={100}
          height={100}
          onDragStart={setDragIcon(value)} />
      </div>
      : <span>{NO_VALUE}</span>}
  </InfoField>;

/**
 * Need to convert the `cm` provided by OpenFarm to `mm`
 * to match the Farm Designer units.
 */
const CmProperty = ({ i, field, value }: SummaryItemProps) =>
  <InfoField key={i} title={field}>
    {!isNaN(parseInt(value))
      ? (parseInt(value) * 10) + t("mm")
      : NO_VALUE}
  </InfoField>;

/** Comma-separated list of crop common names. */
const CommonNames = ({ i, field, value }: SummaryItemProps) =>
  <InfoField key={i} title={field}>
    {(isArray(value)
      ? value.join(", ")
      : value) || NO_VALUE}
  </InfoField>;

/** Default behavior for all other properties. */
const DefaultPropertyDisplay = ({ i, field, value }: SummaryItemProps) =>
  <InfoField key={i} title={field}>
    {value || NO_VALUE}
  </InfoField>;

/** Choose the appropriate display function for the crop property. */
const handleDisplay = ([field, value]: string[], i: number) => {
  const commonProps: SummaryItemProps = { key: field, i, field, value };
  switch (field) {
    case "svg_icon":
      return <SvgIcon {...commonProps} />;
    case "spread":
    case "row_spacing":
    case "height":
      return <CmProperty {...commonProps} />;
    case "common_names":
      return <CommonNames {...commonProps} />;
    default:
      return <DefaultPropertyDisplay {...commonProps} />;
  }
};

interface CropInfoListProps {
  result: CropLiveSearchResult;
  dispatch: Function;
  selectMostUsedCurves(slug: string): void;
  openfarmCropFetch: OpenfarmSearch;
}

/** Display crop properties from OpenFarm. */
const CropInfoList = (props: CropInfoListProps) => {
  return <div className="object-list">
    <ul>
      {chain(props.result.crop)
        .omit(OMITTED_PROPERTIES)
        .toPairs()
        .map(handleDisplay)
        .value()}
      <Companions {...props} />
    </ul>
  </div>;
};

/** Display companion plant list from OpenFarm. */
const Companions = (props: CropInfoListProps) => {
  const { result, dispatch, openfarmCropFetch } = props;
  if (result.companions.length == 0) { return <div />; }
  return <InfoField title={t("Companions")}>
    {result.companions.map((companion, index) =>
      <Link key={companion.slug}
        className={"companion"}
        onClick={() => {
          openfarmCropFetch(companion.slug)(dispatch);
          unselectPlant(dispatch)();
          props.selectMostUsedCurves(companion.slug);
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
        to={Path.cropSearch(companion.slug)}>
        <img
          src={svgToUrl(companion.svg_icon)}
          width={32}
          height={32} />
        <p>{companion.name}</p>
      </Link>)}
  </InfoField>;
};

interface AddPlantHereButtonProps {
  botPosition: BotPosition;
  openedSavedGarden: string | undefined;
  cropName: string;
  slug: string;
  dispatch: Function;
  getConfigValue: GetWebAppConfigValue;
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
  ({ image, svgIcon }: { image: string, svgIcon: string | undefined }) =>
    <div className="crop-drag-info-tile">
      <img className="crop-drag-info-image"
        src={image}
        onDragStart={setDragIcon(svgIcon)} />
      <div className="crop-info-overlay">
        {t("Drag and drop into map")}
      </div>
    </div>;

/** Text and link for crop editing. */
const EditOnOpenFarm = ({ slug }: { slug: string }) =>
  <div className="edit-on-openfarm">
    <span>{t("Edit on")}&nbsp;</span>
    <a href={ExternalUrl.OpenFarm.cropBrowse + slug}
      target="_blank" rel={"noreferrer"}
      title={t("Open OpenFarm.cc in a new tab")}>
      {"OpenFarm"}
    </a>
  </div>;

/** Get values common to crop panel headers. */
export const getCropHeaderProps = (props: {
  cropSearchResults: CropLiveSearchResult[]
}) => {
  const crop = Path.getSlug(Path.cropSearch());
  const result = findBySlug(props.cropSearchResults, crop);
  const basePath = Path.cropSearch();
  const backgroundURL = `linear-gradient(
    rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${result.image})`;
  return { crop, result, basePath, backgroundURL };
};

export function mapStateToProps(props: Everything): CropInfoProps {
  return {
    openfarmCropFetch: OFCropFetch,
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
/** Get OpenFarm crop search results for crop info page contents. */
export const searchForCurrentCrop = (openfarmCropFetch: OpenfarmSearch) =>
  (dispatch: Function) => {
    const crop = Path.getSlug(Path.cropSearch());
    openfarmCropFetch(crop)(dispatch);
    unselectPlant(dispatch)();
  };

interface CropInfoState {
  crop: string;
}

export class RawCropInfo extends React.Component<CropInfoProps, CropInfoState> {
  state: CropInfoState = { crop: Path.getSlug(Path.cropSearch()) };

  componentDidMount() {
    this.props.dispatch(searchForCurrentCrop(this.props.openfarmCropFetch));
    this.selectMostUsedCurves(Path.getSlug(Path.cropSearch()));
  }

  componentDidUpdate() {
    const crop = Path.getSlug(Path.cropSearch());
    if (crop != this.state.crop) {
      this.selectMostUsedCurves(crop);
      this.setState({ crop });
    }
  }

  selectMostUsedCurves = (slug: string) => {
    const findCurve = findMostUsedCurveForCrop({
      plants: this.props.plants,
      curves: this.props.curves,
      openfarmSlug: slug,
    });
    [CurveType.water, CurveType.spread, CurveType.height].map(curveType => {
      const id = findCurve(curveType)?.body.id;
      this.changeCurve(id, curveType);
    });
  };

  /** Clear the current crop search results. */
  clearCropSearchResults = (crop: string) => () => {
    const { dispatch } = this.props;
    if (!this.props.designer.cropSearchQuery) {
      dispatch({ type: Actions.SEARCH_QUERY_CHANGE, payload: crop });
    }
    dispatch({ type: Actions.OF_SEARCH_RESULTS_OK, payload: [] });
  };

  get curveId() {
    return {
      [CurveType.water]: this.props.designer.cropWaterCurveId,
      [CurveType.spread]: this.props.designer.cropSpreadCurveId,
      [CurveType.height]: this.props.designer.cropHeightCurveId,
    };
  }

  findCurve = (curveType: CurveType): TaggedCurve | undefined =>
    this.props.curves.filter(curve => curve.body.id == this.curveId[curveType])[0];

  changeCurve = (id: string | number | undefined, curveType: CurveType) => {
    this.props.dispatch({ type: CURVE_ACTION_LOOKUP[curveType], payload: id });
  };

  render() {
    const { cropSearchResults, cropSearchInProgress } = this.props.designer;
    const { crop, result, basePath, backgroundURL } =
      getCropHeaderProps({ cropSearchResults });
    const panelName = "crop-info";
    return <DesignerPanel panelName={panelName} panel={Panel.Plants}>
      <DesignerPanelHeader
        panelName={panelName}
        panel={Panel.Plants}
        title={result.crop.name}
        backTo={basePath}
        onBack={this.clearCropSearchResults(crop)}
        style={{ background: backgroundURL }}
        description={result.crop.description}>
      </DesignerPanelHeader>
      <DesignerPanelContent panelName={panelName}>
        <EmptyStateWrapper
          notEmpty={!cropSearchInProgress}
          graphic={EmptyStateGraphic.no_crop_results}
          title={t("Loading...")}>
          <CropDragInfoTile image={result.image} svgIcon={result.crop.svg_icon} />
          <EditOnOpenFarm slug={result.crop.slug} />
          <CropInfoList result={result}
            dispatch={this.props.dispatch}
            selectMostUsedCurves={this.selectMostUsedCurves}
            openfarmCropFetch={this.props.openfarmCropFetch} />
          {DevSettings.futureFeaturesEnabled() &&
            <AllCurveInfo
              dispatch={this.props.dispatch}
              sourceFbosConfig={this.props.sourceFbosConfig}
              botSize={this.props.botSize}
              curves={this.props.curves}
              findCurve={this.findCurve}
              plants={this.props.plants}
              onChange={this.changeCurve} />}
          <AddPlantHereButton
            botPosition={this.props.botPosition}
            openedSavedGarden={this.props.designer.openedSavedGarden}
            cropName={result.crop.name}
            slug={result.crop.slug}
            getConfigValue={this.props.getConfigValue}
            dispatch={this.props.dispatch} />
          <PlantGrid
            xy_swap={this.props.xySwap}
            dispatch={this.props.dispatch}
            openfarm_slug={result.crop.slug}
            spread={result.crop.spread}
            botPosition={this.props.botPosition}
            itemName={result.crop.name} />
        </EmptyStateWrapper>
      </DesignerPanelContent>
    </DesignerPanel>;
  }
}

export const CropInfo = connect(mapStateToProps)(RawCropInfo);
