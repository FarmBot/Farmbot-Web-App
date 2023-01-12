import { Curve } from "farmbot/dist/resources/api_resources";
import { Color } from "../../ui";
import { fakeCurve } from "../../__test_support__/fake_state/resources";
import { curveColor, curvePanelColor, CurveType } from "../templates";

describe("curveColor()", () => {
  it.each<[Curve["type"], string]>([
    [CurveType.water, Color.curveDarkBlue],
    [CurveType.spread, Color.curveDarkGreen],
    [CurveType.height, Color.curveDarkPurple],
  ])("returns color for %s curve", (type, color) => {
    const curve = fakeCurve();
    curve.body.type = type;
    expect(curveColor(curve)).toEqual(color);
  });
});

describe("curvePanelColor()", () => {
  it.each<[Curve["type"], string]>([
    [CurveType.water, Color.curveBlue],
    [CurveType.spread, Color.curveGreen],
    [CurveType.height, Color.curvePurple],
  ])("returns color for %s curve", (type, color) => {
    const curve = fakeCurve();
    curve.body.type = type;
    expect(curvePanelColor(curve)).toEqual(color);
  });
});
