import * as React from "react";
import { BlurableInput } from "../../../../ui/index";
import { t } from "i18next";
import { offsetTime } from "../../../farm_events/edit_fe_form";
import {
  setWebAppConfigValue, GetWebAppConfigValue
} from "../../../../config_storage/actions";
import * as moment from "moment";
import {
  formatDate, formatTime
} from "../../../farm_events/map_state_to_props_add_edit";
import { Slider } from "@blueprintjs/core";

interface ImageFilterMenuState {
  beginDate: string | undefined;
  beginTime: string | undefined;
  endDate: string | undefined;
  endTime: string | undefined;
  slider: number;
}

export interface ImageFilterMenuProps {
  tzOffset: number;
  dispatch: Function;
  getConfigValue: GetWebAppConfigValue;
  imageAgeInfo: { newestDate: string, toOldest: number };
}

export class ImageFilterMenu
  extends React.Component<ImageFilterMenuProps, Partial<ImageFilterMenuState>> {
  constructor(props: ImageFilterMenuProps) {
    super(props);
    this.state = {};
  }

  componentWillMount() {
    const { newestDate, toOldest } = this.props.imageAgeInfo;
    const beginDatetime = this.props.getConfigValue("photo_filter_begin");
    this.setState({
      slider: toOldest + 1 - (beginDatetime
        ? Math.abs(moment(beginDatetime.toString())
          .diff(moment(newestDate).clone(), "days")) : 0)
    });
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

  sliderChange = (slider: number) => {
    const { newestDate, toOldest } = this.props.imageAgeInfo;
    this.setState({ slider });
    const { dispatch, tzOffset } = this.props;
    const calcDate = (day: number) =>
      moment(newestDate).subtract(toOldest - day, "days").toISOString();
    const begin = offsetTime(calcDate(slider - 1), "00:00", tzOffset);
    const end = offsetTime(calcDate(slider), "00:00", tzOffset);
    dispatch(setWebAppConfigValue("photo_filter_begin", begin));
    dispatch(setWebAppConfigValue("photo_filter_end", end));
  }

  renderLabel = (day: number) => {
    const { newestDate, toOldest } = this.props.imageAgeInfo;
    return moment(newestDate)
      .utcOffset(this.props.tzOffset)
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
