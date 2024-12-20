import React from "react";
import { t } from "../i18next_wrapper";
import { connect } from "react-redux";
import { SpecialStatus, TaggedCurve } from "farmbot";
import { round, take } from "lodash";
import {
  DesignerPanel, DesignerPanelHeader, DesignerPanelContent,
} from "../farm_designer/designer_panel";
import { Everything } from "../interfaces";
import { Panel, PanelColor } from "../farm_designer/panel_header";
import { selectAllCurves, selectAllPlantPointers } from "../resources/selectors";
import { destroy, init, overwrite, save } from "../api/crud";
import { Path } from "../internal_urls";
import { ResourceTitle } from "../sequences/panel/editor";
import { Curve } from "farmbot/dist/resources/api_resources";
import { BlurableInput, FBSelect, Popover } from "../ui";
import { CurveSvgWithPopover } from "./chart";
import {
  populatedData, scaleData, addOrRemoveItem, curveSum, inData, maxDay,
  maxValue, dataFull,
} from "./data_actions";
import {
  ActionMenuProps, CurveDataTableRowProps, EditCurveProps, EditCurveState,
  PercentChangeProps,
  ValueInputProps,
} from "./interfaces";
import {
  curveColor, CurveShape, CurveType, CURVE_SHAPE_DDIS, CURVE_TEMPLATES,
  TemplateOption, templateScale, templateShape,
} from "./templates";
import { sourceFbosConfigValue } from "../settings/source_config_value";
import { unpackUUID, validFbosConfig } from "../util";
import { getFbosConfig } from "../resources/getters";
import { botSize } from "../farm_designer/state_to_props";
import { resourceUsageList } from "../resources/in_use";
import { error } from "../toast/toast";
import { PointGroupItem } from "../point_groups/point_group_item";
import { CURVE_KEY_LOOKUP } from "../plants/curve_info";
import {
  calcMaxCount, MoreIndicatorIcon,
} from "../point_groups/criteria/component";
import { GetState } from "../redux/interfaces";
import { Navigate, NavigateFunction } from "react-router";
import { NavigationContext } from "../routes_helpers";

const columnTitle = (curve: TaggedCurve) => {
  switch (curve.body.type) {
    case CurveType.water: return t("Volume (mL)");
    case CurveType.spread: return t("Expected spread (mm)");
    case CurveType.height: return t("Expected height (mm)");
  }
};

export const mapStateToProps = (props: Everything): EditCurveProps => {
  const curves = selectAllCurves(props.resources.index);
  return {
    dispatch: props.dispatch,
    curves,
    plants: selectAllPlantPointers(props.resources.index),
    findCurve: id => curves.filter(g => g.body.id == id)[0],
    sourceFbosConfig: sourceFbosConfigValue(
      validFbosConfig(getFbosConfig(props.resources.index)),
      props.bot.hardware.configuration),
    botSize: botSize(props),
    resourceUsage: resourceUsageList(props.resources.index.inUse),
  };
};

export class RawEditCurve extends React.Component<EditCurveProps, EditCurveState> {
  state: EditCurveState = {
    templates: false, scale: false, hovered: undefined, warningText: false,
    uuid: this.curve?.uuid, maxCount: calcMaxCount(), iconDisplay: true,
  };

  componentDidMount = () => this.setState({ maxCount: calcMaxCount() });

  toggleExpand = () => this.setState({
    maxCount: this.state.maxCount > 100 ? calcMaxCount() : 1000,
  });

  toggleIconShow = () => this.setState({ iconDisplay: !this.state.iconDisplay });

  componentWillUnmount() {
    if (!this.state.uuid) { return; }
    const id = unpackUUID(this.state.uuid).remoteId;
    if (!id) { return; }
    const curve = this.props.findCurve(id);
    if (!(curve?.specialStatus == SpecialStatus.DIRTY)) { return; }
    this.props.dispatch(save(this.state.uuid));
  }

  get stringyID() { return Path.getSlug(Path.curves()); }
  get curve() {
    if (this.stringyID) {
      return this.props.findCurve(parseInt(this.stringyID));
    }
  }

  toggle = (key: keyof EditCurveState) => () =>
    this.setState({ ...this.state, [key]: !this.state[key] });

  setHovered = (hovered: string | undefined) => this.setState({ hovered });

  UsingThisCurve = () => {
    const { curve } = this;
    const plantsUsingCurve = curve
      ? this.props.plants.filter(plant =>
        plant.body[CURVE_KEY_LOOKUP[curve.body.type]] == curve.body.id)
      : [];
    return <div className={"curve-usage-display"}>
      <label>
        {t("USING THIS CURVE ({{count}})", {
          count: plantsUsingCurve.length
        })}
      </label>
      <i onClick={this.toggleIconShow}
        className={`fa fa-caret-${this.state.iconDisplay ? "up" : "down"}`}
        title={this.state.iconDisplay
          ? t("hide icons")
          : t("show icons")} />
      {this.state.iconDisplay && plantsUsingCurve.length > 0 &&
        <div className={"point-list-wrapper"}>
          {take(plantsUsingCurve, this.state.maxCount).map(point =>
            <PointGroupItem key={point.uuid}
              point={point} navigate={true} />)}
          <MoreIndicatorIcon count={plantsUsingCurve.length}
            maxCount={this.state.maxCount} onClick={this.toggleExpand} />
        </div>}
    </div>;
  };

