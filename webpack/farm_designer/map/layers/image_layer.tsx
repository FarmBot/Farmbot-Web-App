import * as React from "react";
import { MapTransformProps } from "../interfaces";
import { CameraCalibrationData } from "../../interfaces";
import { TaggedImage } from "../../../resources/tagged_resources";
import { MapImage } from "../map_image";
import { reverse, cloneDeep } from "lodash";
import { BlurableInput } from "../../../ui/index";
import { t } from "i18next";
import { offsetTime } from "../../farm_events/edit_fe_form";
import { setWebAppConfigValue, GetWebAppConfigValue } from "../../../config_storage/actions";
import * as moment from "moment";
import { formatDate, formatTime } from "../../farm_events/map_state_to_props_add_edit";

export interface ImageLayerProps {
  visible: boolean;
  images: TaggedImage[];
  mapTransformProps: MapTransformProps;
  cameraCalibrationData: CameraCalibrationData;
  sizeOverride?: { width: number, height: number };
  getConfigValue: GetWebAppConfigValue;
}

export function ImageLayer(props: ImageLayerProps) {
  const {
    visible, images, mapTransformProps, cameraCalibrationData, sizeOverride,
    getConfigValue
   } = props;
  const imageFilterBegin = getConfigValue("photo_filter_begin");
  const imageFilterEnd = getConfigValue("photo_filter_end");
  return <g id="image-layer">
    {visible &&
      reverse(cloneDeep(images))
        .filter(x => !imageFilterEnd ||
          moment(x.body.created_at).isBefore(imageFilterEnd.toString()))
        .filter(x => !imageFilterBegin ||
          moment(x.body.created_at).isAfter(imageFilterBegin.toString()))
        .map(img =>
          <MapImage
            image={img}
            key={"image_" + img.body.id}
            cameraCalibrationData={cameraCalibrationData}
            sizeOverride={sizeOverride}
            mapTransformProps={mapTransformProps} />
        )}
  </g>;
}

interface ImageFilterMenuState {
  beginDate: string | undefined;
  beginTime: string | undefined;
  endDate: string | undefined;
  endTime: string | undefined;
}

export interface ImageFilterMenuProps {
  tzOffset: number;
  dispatch: Function;
  getConfigValue: GetWebAppConfigValue;
}

export class ImageFilterMenu
  extends React.Component<ImageFilterMenuProps, Partial<ImageFilterMenuState>> {
  constructor(props: ImageFilterMenuProps) {
    super(props);
    this.state = {};
  }

  componentWillMount() {
    this.updateState();
  }

  componentWillReceiveProps() {
    this.updateState();
  }

  updateState = () => {
    const beginDatetime = this.props.getConfigValue("photo_filter_begin");
    const endDatetime = this.props.getConfigValue("photo_filter_end");
    const { tzOffset } = this.props;
    this.setState({
      beginDate: beginDatetime
        ? formatDate(beginDatetime.toString(), tzOffset) : undefined,
      beginTime: beginDatetime
        ? formatTime(beginDatetime.toString(), tzOffset) : undefined,
      endDate: endDatetime
        ? formatDate(endDatetime.toString(), tzOffset) : undefined,
      endTime: endDatetime
        ? formatTime(endDatetime.toString(), tzOffset) : undefined,
    });
  }

  setDatetime = (datetime: keyof ImageFilterMenuState) => {
    return (e: React.SyntheticEvent<HTMLInputElement>) => {
      const input = e.currentTarget.value;
      this.setState({ [datetime]: input });
      const { beginDate, beginTime, endDate, endTime } = this.state;
      const { dispatch, tzOffset } = this.props;
      let value = undefined;
      switch (datetime) {
        case "beginDate":
          value = offsetTime(input, beginTime || "00:00", tzOffset);
          dispatch(setWebAppConfigValue("photo_filter_begin", value));
          break;
        case "beginTime":
          if (beginDate) {
            value = offsetTime(beginDate, input, tzOffset);
            dispatch(setWebAppConfigValue("photo_filter_begin", value));
          }
          break;
        case "endDate":
          value = offsetTime(input, endTime || "00:00", tzOffset);
          dispatch(setWebAppConfigValue("photo_filter_end", value));
          break;
        case "endTime":
          if (endDate) {
            value = offsetTime(endDate, input, tzOffset);
            dispatch(setWebAppConfigValue("photo_filter_end", value));
          }
          break;
      }
    };
  };

  render() {
    const { beginDate, beginTime, endDate, endTime } = this.state;
    return <table className={"image-filter-menu"}>
      <thead>
        <tr>
          <th />
          <th><label>{t("Date")}</label></th>
          <th><label>{t("Time")}</label></th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <label>{t("Newer than")}</label>
          </td>
          <td>
            <BlurableInput
              type="date"
              name="beginDate"
              value={beginDate || ""}
              allowEmpty={true}
              onCommit={this.setDatetime("beginDate")} />
          </td>
          <td>
            <BlurableInput
              type="time"
              name="beginTime"
              value={beginTime || ""}
              allowEmpty={true}
              disabled={!beginDate}
              onCommit={this.setDatetime("beginTime")} />
          </td>
        </tr>
        <tr>
          <td>
            <label>{t("Older than")}</label>
          </td>
          <td>
            <BlurableInput
              type="date"
              name="endDate"
              value={endDate || ""}
              allowEmpty={true}
              onCommit={this.setDatetime("endDate")} />
          </td>
          <td>
            <BlurableInput
              type="time"
              name="endTime"
              value={endTime || ""}
              allowEmpty={true}
              disabled={!endDate}
              onCommit={this.setDatetime("endTime")} />
          </td>
        </tr>
      </tbody>
    </table>;
  }
}
