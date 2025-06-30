import { Dimensions } from "react-native";
const { height } = Dimensions.get("window");
import { moderateScale, verticalScale } from "react-native-size-matters";

const designHeight = 926;

export const designHeightToPx = (px) => {
  const size = (px * height) / designHeight;
  return Math.min(size, verticalScale(px, 0.1));
};
