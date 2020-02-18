import * as React from "react";
import { ExternalUrl } from "../external_urls";

export const LaptopSplash = ({ className }: { className: string }) =>
  <div className={className}>
    <div className="perspective-container">
      <div className="laptop">
        <div className="laptop-screen">
          <video muted autoPlay loop>
            <source src={ExternalUrl.Video.desktop} type="video/mp4" />
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
