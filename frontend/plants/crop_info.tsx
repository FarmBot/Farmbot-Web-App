import React from "react";
import { svgToUrl } from "../open_farm/icons";
import {
  CropInfoProps, CropLiveSearchResult, DesignerState, OpenfarmSearch,
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
import { startCase, isArray, chain, isNumber, isUndefined } from "lodash";
import { t } from "../i18next_wrapper";
import { Panel } from "../farm_designer/panel_header";
import { ExternalUrl } from "../external_urls";
import { PlantGrid } from "./grid/plant_grid";
import {
  GetWebAppConfigValue, getWebAppConfigValue,
} from "../config_storage/actions";
import { BooleanSetting, NumericSetting } from "../session_keys";
import { FilePath, Path } from "../internal_urls";
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
import { ImageFlipper } from "../photos/images/image_flipper";
import { SpecialStatus, TaggedImage } from "farmbot";
import { Position } from "@blueprintjs/core";
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

/** Basic field: value display for OpenFarm crop properties. */
const InfoField = (props: InfoFieldProps) =>
  <li>
    <span>{EMOJI[props.title]}</span>
    <p>
      {t(startCase(shortenTitle(props.title)))}:
    </p>
    <div className={"crop-info-field-data"}>
      {props.children}
    </div>
  </li>;

const OMITTED_PROPERTIES = [
  "name",
  "slug",
  "processing_pictures",
  "description",
  "main_image_path",
  "tags_array",
  "guides_count",
  "svg_icon",
  "taxon",
];

const NO_VALUE = t("Not available");

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
  return <InfoField title={"companions"}>
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
          width={20}
          height={20} />
        <p>{companion.name}</p>
      </Link>)}
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
  ({ svgIcon }: { svgIcon: string | undefined }) =>
    <div className="crop-drag-info-tile">
      <img className="crop-drag-info-image"
        src={svgIcon}
        onDragStart={setDragIcon(svgIcon)} />
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
    rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${result.images[0]})`;
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
  currentImage: TaggedImage | undefined;
}

const toTaggedImage = (url: string): TaggedImage => ({
  kind: "Image",
  uuid: url,
  specialStatus: SpecialStatus.SAVED,
  body: {
    created_at: "",
    updated_at: "",
    device_id: 0,
    attachment_processed_at: "1",
    attachment_url: url,
    meta: {
      x: undefined,
      y: undefined,
      z: undefined,
    }
  },
});

export class RawCropInfo extends React.Component<CropInfoProps, CropInfoState> {
  state: CropInfoState = {
    crop: Path.getSlug(Path.cropSearch()),
    currentImage: undefined,
  };

  componentDidMount() {
    this.clearCropSearchResults("")();
    this.setState({ currentImage: undefined });
    this.props.dispatch(searchForCurrentCrop(this.props.openfarmCropFetch));
    this.selectMostUsedCurves(Path.getSlug(Path.cropSearch()));
  }

  componentDidUpdate() {
    const crop = Path.getSlug(Path.cropSearch());
    if (crop != this.state.crop) {
      this.selectMostUsedCurves(crop);
      this.setState({ crop });
      this.clearCropSearchResults(crop)();
      this.setState({ currentImage: undefined });
    }
    if (isUndefined(this.state.currentImage) && this.imageData.length > 0) {
      this.setCurrentImage(0);
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
      changeCurve(this.props.dispatch)(id, curveType);
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

  get images() {
    const crop = getCropHeaderProps({
      cropSearchResults: this.props.designer.cropSearchResults,
    });
    return crop.result.images
      .filter(image => !image.includes(FilePath.DEFAULT_ICON));
  }
  get imageData() { return this.images.map(toTaggedImage); }

  setCurrentImage = (index: number) =>
    this.setState({ currentImage: this.imageData[index] });

  render() {
    const { dispatch, designer } = this.props;
    const { cropSearchResults, cropSearchInProgress } = designer;
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
        <CropDragInfoTile
          svgIcon={svgToUrl(result.crop.svg_icon)} />
        <Popover portalClassName={"dark-portal"}
          position={Position.BOTTOM_RIGHT}
          target={<button className={"plus-grid-btn transparent-button light"}>
            + {t("grid")}
          </button>}
          content={<div className={"grid-popup-content"}>
            <PlantGrid
              xy_swap={this.props.xySwap}
              dispatch={dispatch}
              openfarm_slug={result.crop.slug}
              spread={result.crop.spread}
              botPosition={this.props.botPosition}
              designer={designer}
              itemName={result.crop.name} />
          </div>} />
      </DesignerPanelHeader>
      <DesignerPanelContent panelName={panelName}>
        <EmptyStateWrapper
          notEmpty={!cropSearchInProgress}
          graphic={EmptyStateGraphic.no_crop_results}
          title={t("Loading...")}>
          <CropInfoList result={result}
            dispatch={dispatch}
            selectMostUsedCurves={this.selectMostUsedCurves}
            openfarmCropFetch={this.props.openfarmCropFetch} />
          {DevSettings.futureFeaturesEnabled() &&
            <EditOnOpenFarm slug={result.crop.slug} />}
          <div className={"plant-stage-selection"}>
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
          <div className={"planted-at-selection"}>
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
          <AllCurveInfo
            dispatch={dispatch}
            sourceFbosConfig={this.props.sourceFbosConfig}
            botSize={this.props.botSize}
            curves={this.props.curves}
            findCurve={findCurve(this.props.curves, designer)}
            plants={this.props.plants}
            onChange={changeCurve(dispatch)} />
          <AddPlantHereButton
            botPosition={this.props.botPosition}
            openedSavedGarden={designer.openedSavedGarden}
            cropName={result.crop.name}
            slug={result.crop.slug}
            getConfigValue={this.props.getConfigValue}
            designer={designer}
            dispatch={dispatch} />
          {this.images.length > 0 &&
            <label style={{ display: "block" }}>
              {t("Images")} ({this.images.length})
            </label>}
          {this.images.length > 0 &&
            <ImageFlipper id={"image-items-flipper"}
              currentImage={this.state.currentImage}
              dispatch={this.props.dispatch}
              flipActionOverride={this.setCurrentImage}
              currentImageSize={{ width: undefined, height: undefined }}
              transformImage={false}
              getConfigValue={this.props.getConfigValue}
              env={{}}
              crop={false}
              images={this.imageData} />}
        </EmptyStateWrapper>
      </DesignerPanelContent>
    </DesignerPanel>;
  }
}

export const CropInfo = connect(mapStateToProps)(RawCropInfo);
