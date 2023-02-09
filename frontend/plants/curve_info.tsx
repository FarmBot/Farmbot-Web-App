import React from "react";
import { countBy } from "lodash";
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
import { DropDownItem, FBSelect } from "../ui";
import { Actions } from "../constants";

export const AllCurveInfo = (props: AllCurveInfoProps) => {
  return <div className={"all-curve-info"}>
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
  return <div className={"crop-curve-info"}>
    <div className={"active-curve-name"}>
      <label>{t(CURVE_TYPES()[props.curveType])}</label>
      <FBSelect key={curve?.uuid}
        allowEmpty={true}
        list={curvesDropdownList({ curves, curveType, current: curve, plants })}
        selectedItem={curve ? curveToDdi(curve) : undefined}
        onChange={ddi => {
          (ddi.headingId || ddi.isNull)
            && onChange(ddi.isNull ? undefined : ddi.value, props.curveType);
        }} />
      {curve && <Link to={Path.curves(curve.body.id)} title={t("edit curve")}>
        <i className="fa fa-external-link" />
      </Link>}
    </div>
    {curve && <CurveSvgWithPopover dispatch={props.dispatch} curve={curve}
      x={plant?.x} y={plant?.y}
      farmwareEnvs={props.farmwareEnvs}
      soilHeightPoints={props.soilHeightPoints}
      sourceFbosConfig={props.sourceFbosConfig}
      hovered={hovered} setHovered={setHovered}
      botSize={props.botSize} editable={false} />}
  </div>;
};

interface CurvesDropdownListProps {
  curves: TaggedCurve[];
  curveType: CurveType;
  current: TaggedCurve | undefined;
  plants: TaggedPlantPointer[];
}

const curvesDropdownList = (props: CurvesDropdownListProps) => {
  const list: (DropDownItem | undefined)[] = [];
  const mostUsedCurve = findMostUsedCurveForCrop({
    plants: props.plants,
    curves: props.curves,
    openfarmSlug: Path.getSlug(Path.cropSearch()),
  })(props.curveType);
  if (mostUsedCurve && props.current?.body.id != mostUsedCurve.body.id) {
    list.push({
      label: t("Most used"), value: "", heading: true,
    });
    list.push(curveToDdi(mostUsedCurve));
  }
  const usedIds = props.plants.map(plant =>
    plant.body[CURVE_KEY_LOOKUP[props.curveType]]);
  list.push({
    label: t("Currently used with this crop"), value: "", heading: true,
  });
  const curvesOfType = props.curves.filter(curve =>
    curve.body.type == props.curveType);
  curvesOfType.filter(curve =>
    usedIds.includes(curve.body.id))
    .map(curve => list.push(curveToDdi(curve)));
  list.push({
    label: t("Other curves"), value: "", heading: true,
  });
  curvesOfType
    .filter(curve => !usedIds.includes(curve.body.id))
    .map(curve => list.push(curveToDdi(curve)));
  return betterCompact(list);
};

const curveToDdi = (curve: TaggedCurve): DropDownItem | undefined =>
  curve.body.id
    ? ({
      label: `${curve.body.name} - ${curveInfo(curve)}`,
      value: curve.body.id,
      headingId: curve.body.type,
    })
    : undefined;

interface FindCurveProps {
  openfarmSlug: string;
  plants: TaggedPlantPointer[];
  curves: TaggedCurve[];
}

export const findMostUsedCurveForCrop = (props: FindCurveProps) =>
  (curveType: CurveType): TaggedCurve | undefined => {
    const { openfarmSlug, plants, curves } = props;
    const counts = countBy(plants
      .filter(p => p.body.openfarm_slug == openfarmSlug)
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
