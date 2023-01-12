import React from "react";
import { t } from "../i18next_wrapper";
import { connect } from "react-redux";
import { push } from "../history";
import { TaggedCurve } from "farmbot";
import { round } from "lodash";
import {
  DesignerPanel, DesignerPanelHeader, DesignerPanelContent,
} from "../farm_designer/designer_panel";
import { Everything } from "../interfaces";
import { Panel } from "../farm_designer/panel_header";
import { selectAllCurves } from "../resources/selectors";
import { destroy, initSaveGetId, overwrite } from "../api/crud";
import { Path } from "../internal_urls";
import { ResourceTitle } from "../sequences/panel/editor";
import { Curve } from "farmbot/dist/resources/api_resources";
import { FBSelect, Popover } from "../ui";
import { CurveSvg } from "./chart";
import {
  populatedData, scaleData, addOrRemoveItem, curveSum, inData,
} from "./data_actions";
import { ActionMenuProps, EditCurveProps, EditCurveState } from "./interfaces";
import {
  curvePanelColor, CurveShape, CurveType, CURVE_SHAPE_DDIS, CURVE_TEMPLATES,
  DEFAULT_DAY_SCALE, DEFAULT_VALUE_SCALE,
} from "./templates";
import { sourceFbosConfigValue } from "../settings/source_config_value";
import { validFbosConfig } from "../util";
import { getFbosConfig } from "../resources/getters";
import { botSize } from "../farm_designer/state_to_props";

const columnTitle = (curve: TaggedCurve) => {
  switch (curve.body.type) {
    case CurveType.water: return t("Volume (mL)");
    case CurveType.spread: return t("Expected spread (mm)");
    case CurveType.height: return t("Expected height (mm)");
  }
};

export const mapStateToProps = (props: Everything): EditCurveProps => {
  return {
    dispatch: props.dispatch,
    findCurve: id => selectAllCurves(props.resources.index)
      .filter(g => g.body.id == id)[0],
    sourceFbosConfig: sourceFbosConfigValue(
      validFbosConfig(getFbosConfig(props.resources.index)),
      props.bot.hardware.configuration),
    botSize: botSize(props),
  };
};

export class RawEditCurve extends React.Component<EditCurveProps, EditCurveState> {
  state: EditCurveState = { templates: false, scale: false };

  get stringyID() { return Path.getSlug(Path.curves()); }
  get curve() {
    if (this.stringyID) {
      return this.props.findCurve(parseInt(this.stringyID));
    }
  }

  toggle = (key: keyof EditCurveState) => () =>
    this.setState({ ...this.state, [key]: !this.state[key] });

  render() {
    const { curve } = this;
    const { dispatch } = this.props;
    const curvesPath = Path.curves();
    !curve && Path.startsWith(curvesPath) && push(curvesPath);
    return <DesignerPanel panelName={"curve-info"} panel={Panel.Curves}>
      <DesignerPanelHeader
        panelName={Panel.Curves}
        style={{ background: curvePanelColor(curve) }}
        titleElement={<ResourceTitle
          key={curve?.body.name}
          resource={curve}
          save={true}
          fallback={t("No Curve selected")}
          dispatch={dispatch} />}
        backTo={curvesPath}>
        <div className={"panel-header-icon-group"}>
          {curve &&
            <i className={"fa fa-copy"}
              title={t("Copy curve")}
              onClick={copyCurve(curve, dispatch)} />}
          {curve &&
            <i className={"fa fa-trash"}
              title={t("Delete curve")}
              onClick={() => dispatch(destroy(curve.uuid))} />}
        </div>
      </DesignerPanelHeader>
      <DesignerPanelContent panelName={"curve-info"}>
        {curve
          ? <div className={"curve-info-panel-content-wrapper"}>
            <Popover
              isOpen={this.state.scale}
              popoverClassName={"curve-action-popover"}
              target={<button className={"transparent-button"}
                onClick={this.toggle("scale")}>
                {t("quick scale")}
              </button>}
              content={<ScaleMenu dispatch={dispatch} curve={curve}
                click={this.toggle("scale")} />} />
            <Popover
              isOpen={this.state.templates}
              popoverClassName={"curve-action-popover"}
              target={<button className={"transparent-button"}
                onClick={this.toggle("templates")}>
                {t("templates")}
              </button>}
              content={<TemplatesMenu dispatch={dispatch} curve={curve}
                click={this.toggle("templates")} />} />
            <CurveSvg dispatch={dispatch} curve={curve}
              sourceFbosConfig={this.props.sourceFbosConfig}
              botSize={this.props.botSize}
              editable={true} />
            <table>
              <thead>
                <tr>
                  <th>{t("Day")}</th>
                  <th>{columnTitle(curve)}</th>
                  <th>{curve.body.type == CurveType.water
                    ? t("Volume to date (L)")
                    : t("% Change")}</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(populatedData(curve.body.data))
                  .map(curveDataTableRow(curve, dispatch))}
              </tbody>
            </table>
          </div>
          : <span>{t("Redirecting")}...</span>}
      </DesignerPanelContent>
    </DesignerPanel>;
  }
}