  static contextType = NavigationContext;
  context!: React.ContextType<typeof NavigationContext>;
  navigate = this.context;

  render() {
    const { curve, setHovered } = this;
    const { dispatch } = this.props;
    const { hovered } = this.state;
    const curvesPath = Path.curves();
    return <DesignerPanel panelName={"curve-info"} panel={Panel.Curves}>
      {!curve && Path.startsWith(curvesPath) && <Navigate to={curvesPath} />}
      <DesignerPanelHeader
        panelName={Panel.Curves}
        panelColor={PanelColor.gray}
        titleElement={<ResourceTitle
          key={curve?.body.name}
          resource={curve}
          save={true}
          fallback={t("No Curve selected")}
          dispatch={dispatch} />}
        backTo={curvesPath}>
        <div className={"panel-header-icon-group"}>
          {curve &&
            <i className={"fa fa-copy fb-icon-button invert"}
              title={t("Copy curve")}
              onClick={dispatch(copyCurve(
                this.props.curves,
                curve,
                this.navigate))} />}
          {curve &&
            <i className={"fa fa-trash fb-icon-button invert"}
              title={t("Delete curve")}
              onClick={() => this.props.resourceUsage[curve.uuid]
                ? error(t("Curve in use."))
                : dispatch(destroy(curve.uuid))} />}
        </div>
      </DesignerPanelHeader>
      <DesignerPanelContent panelName={"curve-info"}>
        {curve
          ? <div className={"curve-info-panel-content-wrapper"}>
            <Popover
              isOpen={this.state.scale}
              popoverClassName={"curve-action-popover"}
              target={<button className={"fb-button clear"}
                onClick={this.toggle("scale")}>
                {t("scale")}
              </button>}
              content={<ScaleMenu dispatch={dispatch} curve={curve}
                click={this.toggle("scale")} />} />
            <Popover
              isOpen={this.state.templates}
              popoverClassName={"curve-action-popover"}
              target={<button className={"fb-button clear"}
                onClick={this.toggle("templates")}>
                {t("templates")}
              </button>}
              content={<TemplatesMenu dispatch={dispatch} curve={curve}
                click={this.toggle("templates")} />} />
            <CurveSvgWithPopover dispatch={dispatch} curve={curve}
              sourceFbosConfig={this.props.sourceFbosConfig}
              botSize={this.props.botSize}
              hovered={hovered} setHovered={setHovered}
              editable={true} />
            <p className={"full-indicator"}>
              {dataFull(curve.body.data)
                ? t("Maximum number of control points reached.")
                : ""}
            </p>
            <this.UsingThisCurve />
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
                  .map(curveDataTableRow({ curve, dispatch, hovered, setHovered }))}
              </tbody>
            </table>
          </div>
          : <span>{t("Redirecting")}...</span>}
      </DesignerPanelContent>
    </DesignerPanel>;
  }
}

export const EditCurve = connect(mapStateToProps)(RawEditCurve);
// eslint-disable-next-line import/no-default-export
export default EditCurve;

export const ScaleMenu = (props: ActionMenuProps) => {
  const { data } = props.curve.body;
  const [maxDayNum, setMaxDay] = React.useState(maxDay(data));
  const [maxValueNum, setMaxValue] = React.useState(maxValue(data));
  return <div className={"curve-action-menu grid half-gap"}>
    <div className={"row grid-2-col"}>
      <label>{t("max value")}</label>
      <input type={"number"}
        defaultValue={maxValueNum}
        onChange={e => {
          const value = parseInt(e.currentTarget.value);
          isFinite(value) && value > 0 && setMaxValue(value);
        }} />
    </div>
    <div className={"row grid-2-col"}>
      <label>{t("days")}</label>
      <input type={"number"}
        defaultValue={maxDayNum}
        min={1} max={200}
        onChange={e => {
          const day = parseInt(e.currentTarget.value);
          isFinite(day) && day > 0 && day < 201 && setMaxDay(day);
        }} />
    </div>
    <div className={"row grid-2-col"}>
      <div />
      <button className={"fb-button clear"}
        onClick={() => {
          props.dispatch(editCurve(props.curve, {
            data: scaleData(props.curve.body.data, maxDayNum, maxValueNum)
          }));
          props.click();
        }}>
        {t("apply")}
      </button>
    </div>
  </div>;
};

