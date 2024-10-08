import * as React from "react";
import Svg, { SvgProps, Path } from "react-native-svg";

const DeleteIcon = (props: SvgProps) => (
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
      d="M4 8h16v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V8Zm3-3V3a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v2h5v2H2V5h5Zm2-1v1h6V4H9Zm0 8v6h2v-6H9Zm4 0v6h2v-6h-2Z"
    />
  </Svg>
);
export default DeleteIcon;