export const EditCurve = connect(mapStateToProps)(RawEditCurve);

export const ScaleMenu = (props: ActionMenuProps) => {
  const { type } = props.curve.body;
  const [maxDay, setMaxDay] = React.useState(DEFAULT_DAY_SCALE[type]);
  const [maxValue, setMaxValue] = React.useState(DEFAULT_VALUE_SCALE[type]);
  return <div className={"curve-action-menu"}>
    <div className={"curve-menu-row"}>
      <label>{t("max value")}</label>
      <input type={"number"}
        defaultValue={maxValue}
        onChange={e => {
          const value = parseInt(e.currentTarget.value);
          isFinite(value) && setMaxValue(value);
        }} />
    </div>
    <div className={"curve-menu-row"}>
      <label>{t("days")}</label>
      <input type={"number"}
        defaultValue={maxDay}
        onChange={e => {
          const day = parseInt(e.currentTarget.value);
          isFinite(day) && setMaxDay(day);
        }} />
    </div>
    <div className={"curve-menu-row last"}>
      <button className={"transparent-button"}
        onClick={() => {
          props.dispatch(editCurve(props.curve, {
            data: scaleData(props.curve.body.data, maxDay, maxValue)
          }));
          props.click();
        }}>
        {t("apply")}
      </button>
    </div>
  </div>;
};

export const TemplatesMenu = (props: ActionMenuProps) => {
  const [shape, setShape] = React.useState(CurveShape.linear);
  const { type } = props.curve.body;
  const [maxDay, setMaxDay] = React.useState(DEFAULT_DAY_SCALE[type]);
  const [maxValue, setMaxValue] = React.useState(DEFAULT_VALUE_SCALE[type]);
  return <div className={"curve-action-menu"}>
    <div className={"curve-menu-row"}>
      <label>{t("shape")}</label>
      <FBSelect key={shape}
        list={Object.values(CURVE_SHAPE_DDIS())}
        selectedItem={CURVE_SHAPE_DDIS()[shape]}
        onChange={ddi => setShape(ddi.value as CurveShape)} />
    </div>
    <div className={"curve-menu-row"}>
      <label>{t("max value")}</label>
      <input type={"number"}
        defaultValue={maxValue}
        onChange={e => {
          const value = parseInt(e.currentTarget.value);
          isFinite(value) && setMaxValue(value);
        }} />
    </div>
    <div className={"curve-menu-row"}>
      <label>{t("days")}</label>
      <input type={"number"}
        defaultValue={maxDay}
        onChange={e => {
          const day = parseInt(e.currentTarget.value);
          isFinite(day) && setMaxDay(day);
        }} />
    </div>
    <div className={"curve-menu-row last"}>
      <button className={"transparent-button"}
        onClick={() => {
          props.dispatch(editCurve(props.curve, {
            data: scaleData(CURVE_TEMPLATES[shape], maxDay, maxValue)
          }));
          props.click();
        }}>
        {t("apply")}
      </button>
    </div>
  </div>;
};

export const copyCurve = (curve: TaggedCurve, dispatch: Function) => () => {
  dispatch(initSaveGetId("Curve", {
    ...curve.body,
    name: `${curve.body.name} ${t("copy")}`,
    id: curve.body.id || 0 + 1, // remove after API implementation
  }))
    .then((id: number) => push(Path.curves(id)))
    .catch(() => { });
};

export const curveDataTableRow = (curve: TaggedCurve, dispatch: Function) =>
  ([day, value]: [string, number], index: number) => {
    const active = inData(curve.body.data, day);
    const percent = () => {
      const prev = populatedData(curve.body.data)[index] || 0;
      if (prev == 0) { return <p>-</p>; }
      const val = round((value - prev) / prev * 100, -1);
      const color = () => {
        if (val > 0.1) { return "percent-green"; }
        if (val < -0.1) { return "percent-red"; }
      };
      return <p className={color()}>
        {`${val > 0 ? "+" : ""}${val}%`}
      </p>;
    };
    return <tr key={day}>
      <td className={active ? "active" : ""}>
        <p>{day}</p>
        <button
          className={[
            "row-radio",
            active ? "active" : "",
          ].join(" ")}
          onClick={() => {
            dispatch(editCurve(curve, {
              data: addOrRemoveItem(curve.body.data, day, value),
            }));
          }} />
      </td>
      <td className={active ? "active-input" : ""}>
        {active
          ? <input type={"number"}
            defaultValue={value}
            onChange={e => {
              const value = parseInt(e.currentTarget.value);
              isFinite(value) && dispatch(editCurve(curve, {
                data: {
                  ...curve.body.data,
                  [day]: value,
                }
              }));
            }} />
          : <p>{value}</p>}
      </td>
      <td>
        {curve.body.type == CurveType.water
          ? <p>{curveSum(curve.body.data, day)}</p>
          : percent()}
      </td>
    </tr>;
  };

export const editCurve = (curve: TaggedCurve, update: Partial<Curve>) =>
  (dispatch: Function) => {
    dispatch(overwrite(curve, { ...curve.body, ...update }));
    // dispatch(save(curve.uuid)); // uncomment after API implementation
  };
