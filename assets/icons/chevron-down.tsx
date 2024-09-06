import * as React from "react";
import Svg, { SvgProps, Path } from "react-native-svg";

const CheveronDownIcon = (props: SvgProps) => (
  <Svg
    fill="currentColor"
    stroke="currentColor"
    strokeWidth={0}
    aria-hidden="true"
    className="h-4 w-4 opacity-50"
    viewBox="0 0 256 256"
    {...props}
  >
    <Path
      stroke="none"
      d="m216.49 104.49-80 80a12 12 0 0 1-17 0l-80-80a12 12 0 0 1 17-17L128 159l71.51-71.52a12 12 0 0 1 17 17Z"
    />
  </Svg>
);
export default CheveronDownIcon;