export const TemplatesMenu = (props: ActionMenuProps) => {
  const { type } = props.curve.body;
  const [shapeCache, setShapeCache] = templateShape(type);
  const [shape, setShapeState] = React.useState(shapeCache);
  const [maxDayCache, setMaxDayCache] = templateScale(type, TemplateOption.day);
  const [maxDay, setMaxDayState] = React.useState(maxDayCache);
  const [maxValueCache, setMaxValueCache] =
    templateScale(type, TemplateOption.value);
  const [maxValue, setMaxValueState] = React.useState(maxValueCache);
  const setShape = (value: string) => {
    setShapeState(value as CurveShape);
    setShapeCache(value);
  };
  const setMaxDay = (value: number) => {
    setMaxDayState(value);
    setMaxDayCache(value);
  };
  const setMaxValue = (value: number) => {
    setMaxValueState(value);
    setMaxValueCache(value);
  };
  return <div className={"curve-action-menu grid half-gap"}>
    <div className={"row grid-2-col"}>
      <label>{t("shape")}</label>
      <FBSelect key={shape}
        list={Object.values(CURVE_SHAPE_DDIS())}
        selectedItem={CURVE_SHAPE_DDIS()[shape]}
        onChange={ddi => setShape("" + ddi.value)} />
    </div>
    <div className={"row grid-2-col"}>
      <label>{t("max value")}</label>
      <input type={"number"}
        defaultValue={maxValue}
        onChange={e => {
          const value = parseInt(e.currentTarget.value);
          isFinite(value) && value > 0 && setMaxValue(value);
        }} />
    </div>
    <div className={"row grid-2-col"}>
      <label>{t("days")}</label>
      <input type={"number"}
        defaultValue={maxDay}
        min={1} max={200}
        onChange={e => {
          const day = parseInt(e.currentTarget.value);
          isFinite(day) && day > 0 && day < 201 && setMaxDay(day);
        }} />
    </div>
    <div className={"row grid-2-col"}>
      <div />
      <button className={"fb-button clear"}
        onClick={() => {
          props.dispatch(editCurve(props.curve, {
            data: scaleData(CURVE_TEMPLATES[shape], maxDay, maxValue,
              shape != CurveShape.constant)
          }));
          props.click();
        }}>
        {t("apply")}
      </button>
    </div>
  </div>;
};

export const copyCurve =
  (curves: TaggedCurve[], curve: TaggedCurve, navigate: NavigateFunction) =>
    (dispatch: Function, getState: GetState) => {
      return () => {
        const existingNames = curves.map(c => c.body.name);
        let i = 1;
        const newName = (count: number) =>
          `${curve.body.name} ${t("copy")} ${count}`;
        while (existingNames.includes(newName(i))) {
          i++;
        }
        const action = init("Curve", {
          ...curve.body,
          name: newName(i),
          id: undefined,
        });
        dispatch(action);
        dispatch(save(action.payload.uuid))
          .then(() => {
            const id = selectAllCurves(getState().resources.index).filter(curve =>
              curve.uuid == action.payload.uuid)[0]?.body.id;
            id && navigate(Path.curves(id));
          })
          .catch(() => { });
      };
    };

export const curveDataTableRow = (props: CurveDataTableRowProps) =>
  ([day, value]: [string, number], index: number) => {
    const { dispatch, curve, hovered, setHovered } = props;
    const active = inData(curve.body.data, day);
    return <tr key={day} className={hovered == day ? "hovered" : ""}
      onMouseEnter={() => setHovered(day)}
      onMouseLeave={() => setHovered(undefined)}>
      <td className={active ? "active" : ""}>
        <p>{day}</p>
        <button
          className={[
            "row-radio",
            active ? "active" : "",
            dataFull(curve.body.data) ? "full" : "",
          ].join(" ")}
          style={active ? { background: curveColor(curve) } : {}}
          onClick={() => {
            dispatch(editCurve(curve, {
              data: addOrRemoveItem(curve.body.data, day, value),
            }));
          }} />
      </td>
      <td className={active ? "active-input" : ""}>
        {active
          ? <ValueInput day={day} value={value} dispatch={dispatch} curve={curve} />
          : <p>{value}</p>}
      </td>
      <td>
        {curve.body.type == CurveType.water
          ? <p>{curveSum(curve.body.data, day)}</p>
          : <PercentChange curve={curve} index={index} value={value} />}
      </td>
    </tr>;
  };

const PercentChange = (props: PercentChangeProps) => {
  const exactData = populatedData(props.curve.body.data, true);
  const prev = exactData[props.index] || 0;
  const value = exactData[props.index + 1];
  if (prev == 0) { return <p>-</p>; }
  const exactValue = (value - prev) / prev * 100;
  const val = round(exactValue, exactValue < 10 ? 1 : 0);
  const color = () => {
    if (val > 0.1) { return "percent-green"; }
    if (val < -0.1) { return "percent-red"; }
  };
  return <p className={color()}>
    {`${val > 0 ? "+" : ""}${val}%`}
  </p>;
};

const ValueInput = (props: ValueInputProps) =>
  <BlurableInput
    type={"number"}
    value={props.value}
    min={0}
    onCommit={e =>
      props.dispatch(editCurve(props.curve, {
        data: {
          ...props.curve.body.data,
          [props.day]: parseInt(e.currentTarget.value),
        }
      }))} />;

export const editCurve = (curve: TaggedCurve, update: Partial<Curve>) =>
  (dispatch: Function) => {
    dispatch(overwrite(curve, { ...curve.body, ...update }));
  };
