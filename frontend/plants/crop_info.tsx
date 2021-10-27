import React from "react";
import { svgToUrl } from "../open_farm/icons";
import {
  CropInfoProps, CropLiveSearchResult, OpenfarmSearch,
} from "../farm_designer/interfaces";
import { getPathArray } from "../history";
import { connect } from "react-redux";
import { findBySlug } from "../farm_designer/search_selectors";
import { Everything } from "../interfaces";
import { OpenFarm } from "../open_farm/openfarm";
import { OFSearch } from "../farm_designer/util";
import { unselectPlant, setDragIcon } from "../farm_designer/map/actions";
import { validBotLocationData } from "../util";
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
import { cropSearchUrl } from "./crop_catalog";
import { PlantGrid } from "./grid/plant_grid";
import { getWebAppConfigValue } from "../config_storage/actions";
import { BooleanSetting } from "../session_keys";

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

/** Display crop properties from OpenFarm. */
const CropInfoList = (crop: OpenFarm.OFCrop) => {
  return <div className="object-list">
    <ul>
      {chain(crop)
        .omit(OMITTED_PROPERTIES)
        .toPairs()
        .map(handleDisplay)
        .value()}
    </ul>
  </div>;
};

/** Button to add a plant to the garden at the current bot position. */
const AddPlantHereButton = (props: {
  botPosition: BotPosition,
  openedSavedGarden: string | undefined,
  cropName: string,
  slug: string,
  dispatch: Function
}) => {
  const { botPosition, openedSavedGarden, cropName, slug, dispatch } = props;
  const { x, y } = botPosition;
  const botXY = isNumber(x) && isNumber(y)
    ? { x: round(x), y: round(y) }
    : undefined;
  const botXYLabel = botXY ? `(${botXY.x}, ${botXY.y})` : `(${t("unknown")})`;
  const click = () => botXY &&
    createPlant({
      cropName, slug, gardenCoords: botXY, gridSize: undefined,
      dispatch, openedSavedGarden
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
  const crop = getPathArray()[5] || "";
  const result = findBySlug(props.cropSearchResults, crop);
  const basePath = cropSearchUrl();
  const backgroundURL = `linear-gradient(
    rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${result.image})`;
  return { crop, result, basePath, backgroundURL };
};

export function mapStateToProps(props: Everything): CropInfoProps {
  const {
    cropSearchResults, openedSavedGarden, cropSearchInProgress, cropSearchQuery
  } = props.resources.consumers.farm_designer;
  return {
    openfarmSearch: OFSearch,
    dispatch: props.dispatch,
    cropSearchQuery,
    cropSearchResults,
    cropSearchInProgress,
    openedSavedGarden,
    botPosition: validBotLocationData(props.bot.hardware.location_data).position,
    xySwap: !!getWebAppConfigValue(() => props)(BooleanSetting.xy_swap),
  };
}
/** Get OpenFarm crop search results for crop info page contents. */
export const searchForCurrentCrop = (openfarmSearch: OpenfarmSearch) =>
  (dispatch: Function) => {
    const crop = getPathArray()[5];
    openfarmSearch(crop)(dispatch);
    unselectPlant(dispatch)();
  };

export class RawCropInfo extends React.Component<CropInfoProps, {}> {

  componentDidMount() {
    this.props.dispatch(searchForCurrentCrop(this.props.openfarmSearch));
  }

  /** Clear the current crop search results. */
  clearCropSearchResults = (crop: string) => () => {
    const { dispatch } = this.props;
    if (!this.props.cropSearchQuery) {
      dispatch({ type: Actions.SEARCH_QUERY_CHANGE, payload: crop });
    }
    dispatch({ type: Actions.OF_SEARCH_RESULTS_OK, payload: [] });
  };

  render() {
    const { cropSearchResults, cropSearchInProgress } = this.props;
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
          <CropInfoList {...result.crop} />
          <AddPlantHereButton
            botPosition={this.props.botPosition}
            openedSavedGarden={this.props.openedSavedGarden}
            cropName={result.crop.name}
            slug={result.crop.slug}
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
