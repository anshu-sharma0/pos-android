import { ThemeText } from "@/custom-elements";
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

interface ITabCardProps {
  onPress: () => void;
  name: string;
  theme: string;
  styleText?: string;
}

export default function CategoryCard({
  onPress,
  name,
  theme,
  styleText,
}: ITabCardProps) {
  return (
    <TouchableOpacity
      className={`m-2 flex h-fit min-h-[100px] min-w-[140px] shadow cursor-pointer items-center hover:bg-[#E8CBB0] hover:border-primary justify-center rounded-lg border p-3 lg:w-[190px] 2xl:w-[215px] ${
        theme === "dark" ? "border-border-dark" : "border-border"
      } group`} 
      onPress={onPress}
    >
      <ThemeText
        className={`${styleText} flex w-[130px] items-center justify-center break-words overflow-y-hidden text-center font-medium uppercase lg:w-[180px] 2xl:w-[200px] text-sm lg:text-xl group-hover:text-black`}
      >
        {name}
      </ThemeText>
    </TouchableOpacity>
  );
}
