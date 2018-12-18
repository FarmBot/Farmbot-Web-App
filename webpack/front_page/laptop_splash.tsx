import * as React from "react";
const VIDEO_URL = "https://cdn.shopify.com/s/files/1/2040/0289/files/" +
  "Farm_Designer_Loop.mp4?9552037556691879018";

export const LaptopSplash = ({ className }: { className: string }) =>
  <div className={className}>
    <div className="perspective-container">
      <div className="laptop">
        <div className="laptop-screen">
          <video muted autoPlay loop>
            <source src={VIDEO_URL} type="video/mp4" />
          </video>
          <span className="laptop-shine" />
        </div>
        <div className="laptop-keyboard">
          <div className="laptop-keys">
          </div>
          <div className="laptop-trackpad">
          </div>
        </div>
      </div>
    </div>
  </div>;
