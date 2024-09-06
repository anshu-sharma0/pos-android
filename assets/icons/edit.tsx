import * as React from "react";
import Svg, { SvgProps, Path } from "react-native-svg";

const EditIcon = (props: SvgProps) => (
  <Svg
    fill={props.fill}
    stroke={props.fill}
    strokeWidth={0}
    className="mx-2 text-md block py-0 text-primary cursor-pointer"
    viewBox="0 0 24 24"
    {...props}
  >
    <Path
      stroke="none"
      d="M19.045 7.401c.378-.378.586-.88.586-1.414s-.208-1.036-.586-1.414l-1.586-1.586c-.378-.378-.88-.586-1.414-.586s-1.036.208-1.413.585L4 13.585V18h4.413L19.045 7.401zm-3-3 1.587 1.585-1.59 1.584-1.586-1.585 1.589-1.584zM6 16v-1.585l7.04-7.018 1.586 1.586L7.587 16H6zm-2 4h16v2H4z"
    />
  </Svg>
);
export default EditIcon;
