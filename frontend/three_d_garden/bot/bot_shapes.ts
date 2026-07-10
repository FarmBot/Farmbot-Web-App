import React from "react";
import { Shape } from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import { range } from "lodash";
import { ASSETS } from "../constants";
import { BotVersion } from "./bot_versions";

interface RequestedShapes {
  track: boolean;
  beam: boolean;
  beamV19: boolean;
  column: boolean;
  zAxis: boolean;
}

export interface BotShapes {
  track: Shape | undefined;
  beam: Shape | undefined;
  column: Shape | undefined;
  zAxis: Shape | undefined;
}

interface BotShapeCache {
  track?: Shape;
  beam?: Shape;
  beamV19?: Shape;
  column?: Shape;
  zAxis?: Shape;
}

const botShapeCache: BotShapeCache = {};

export const clearBotShapeCache = () => {
  botShapeCache.track = undefined;
  botShapeCache.beam = undefined;
  botShapeCache.beamV19 = undefined;
  botShapeCache.column = undefined;
  botShapeCache.zAxis = undefined;
};

export const useBotShapes = (
  tracks: boolean,
  version: BotVersion,
): BotShapes => {
  const [track, setTrack] =
    React.useState<Shape | undefined>(() => botShapeCache.track);
  const [beam, setBeam] =
    React.useState<Shape | undefined>(() => botShapeCache.beam);
  const [beamV19, setBeamV19] =
    React.useState<Shape | undefined>(() => botShapeCache.beamV19);
  const [column, setColumn] =
    React.useState<Shape | undefined>(() => botShapeCache.column);
  const [zAxis, setZAxis] =
    React.useState<Shape | undefined>(() => botShapeCache.zAxis);
  const requested = React.useRef<RequestedShapes>({
    track: false,
    beam: false,
    beamV19: false,
    column: false,
    zAxis: false,
  });

  React.useEffect(() => {
    let loader: SVGLoader | undefined;
    const getLoader = () => {
      loader ||= new SVGLoader();
      return loader;
    };
    if (tracks && !track && !requested.current.track) {
      requested.current.track = true;
      getLoader().load(ASSETS.shapes.track, svg => {
        const smallCutout = SVGLoader.createShapes(svg.paths[0])[0];
        const largeCutout = SVGLoader.createShapes(svg.paths[1])[0];
        const outline = SVGLoader.createShapes(svg.paths[2])[0];
        outline.holes.push(smallCutout);
        outline.holes.push(largeCutout);
        botShapeCache.track = outline;
        setTrack(outline);
      });
    }
    const selectedBeam = version.beamShape == "beamV19" ? beamV19 : beam;
    if (!selectedBeam && !requested.current[version.beamShape]) {
      requested.current[version.beamShape] = true;
      getLoader().load(ASSETS.shapes[version.beamShape], svg => {
        const outline = SVGLoader.createShapes(svg.paths[0])[0];
        range(1, svg.paths.length).map(i => {
          const hole = SVGLoader.createShapes(svg.paths[i])[0];
          outline.holes.push(hole);
        });
        botShapeCache[version.beamShape] = outline;
        version.beamShape == "beamV19"
          ? setBeamV19(outline)
          : setBeam(outline);
      });
    }
    if (!column && !requested.current.column) {
      requested.current.column = true;
      getLoader().load(ASSETS.shapes.column, svg => {
        const outline = SVGLoader.createShapes(svg.paths[3])[0];
        range(3).map(i => {
          const hole = SVGLoader.createShapes(svg.paths[i])[0];
          outline.holes.push(hole);
        });
        botShapeCache.column = outline;
        setColumn(outline);
      });
    }
    if (!zAxis && !requested.current.zAxis) {
      requested.current.zAxis = true;
      getLoader().load(ASSETS.shapes.zAxis, svg => {
        const hole = SVGLoader.createShapes(svg.paths[1])[0];
        const outline = SVGLoader.createShapes(svg.paths[0])[0];
        outline.holes.push(hole);
        botShapeCache.zAxis = outline;
        setZAxis(outline);
      });
    }
  }, [beam, beamV19, column, track, tracks, version.beamShape, zAxis]);

  return {
    track,
    beam: version.beamShape == "beamV19" ? beamV19 : beam,
    column,
    zAxis,
  };
};
