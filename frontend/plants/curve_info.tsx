import React from "react";
import { countBy } from "lodash";
import { t } from "../i18next_wrapper";
import { Path } from "../internal_urls";
import { Link } from "../link";
import {
  AllCurveInfoProps, CurveInfoProps, EditableAllCurveInfoProps,
} from "../curves/interfaces";
import { CurveSvg } from "../curves/chart";
import { betterCompact } from "../util";
import { TaggedCurve, TaggedPlantPointer } from "farmbot";
import { CurveType } from "../curves/templates";
import { PlantPointer } from "farmbot/dist/resources/api_resources";
import { curveInfo, CURVE_TYPES } from "../curves/curves_inventory";
import { DropDownItem, FBSelect } from "../ui";
import { FormattedPlantInfo } from "./map_state_to_props";

export const AllCurveInfo = (props: AllCurveInfoProps) => {
  const findCurve = findMostUsedCurveForCrop({
    plants: props.plants,
    curves: props.curves,
    openfarmSlug: props.openfarmSlug,
  });
  return <div className={"all-curve-info"}>
    {[CurveType.water, CurveType.spread, CurveType.height].map(curveType => {
      const curve = findCurve(curveType);
      return curve &&
        <CurveInfo key={curveType} dispatch={props.dispatch}
          curveType={curveType}
          curve={curve}
          curves={props.curves}
          sourceFbosConfig={props.sourceFbosConfig}
          botSize={props.botSize} />;
    })}
  </div>;
};

export const EditableAllCurveInfo = (props: EditableAllCurveInfoProps) =>
  <div className={"all-curve-info"}>
    {[CurveType.water, CurveType.spread, CurveType.height].map(curveType => {
      const curve = props.curves.filter(curve =>
        curve.body.id == props.plant[CURVE_KEY_LOOKUP[curveType
        ] as keyof FormattedPlantInfo])[0];
      return <CurveInfo key={curveType} dispatch={props.dispatch}
        curveType={curveType}
        plant={props.plant}
        updatePlant={props.updatePlant}
        curve={curve}
        curves={props.curves}
        farmwareEnvs={props.farmwareEnvs}
        soilHeightPoints={props.soilHeightPoints}
        sourceFbosConfig={props.sourceFbosConfig}
        botSize={props.botSize} />;
    })}
  </div>;

export const CurveInfo = (props: CurveInfoProps) => {
  const { plant, updatePlant, curve } = props;
  const [hovered, setHovered] = React.useState<string | undefined>(undefined);
  return <div className={"crop-curve-info"}>
    <div className={"active-curve-name"}>
      <label>{t(CURVE_TYPES()[props.curveType])}</label>
      {updatePlant && plant
        ? <FBSelect key={plant.uuid}
          allowEmpty={true}
          list={betterCompact(props.curves
            .filter(c => c.body.type == props.curveType)
            .map(curveToDdi))}
          selectedItem={curve ? curveToDdi(curve) : undefined}
          onChange={ddi => {
            (ddi.headingId || ddi.isNull) && updatePlant(plant.uuid, {
              [CURVE_KEY_LOOKUP[props.curveType]]:
                ddi.isNull ? undefined : ddi.value,
            }, true);
          }} />
        : <p>{curve ? `${curve.body.name} - ${curveInfo(curve)}` : t("None")}</p>}
      {curve && <Link to={Path.curves(curve.body.id)} title={t("edit curve")}>
        <i className="fa fa-external-link" />
      </Link>}
    </div>
    {curve && <CurveSvg dispatch={props.dispatch} curve={curve}
      x={plant?.x} y={plant?.y}
      farmwareEnvs={props.farmwareEnvs}
      soilHeightPoints={props.soilHeightPoints}
      sourceFbosConfig={props.sourceFbosConfig}
      hovered={hovered} setHovered={setHovered}
      botSize={props.botSize} editable={false} />}
  </div>;
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

const CURVE_KEY_LOOKUP: Record<CurveType, keyof PlantPointer> = {
  [CurveType.water]: "water_curve_id",
  [CurveType.spread]: "spread_curve_id",
  [CurveType.height]: "height_curve_id",
};
