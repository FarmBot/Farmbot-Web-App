import React from "react";
import { BlurableInput, MarkedSlider } from "../../ui";
import { offsetTime } from "../../farm_events/edit_fe_form";
import moment from "moment";
import {
  formatDateField, formatTimeField,
} from "../../farm_events/map_state_to_props_add_edit";
import { t } from "../../i18next_wrapper";
import { setWebAppConfigValues } from "./actions";
import {
  StringValueUpdate, ImageFilterMenuProps, ImageFilterMenuState,
} from "./interfaces";
import { StringSetting } from "../../session_keys";
import { TaggedImage } from "farmbot";
import { getModifiedClassNameDefaultFalse } from "../../settings/default_values";

export class ImageFilterMenu
  extends React.Component<ImageFilterMenuProps, ImageFilterMenuState> {
  state: ImageFilterMenuState = {};

  componentDidMount() {
    this.updateState();
  }

  get sliderValue() {
    const { newestDate, toOldest } = this.imageAgeInfo;
    const offset = this.state.beginDate
      ? Math.abs(moment(this.state.beginDate)
        .diff(moment(newestDate).clone(), "days"))
      : 0;
    return toOldest - offset;
  }

  setValues = (update: StringValueUpdate) => {
    Object.entries(update).map(([key, value]) => {
      switch (key) {
        case StringSetting.photo_filter_begin:
          value
            ? this.setState({
              beginDate: formatDateField(value, this.props.timeSettings),
              beginTime: formatTimeField(value, this.props.timeSettings),
            })
            : this.setState({ beginDate: undefined, beginTime: undefined });
          break;
        case StringSetting.photo_filter_end:
          value
            ? this.setState({
              endDate: formatDateField(value, this.props.timeSettings),
              endTime: formatTimeField(value, this.props.timeSettings),
            })
            : this.setState({ endDate: undefined, endTime: undefined });
          break;
      }
    });
    this.props.dispatch(setWebAppConfigValues(update));
  };

  updateState = () => {
    const { getConfigValue, timeSettings } = this.props;
    const beginDatetime = getConfigValue(StringSetting.photo_filter_begin);
    const endDatetime = getConfigValue(StringSetting.photo_filter_end);
    this.setState({
      beginDate: beginDatetime
        ? formatDateField(beginDatetime.toString(), timeSettings)
        : undefined,
      beginTime: beginDatetime
        ? formatTimeField(beginDatetime.toString(), timeSettings)
        : undefined,
      endDate: endDatetime
        ? formatDateField(endDatetime.toString(), timeSettings)
        : undefined,
      endTime: endDatetime
        ? formatTimeField(endDatetime.toString(), timeSettings)
        : undefined,
    });
  };

  setDatetime = (datetime: keyof ImageFilterMenuState) => {
    return (e: React.SyntheticEvent<HTMLInputElement>) => {
      const input = e.currentTarget.value;
      this.setState({ [datetime]: input });
      const { beginDate, beginTime, endDate, endTime } = this.state;
      const { timeSettings } = this.props;
      let value = undefined;
      switch (datetime) {
        case "beginDate":
          if (input) {
            value = offsetTime(input, beginTime || "00:00", timeSettings);
          }
          this.setValues({ photo_filter_begin: value });
          break;
        case "beginTime":
          if (beginDate) {
            value = offsetTime(beginDate, input, timeSettings);
            this.setValues({ photo_filter_begin: value });
          }
          break;
        case "endDate":
          if (input) {
            value = offsetTime(input, endTime || "00:00", timeSettings);
          }
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

  get imageAgeInfo() {
    const begin = moment(this.state.beginDate
      || this.props.imageAgeInfo.newestDate);
    const newest = moment(this.props.imageAgeInfo.newestDate);
    const newestDate = begin.isAfter(newest)
      ? begin.add(1, "days").toISOString()
      : newest.toISOString();
    const dateRange = this.props.imageAgeInfo.toOldest;
    const newRange = begin.isAfter(newest)
      ? dateRange + begin.diff(newest, "days") + 1
      : dateRange;
    const oldestDate = moment(newestDate).subtract(newRange, "days");
    const toOldest = begin.isBefore(oldestDate)
      ? newRange + oldestDate.diff(begin, "days")
      : newRange;
    return { newestDate, toOldest };
  }

  sliderChange = (slider: number) => {
    this.setState({ slider: undefined });
    const { newestDate, toOldest } = this.imageAgeInfo;
    const day = moment(newestDate).subtract(toOldest - slider, "days")
      .toISOString();
    const begin = offsetTime(day, "00:00", this.props.timeSettings);
    this.setSingleDay(begin);
  };

  setSingleDay = (date: string | undefined) => {
    const day = moment(date).toISOString();
    const begin = offsetTime(day, "00:00", this.props.timeSettings);
    const nextDay = moment(day).add(1, "days").toISOString();
    const end = offsetTime(nextDay, "00:00", this.props.timeSettings);
    this.setValues({ photo_filter_begin: begin, photo_filter_end: end });
  };

  dateStep = (direction: 1 | -1) => () => {
    const day = moment(this.state.beginDate).add(direction, "days")
      .toISOString();
    this.setSingleDay(day);
  };

  oldest = () => {
    const { newestDate, toOldest } = this.props.imageAgeInfo;
    const oldest = moment(newestDate).subtract(toOldest + 1, "days")
      .toISOString();
    this.setSingleDay(oldest);
  };

  newest = () => {
    this.setSingleDay(this.props.imageAgeInfo.newestDate);
  };

  renderLabel = (day: number) => {
    const { newestDate, toOldest } = this.imageAgeInfo;
    return moment(newestDate)
      .utcOffset(this.props.timeSettings.utcOffset)
      .subtract(toOldest - day, "days")
      .format("MMM-D");
  };

  get labelStepSize() {
    return Math.max(Math.round(this.imageAgeInfo.toOldest / 5), 1);
  }

  getImageOffset = (image: TaggedImage) =>
    this.imageAgeInfo.toOldest -
    Math.abs(moment(image.body.created_at)
      .diff(moment(this.imageAgeInfo.newestDate), "days"));

  render() {
    const { beginDate, beginTime, endDate, endTime } = this.state;
    return <div className={"image-filter-menu"}>
      <table>
        <thead>
          <tr>
            <th />
            <th>
              <i className={"fa fa-step-backward fb-icon-button invert"}
                onClick={this.oldest} />
              {beginDate &&
                <i className={"fa fa-caret-left fb-icon-button invert"}
                  onClick={this.dateStep(-1)} />}
              <label>{t("Date")}</label>
              {beginDate &&
                <i className={"fa fa-caret-right fb-icon-button invert"}
                  onClick={this.dateStep(1)} />}
              <i className={"fa fa-step-forward fb-icon-button invert"}
                onClick={this.newest} />
            </th>
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
                className={getModifiedClassNameDefaultFalse(beginDate)}
                value={beginDate || ""}
                allowEmpty={true}
                onCommit={this.setDatetime("beginDate")} />
            </td>
            <td>
              <BlurableInput
                type="time"
                name="beginTime"
                className={getModifiedClassNameDefaultFalse(beginTime)}
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
                className={getModifiedClassNameDefaultFalse(endDate)}
                value={endDate || ""}
                allowEmpty={true}
                onCommit={this.setDatetime("endDate")} />
            </td>
            <td>
              <BlurableInput
                type="time"
                name="endTime"
                className={getModifiedClassNameDefaultFalse(endTime)}
                value={endTime || ""}
                allowEmpty={true}
                disabled={!endDate}
                onCommit={this.setDatetime("endTime")} />
            </td>
          </tr>
        </tbody>
      </table>
      {this.imageAgeInfo.newestDate !== "" &&
        <MarkedSlider
          min={-1}
          max={this.imageAgeInfo.toOldest}
          labelStepSize={this.labelStepSize}
          value={this.state.slider || this.sliderValue}
          onChange={slider => this.setState({ slider })}
          onRelease={this.sliderChange}
          labelRenderer={this.renderLabel}
          items={this.props.images}
          itemValue={this.getImageOffset} />}
    </div>;
  }
}
