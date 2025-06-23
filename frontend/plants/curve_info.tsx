import React from "react";
import { countBy, sortBy, uniq } from "lodash";
import { t } from "../i18next_wrapper";
import { Path } from "../internal_urls";
import { Link } from "../link";
import { AllCurveInfoProps, CurveInfoProps } from "../curves/interfaces";
import { CurveSvgWithPopover } from "../curves/chart";
import { betterCompact } from "../util";
import { TaggedCurve, TaggedPlantPointer } from "farmbot";
import { CurveType } from "../curves/templates";
import { PlantPointer } from "farmbot/dist/resources/api_resources";
import { curveInfo, CURVE_TYPES } from "../curves/curves_inventory";
import { DropDownItem, FBSelect, NULL_CHOICE } from "../ui";
import { Actions } from "../constants";
import { FormattedPlantInfo } from "./map_state_to_props";
import { DesignerState } from "../farm_designer/interfaces";

export const AllCurveInfo = (props: AllCurveInfoProps) => {
  return <div className={"all-curve-info grid"}>
    {[CurveType.water, CurveType.spread, CurveType.height].map(curveType => {
      return <CurveInfo key={curveType}
        dispatch={props.dispatch}
        curveType={curveType}
        plant={props.plant}
        curve={props.findCurve(curveType)}
        curves={props.curves}
        plants={props.plants}
        onChange={props.onChange}
        farmwareEnvs={props.farmwareEnvs}
        soilHeightPoints={props.soilHeightPoints}
        sourceFbosConfig={props.sourceFbosConfig}
        botSize={props.botSize} />;
    })}
  </div>;
};

export const CurveInfo = (props: CurveInfoProps) => {
  const { plant, onChange, curve, curves, plants, curveType } = props;
  const [hovered, setHovered] = React.useState<string | undefined>(undefined);
  return <div className={"info-box grid no-gap"}>
    <div className={"row grid-2-col grid-exp-2"}>
      <label>{t(CURVE_TYPES()[props.curveType])}</label>
      <div className={"row half-gap"}>
        {curve && <Link to={Path.curves(curve.body.id)} title={t("edit curve")}>
          <i className={"fa fa-external-link fb-icon-button invert"} />
        </Link>}
        <FBSelect key={curve?.uuid}
          list={curvesDropdownList({ curves, curveType, plants, plant })}
          selectedItem={curve ? curveToDdi(curve) : undefined}
          onChange={ddi => {
            (ddi.headingId || ddi.isNull)
              && onChange(ddi.isNull ? undefined : ddi.value, props.curveType);
          }} />
      </div>
    </div>
    {curve && <CurveSvgWithPopover dispatch={props.dispatch} curve={curve}
      x={plant?.x} y={plant?.y}
      farmwareEnvs={props.farmwareEnvs}
      soilHeightPoints={props.soilHeightPoints}
      sourceFbosConfig={props.sourceFbosConfig}
      hovered={hovered || "" + plant?.daysOld} setHovered={setHovered}
      botSize={props.botSize} editable={false} />}
  </div>;
};

interface CurvesDropdownListProps {
  curves: TaggedCurve[];
  curveType: CurveType;
  plants: TaggedPlantPointer[];
  plant?: FormattedPlantInfo;
}

const curvesDropdownList = (props: CurvesDropdownListProps) => {
  const slug = props.plant?.slug || Path.getCropSlug();
  const list: (DropDownItem | undefined)[] = [];
  list.push(NULL_CHOICE);
  const usedIds = props.plants
    .filter(plant => plant.body.openfarm_slug == slug)
    .map(plant => plant.body[CURVE_KEY_LOOKUP[props.curveType]])
    .filter(id => id);
  list.push({
    label: t("Currently used with this crop"), value: "", heading: true,
  });
  sortBy(Object.entries(countBy(usedIds)), ([_id, count]) => count)
    .reverse()
    .map(([id, count]) => {
      const curve = props.curves.filter(c => c.body.id == parseInt(id))[0];
      list.push(curveToDdi(curve, count));
    });
  list.push({
    label: t("Other curves"), value: "", heading: true,
  });
  props.curves.filter(curve => curve.body.type == props.curveType)
    .filter(curve => !uniq(usedIds).includes(curve.body.id))
    .map(curve => list.push(curveToDdi(curve)));
  return betterCompact(list);
};

export const curveToDdi =
  (curve: TaggedCurve, useCount?: number): DropDownItem | undefined => {
    const uses = useCount ? ` (${useCount})` : "";
    return curve.body.id
      ? ({
        label: `${curve.body.name} - ${curveInfo(curve)}${uses}`,
        value: curve.body.id,
        headingId: curve.body.type,
      })
      : undefined;
  };

interface FindCurveProps {
  slug: string;
  plants: TaggedPlantPointer[];
  curves: TaggedCurve[];
}

export const findMostUsedCurveForCrop = (props: FindCurveProps) =>
  (curveType: CurveType): TaggedCurve | undefined => {
    const { slug, plants, curves } = props;
    const counts = countBy(plants
      .filter(p => p.body.openfarm_slug == slug)
      .map(p => p.body[CURVE_KEY_LOOKUP[curveType]] as number | undefined)
      .filter(x => x));
    const maxCount = Math.max(...Object.values(counts));
    const curveId = Object.entries(counts)
      .filter(([id, _count]) => id != "undefined")
      .filter(([_id, count]) => count == maxCount)[0]?.[0];
    return curves.filter(curve => curve.body.id == parseInt(curveId))[0];
  };

export const CURVE_KEY_LOOKUP: Record<CurveType, keyof PlantPointer> = {
  [CurveType.water]: "water_curve_id",
  [CurveType.spread]: "spread_curve_id",
  [CurveType.height]: "height_curve_id",
};

export const CURVE_ACTION_LOOKUP: Record<CurveType, Actions> = {
  [CurveType.water]: Actions.SET_CROP_WATER_CURVE_ID,
  [CurveType.spread]: Actions.SET_CROP_SPREAD_CURVE_ID,
  [CurveType.height]: Actions.SET_CROP_HEIGHT_CURVE_ID,
};

export const curveId = (designer: DesignerState) => {
  return {
    [CurveType.water]: designer.cropWaterCurveId,
    [CurveType.spread]: designer.cropSpreadCurveId,
    [CurveType.height]: designer.cropHeightCurveId,
  };
};

export const findCurve = (curves: TaggedCurve[], designer: DesignerState) =>
  (curveType: CurveType): TaggedCurve | undefined =>
    curves.filter(curve => curve.body.id &&
      curve.body.id == curveId(designer)[curveType])[0];

export const changeCurve = (dispatch: Function) =>
  (id: string | number | undefined, curveType: CurveType) => {
    dispatch({ type: CURVE_ACTION_LOOKUP[curveType], payload: id });
  };
