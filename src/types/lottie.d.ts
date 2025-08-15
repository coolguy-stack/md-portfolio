// Tell TS/JSX about the <dotlottie-player> element
import type * as React from "react";

type DotLottieAttrs =
  React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
    src?: string;
    autoplay?: boolean;
    loop?: boolean;
    background?: string;
    speed?: number;
    controls?: boolean;
  };

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "dotlottie-player": DotLottieAttrs;
    }
  }
}
