import { ThemeText } from "@/custom-elements";
import { ReactNode } from "react";
import { Platform, Text, TouchableOpacity } from "react-native";

interface ButtonProps {
  title: string | ReactNode;
  onPress: () => void;
  disabled?: boolean;
  theme?: string;
  style?: string;
  varient?: string;
}

export function BaseButton({
  title,
  onPress,
  disabled,
  theme,
  style,
  varient,
}: ButtonProps) {
  return (
    <>
      {varient === "cancel" ? (
        <TouchableOpacity
          className={`${style} rounded-lg border-2 border-primary px-4 py-1.5 text-center font-medium text-sm hover:text-primary ${
            theme === "dark"
              ? "bg-background-hover text-text"
              : "bg-background text-text-dark"
          } ${disabled ? "opacity-60" : "opacity-100"}`}
          onPress={onPress}
          disabled={disabled}
        >
          {Platform.OS === "web" ? (
            <span>{title}</span>
          ) : (
            <ThemeText className="text-center font-semibold">{title}</ThemeText>
          )}
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          className={`${style} rounded-lg border-2 border-primary bg-primary px-4 py-1.5 text-center font-medium text-sm text-text-dark  ${
           !disabled && theme === "dark"
              ? "hover:bg-background-hover hover:text-primary"
              : ""
          } ${ !disabled && theme === "light"
            ? "hover:bg-background hover:text-primary"
            : ""} 
          ${disabled ? "opacity-60" : "opacity-100"}`}
          onPress={onPress}
          disabled={disabled}
        >
          {Platform.OS === "web" ? (
            <span>{title}</span>
          ) : (
            <Text className="text-center text-text-dark font-semibold">
              {title}
            </Text>
          )}
        </TouchableOpacity>
      )}
    </>
  );
}
