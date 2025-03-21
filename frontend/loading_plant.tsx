import React from "react";
import { Color } from "./ui";
import { t } from "./i18next_wrapper";

/* eslint-disable max-len */

export function LoadingPlant({ animate }: { animate: boolean }) {
  const initialLoadingEl = document.getElementsByClassName("initial-loading-text");
  if (initialLoadingEl.length > 0) { initialLoadingEl[0].outerHTML = ""; }
  return <div className="loading-plant-div-container">
    <svg width="300px" height="500px">
      {animate &&
        <g>
          <circle
            className="loading-plant-circle"
            cx={150}
            cy={250}
            r={110}
            stroke={Color.white}
            strokeOpacity={0.7}
            strokeWidth={6}
            strokeDasharray={16}
            fill={Color.white}
            fillOpacity={0.25} />
          <g className="loading-plant-svg-container">
            <g className="loading-plant">
              <path
                className="loading-plant-background"
                strokeWidth="0px"
                stroke="#316131"
                fill="#316131"
                d="M424,125.9c-3.7-4.8-8.8-8.3-14.4-10c1.1-31.5-5.3-56-10.9-71c-6-16.1-16.7-36.5-33.5-42.1   c-2.5-0.8-5.1-1.4-7.9-1.6l0,0l0,0c-17-1.3-36.9,9.9-47.2,16.7c-12.8,8.4-31.5,23.5-48.7,47.8c-2.5-0.9-5.1-1.5-7.7-1.7   c-11.8-0.9-22.8,5.3-28.2,15.7c-4.2,8.2-7.9,16.9-10.8,25.7c-9.4,27.8-11.9,54.2-7.5,80.5c-3.1,0-6.2,0.4-9.1,1.4   c-24.6-23.9-51.2-33.8-67.1-35.1c-7.4-0.6-14,0.6-19.5,3.4c-11,5.8-18.7,18.8-22.8,38.7c-2.3,11.2-4.2,28.8-0.7,50.3   c-2.9,2.2-5.4,4.9-7.3,8.1c-4.2,7.1-5.1,15.6-2.4,23.4c2.3,6.7,5.2,13.3,8.5,19.6c12.8,24.4,30,42.1,52.7,54.1   c14.9,7.9,30.3,12.2,44.6,15.1c12.3,34.5,17.8,63.8,17.5,93.7l0.1,0c0,0.4-0.1,0.8-0.1,1.2c-1.6,20,13.9,37.6,34.5,39.2   c21.7,1.7,38.8-13.1,40.5-35.1l0-0.2c0.6-8,6.3-78.3,27.2-176c49-16,95.6-42.7,118.9-111.8c3-8.8,5.3-17.8,6.9-26.8   C431.1,140.7,429,132.4,424,125.9z" />
              <path
                className="loading-plant-leaf"
                fill="#57A357"
                d="M204.4,211.4l-6.6,6.7c-1.5,1.5-4,1.4-5.3-0.3c-2.8-3.6-5.7-6.9-8.7-10c-25-25.9-54.3-34.1-61.1-30.5   c-6.9,3.6-16.8,32.3-9.8,67.6c0.8,4.1,1.9,8.4,3.2,12.7c0.6,2-0.7,4.1-2.8,4.5l-9.3,1.5c-2,0.3-3.3,2.4-2.6,4.4   c1.9,5.4,4.2,10.8,7,16.2C133,331.2,173.2,339,210,344.2c19-35.1,33.3-70.6,8.8-117.5c-2.8-5.4-5.9-10.3-9.3-14.9   C208.3,210,205.8,209.9,204.4,211.4z" />
              <path
                className="loading-plant-leaf"
                fill="#57A357"
                d="M401,139.1l-12.9-0.1c-2.9,0-5.1-2.6-4.7-5.5c0.9-6.2,1.4-12.2,1.7-18c1.9-49.4-17.6-86.1-27.7-89.5   c-10.1-3.4-47.9,13.9-76.3,54.4c-3.3,4.7-6.5,9.8-9.5,15.2c-1.4,2.5-4.7,3.3-7.1,1.5l-10.3-7.7c-2.3-1.7-5.5-1-6.8,1.6   c-3.6,7-6.8,14.4-9.4,22.3c-23.2,68.8,7.1,116,36.8,157.3c52.7-14.5,101.5-33.9,124.7-102.7c2.7-7.9,4.6-15.7,6-23.3   C405.9,141.6,403.8,139.1,401,139.1z" />
              <path
                className="loading-plant-accent"
                fill="#DBE8DB"
                fillOpacity={1}
                d="M127.8,225.6c-1.9-0.2-3.5-1.7-3.6-3.7c-0.5-8.8,0.2-15.7,0.9-19.9c0.3-2.2,2.4-3.6,4.5-3.3    c2.2,0.3,3.6,2.4,3.3,4.5c-0.6,3.9-1.3,10.2-0.8,18.2c0.1,2.2-1.5,4.1-3.7,4.2C128.2,225.6,128,225.6,127.8,225.6z" />
              <path
                className="loading-plant-accent"
                fill="#DBE5DB"
                fillOpacity={1}
                d="M301.8,86.4c-0.9-0.1-1.7-0.4-2.4-1c-2-1.5-2.3-4.4-0.8-6.4C311.2,63,324,53.3,330.5,49    c2.1-1.4,4.9-0.8,6.3,1.3c1.4,2.1,0.8,4.9-1.3,6.3c-6.1,4-18,13.1-29.9,28.2C304.7,85.9,303.2,86.5,301.8,86.4z" />
              <path
                fill="#9BE085"
                className="loading-plant-vein"
                d="M239.7,379l-13.1,59.9c0,7.5,0.1,15-0.6,22.7c-0.5,6.1,4.6,12.2,11.9,12.8c8.6,0.7,13.5-4.6,14.1-12.6    c0.2-2.1,8.8-121.9,50.4-272.6c0.6-2.3,2-4.3,3.8-5.8c5.5-4.4,15.2-10.7,28.7-13c23.3-4,38.1-19.8,38.7-20.4    c1.6-1.8,1.5-4.5-0.2-6.1c-1.8-1.6-4.5-1.5-6.1,0.2c-0.1,0.1-13.3,14.3-33.8,17.8c-8.4,1.4-15.5,4.2-21.3,7.3    c-1.8,0.9-3.8-0.7-3.2-2.6c7.9-26.5,16.8-52.2,26.8-76.2c0,0,1.9-4.5-2.5-6c-4.7-1.6-5.9,3.7-5.9,3.7    c-10.1,24.3-19.5,49.6-28.1,75.3c-0.6,1.9-3.2,2.1-4.1,0.3c-2.9-5.8-7.1-12.1-13.1-18.1c-1.8-1.8-4.6-1.7-6.3,0.2    c-1.5,1.7-1.3,4.4,0.3,6.1c9.8,9.9,14.1,21,15.9,27.7c0.6,2.1,0.5,4.3-0.1,6.4C291.8,185.8,255.6,297.8,239.7,379z" />
              <ellipse
                className="loading-plant-accent"
                transform="matrix(4.779642e-02 -0.9989 0.9989 4.779642e-02 120.0343 385.4608)"
                fill="#9BE085"
                fillOpacity={1}
                cx={262.2} cy={129.8} rx={4.3} ry={4.3} />
              <path
                className="loading-plant-vein"
                fill="#74B56F"
                d="M238.6,384.4c-14-30.7-31.3-69.2-47.1-98.2c-1.1-2.1-1.6-4.5-1.3-6.8c0.9-7,3.6-17.5,10.9-27.9   c1.3-1.9,1.1-4.6-0.7-6c-2-1.6-4.8-1.2-6.3,0.9c-4.8,6.8-7.9,13.6-9.8,19.7c-0.6,1.8-3.1,2.1-4.1,0.5   c-10.6-17.7-18.3-28.2-19.3-29.6c0,0-2.5-4.3-6.6-1.6c-3.5,2.3-0.9,6-0.9,6c0.2,0.4,7.4,11.2,17.1,30.3c0.9,1.8-0.8,3.8-2.7,3.2   c-6.2-1.9-13.5-3.3-21.9-3.2c-2,0-3.9,1.4-4.3,3.4c-0.6,2.8,1.6,5.3,4.3,5.3c12.7-0.2,23,3.7,29.3,6.9c2.3,1.2,4.2,3.1,5.2,5.5   c21,47.2,46.1,100.9,45.6,166C231.9,410.8,236,397.9,238.6,384.4z" />
              <ellipse
                className="loading-plant-accent"
                transform="matrix(7.841469e-02 -0.9969 0.9969 7.841469e-02 -120.2107 351.1246)"
                fill="#DBE8DB"
                fillOpacity={1}
                cx={129.8} cy={240.6} rx={4.5} ry={4.5} />
            </g>
          </g>
        </g>}
      <text
        className={"loading-plant-text" + (animate ? " animate" : "")}
        y={animate ? 435 : 150}
        x={150}
        fontSize={35}
        textAnchor="middle">
        {t("Loading...")}
      </text>
    </svg>
  </div>;
}
