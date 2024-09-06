import * as React from "react";
import Svg, { SvgProps, Path } from "react-native-svg";

const MessageIcon = (props: SvgProps) => (
  <Svg
    fill={props.stroke || "currentColor"}
    stroke={props.stroke || "currentColor"}
    strokeWidth={0}
    className="mx-auto text-md block py-0 mt-0.5 cursor-pointer"
    viewBox="0 0 24 24"
    {...props}
  >
    <Path
      stroke="none"
      d="M20 2H4c-1.103 0-2 .894-2 1.992v12.016C2 17.106 2.897 18 4 18h3v4l6.351-4H20c1.103 0 2-.894 2-1.992V3.992A1.998 1.998 0 0 0 20 2zm-6 11H7v-2h7v2zm3-4H7V7h10v2z"
    />
  </Svg>
);
export default MessageIcon;
