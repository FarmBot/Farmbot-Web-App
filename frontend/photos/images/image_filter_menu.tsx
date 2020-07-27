import * as React from "react";
import { BlurableInput } from "../../ui/index";
import { offsetTime } from "../../farm_events/edit_fe_form";
import { GetWebAppConfigValue } from "../../config_storage/actions";
import moment from "moment";
import {
  formatDate, formatTime,
} from "../../farm_events/map_state_to_props_add_edit";
import { Slider } from "@blueprintjs/core";
import { t } from "../../i18next_wrapper";
import { TimeSettings } from "../../interfaces";
import { StringConfigKey } from "farmbot/dist/resources/configs/web_app";
import { GetState } from "../../redux/interfaces";
import { getWebAppConfig } from "../../resources/getters";
import { edit, save } from "../../api/crud";
import { isString, isUndefined, last } from "lodash";
import { TaggedImage } from "farmbot";

interface FullImageFilterMenuState {
  beginDate: string | undefined;
  beginTime: string | undefined;
  endDate: string | undefined;
  endTime: string | undefined;
  slider: number;
}

type ImageFilterMenuState = Partial<FullImageFilterMenuState>;

export interface ImageFilterMenuProps {
  timeSettings: TimeSettings;
  dispatch: Function;
  getConfigValue: GetWebAppConfigValue;
  imageAgeInfo: { newestDate: string, toOldest: number };
}

export class ImageFilterMenu
  extends React.Component<ImageFilterMenuProps, ImageFilterMenuState> {
  state: ImageFilterMenuState = {};

  componentDidMount() {
    const beginDatetime = this.props.getConfigValue("photo_filter_begin");
    if (isString(beginDatetime) || isUndefined(beginDatetime)) {
      this.updateSliderState(beginDatetime);
    }
    this.updateState();
  }

  updateSliderState = (begin: string | undefined) => {
    const { newestDate, toOldest } = this.props.imageAgeInfo;
    const offset = begin ? Math.abs(moment(begin.toString())
      .diff(moment(newestDate).clone(), "days")) : 0;
    this.setState({ slider: toOldest + 1 - offset });
  };

  setValues = (update: StringValueUpdate) => {
    Object.entries(update).map(([key, value]) => {
      switch (key) {
        case "photo_filter_begin":
          this.updateSliderState(value);
          value
            ? this.setState({
              beginDate: formatDate(value.toString(), this.props.timeSettings),
              beginTime: formatTime(value.toString(), this.props.timeSettings),
            })
            : this.setState({ beginDate: undefined, beginTime: undefined });
          break;
        case "photo_filter_end":
          value
            ? this.setState({
              endDate: formatDate(value.toString(), this.props.timeSettings),
              endTime: formatTime(value.toString(), this.props.timeSettings),
            })
            : this.setState({ endDate: undefined, endTime: undefined });
          break;
      }
    });
    this.props.dispatch(setWebAppConfigValues(update));
  };

  updateState = () => {
    const beginDatetime = this.props.getConfigValue("photo_filter_begin");
    const endDatetime = this.props.getConfigValue("photo_filter_end");
    const { timeSettings } = this.props;
    this.setState({
      beginDate: beginDatetime
        ? formatDate(beginDatetime.toString(), timeSettings) : undefined,
      beginTime: beginDatetime
        ? formatTime(beginDatetime.toString(), timeSettings) : undefined,
      endDate: endDatetime
        ? formatDate(endDatetime.toString(), timeSettings) : undefined,
      endTime: endDatetime
        ? formatTime(endDatetime.toString(), timeSettings) : undefined,
    });
  }

  setDatetime = (datetime: keyof ImageFilterMenuState) => {
    return (e: React.SyntheticEvent<HTMLInputElement>) => {
      const input = e.currentTarget.value;
      this.setState({ [datetime]: input });
      const { beginDate, beginTime, endDate, endTime } = this.state;
      const { timeSettings } = this.props;
      let value = undefined;
      switch (datetime) {
        case "beginDate":
          value = offsetTime(input, beginTime || "00:00", timeSettings);
          this.setValues({ photo_filter_begin: value });
          break;
        case "beginTime":
          if (beginDate) {
            value = offsetTime(beginDate, input, timeSettings);
            this.setValues({ photo_filter_begin: value });
          }
          break;
        case "endDate":
          value = offsetTime(input, endTime || "00:00", timeSettings);
          this.setValues({ photo_filter_end: value });
          break;
        case "endTime":
          if (endDate) {
            value = offsetTime(endDate, input, timeSettings);
            this.setValues({ photo_filter_end: value });
          }
          break;
      }
    };
  };

  sliderChange = (slider: number) => {
    const { newestDate, toOldest } = this.props.imageAgeInfo;
    this.setState({ slider });
    const { timeSettings } = this.props;
    const calcDate = (day: number) =>
      moment(newestDate).subtract(toOldest - day, "days").toISOString();
    const begin = offsetTime(calcDate(slider - 1), "00:00", timeSettings);
    const end = offsetTime(calcDate(slider), "00:00", timeSettings);
    this.setValues({ photo_filter_begin: begin, photo_filter_end: end });
  }

  renderLabel = (day: number) => {
    const { newestDate, toOldest } = this.props.imageAgeInfo;
    return moment(newestDate)
      .utcOffset(this.props.timeSettings.utcOffset)
      .subtract(toOldest + 1 - day, "days")
      .format("MMM-D");
  }

  get labelStepSize() {
    return Math.max(Math.round(this.props.imageAgeInfo.toOldest / 5), 1);
  }

  render() {
    const { beginDate, beginTime, endDate, endTime, slider } = this.state;
    return <div className={"image-filter-menu"}>
      <table>
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
      </table>
      {this.props.imageAgeInfo.newestDate !== "" &&
        <Slider
          min={0}
          max={this.props.imageAgeInfo.toOldest + 1}
          labelStepSize={this.labelStepSize}
          value={slider}
          onChange={this.sliderChange}
          labelRenderer={this.renderLabel}
          showTrackFill={false} />}
    </div>;
  }
}

type StringValueUpdate = Partial<Record<StringConfigKey, string | undefined>>;

export const setWebAppConfigValues = (update: StringValueUpdate) =>
  (dispatch: Function, getState: GetState) => {
    const webAppConfig = getWebAppConfig(getState().resources.index);
    if (webAppConfig) {
      dispatch(edit(webAppConfig, update));
      dispatch(save(webAppConfig.uuid));
    }
  };

export const calculateImageAgeInfo = (latestImages: TaggedImage[]) => {
  const newestImage = latestImages[0];
  const oldestImage = last(latestImages);
  const newestDate = newestImage ? newestImage.body.created_at : "";
  const toOldest = oldestImage && newestDate
    ? Math.abs(moment(oldestImage.body.created_at)
      .diff(moment(newestDate).clone(), "days"))
    : 1;
  return { newestDate, toOldest };
};
