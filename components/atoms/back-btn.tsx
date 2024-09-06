import { Text, TouchableOpacity } from "react-native";
import BackIcon from "@/assets/icons/back";

interface IBackBtnProps {
  onPress: () => void;
  style?: string;
}

export default function BackBtn({ onPress, style }: IBackBtnProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`${style} absolute flex-row items-center left-0 md:left-2 top-3 md:top-8`}
    >
      <BackIcon />
      <Text className="text-xl hidden md:block 2xl:block font-medium text-primary ml-2">
        Back
      </Text>
    </TouchableOpacity>
  );
}
