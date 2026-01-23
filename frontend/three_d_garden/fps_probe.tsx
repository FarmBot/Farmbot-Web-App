import React from "react";
import { useFrame } from "@react-three/fiber";

export const FPSProbe = () => {
  const frameCount = React.useRef(0);
  const lastTime = React.useRef(performance.now());

  React.useEffect(() => {
    window.__fps = 0;
    return () => {
      delete window.__fps;
    };
  }, []);

  useFrame(() => {
    const now = performance.now();
    frameCount.current += 1;
    if (now - lastTime.current >= 1000) {
      const elapsed = (now - lastTime.current) / 1000;
      const fps = frameCount.current / elapsed;
      window.__fps = fps;
      console.log(`FPS: ${fps.toFixed(2)}`);
      frameCount.current = 0;
      lastTime.current = now;
    }
  });

  return undefined;
};
