import {
  View,
  TouchableOpacity,
  Platform,
  TouchableWithoutFeedback,
  Button,
} from "react-native";
import { ThemeInput, ThemeText } from "@/custom-elements";
import Modal from "../organisms/modal";
import { BaseButton } from "../atoms/base-button";
import Eye from "@/assets/icons/eye";
import EyeOff from "@/assets/icons/eye-off";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
import { updateDiscountPassword } from "@/services/restaurant";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { updatePasswordPayloadType } from "@/types";
import Toast from "react-native-toast-message";

const formSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string(),
  confirmPassword: z.string(),
});

interface formData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface MasterDiscountModalProps {
  visible: boolean;
  onClose: () => void;
  theme: string;
  setIsDiscountModalVisible: (e: boolean) => void;
}

const MasterDiscountModal: React.FC<MasterDiscountModalProps> = ({
  visible,
  onClose,
  theme,
  setIsDiscountModalVisible,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<boolean>(false);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const { mutateAsync: restaurantUpdate } = useMutation(
    {
      mutationKey: ["update-discount-password"],
      mutationFn: updateDiscountPassword,
      onSuccess: ({ data }) => {
        if (data != "password doesn't match") {
        setIsDiscountModalVisible(false);
        Toast.show({
          type: "success",
          text1: "Password changed",
        });
        return data;
      } else {
        Toast.show({
          type: "error",
          text1: "Current password does'nt match",
          
        });
      }
    },
    }
    // onError: (error) => {
    //   console.log("Error_Occurred:", error);
    // },
  );

  const arePasswordsEqual = () => {
    return confirmPassword === newPassword;
  };

  const onSubmit = async (data: formData) => {
    console.log({ data });
    const payloadData = {
      currentPassword: currentPassword,
      newPassword: newPassword,
    };
    const userId =
      Platform.OS === "web"
        ? localStorage.getItem("userId")
        : await AsyncStorage.getItem("userId");

    const payload: updatePasswordPayloadType = { ...payloadData, userId };
    restaurantUpdate(payload);
  };

  // const emptyOrNot = Object.values(currentPassword && newPassword && confirmPassword).some(
  //   (value) => value === ""
  // );
  const emptyOrNot = !currentPassword || !newPassword || !confirmPassword;

  return (
    <Modal
      isOpen={visible}
      onClose={() => {
        setValue("currentPassword", "");
        setValue("newPassword", "");
        setValue("confirmPassword", "");
        setShowPassword(false)
        setShowNewPassword(false)
        setShowConfirmPassword(false)
        setError(false);
        onClose();
      }}
      theme={theme}
      style="md:w-[50%] w-[85%]"
      title="Discount Confirm Password"
    >
      <View className="mb-2">
        <View
          className={`rounded-md ${Platform.OS === "web" ? "p-5 border" : ""} ${
            theme === "dark" ? "border-border-dark" : "border-border"
          }`}
        >
          <ThemeText className="text-sm font-medium mb-1">
            Current Password
          </ThemeText>
          <View className="relative justify-center md:justify-start">
            <Controller
              control={control}
              rules={{
                required: true,
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <ThemeInput
                  onBlur={onBlur}
                  onChangeText={(text) => {
                    onChange(text);
                    setCurrentPassword(text);
                    setError(false);
                  }}
                  
                  value={value}
                  secureTextEntry={!showPassword}
                  className="pr-10 relative rounded-md border font-regular pl-2.5 py-2 outline-none focus:border-primary"
                  placeholderTextColor="gray"
                  placeholder="Enter current password"
                  autoComplete="off"
                />
              )}
              name="currentPassword"
            />

            <TouchableOpacity
              className={`absolute p-2.5 ${
                Platform.OS === "web" ? " right-5" : " right-1"
              }`}
              onPress={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <Eye width={20} height={20} fill="#EB9E4C" />
              ) : (
                <EyeOff width={20} height={20} fill="#EB9E4C" />
              )}
            </TouchableOpacity>
          </View>

          <View className="mt-5">
            <ThemeText className="text-sm font-medium mb-1">
              Enter New Password
            </ThemeText>
            <View className="relative justify-center md:justify-start">
              <Controller
                control={control}
                rules={{
                  required: true,
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <ThemeInput
                    onBlur={onBlur}
                    onChangeText={(text) => {
                      onChange(text);
                      setNewPassword(text);
                      setError(false);
                    }}
                    value={value}
                    secureTextEntry={!showNewPassword}
                    className="pr-10 relative rounded-md border font-regular pl-2.5 py-2 outline-none focus:border-primary"
                    placeholderTextColor="gray"
                    placeholder="Enter your new password"
                    autoComplete="off"
                  />
                )}
                name="newPassword"
              />

              <TouchableOpacity
                className={`absolute p-2.5 ${
                  Platform.OS === "web" ? " right-5" : " right-1"
                }`}
                onPress={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? (
                  <Eye width={20} height={20} fill="#EB9E4C" />
                ) : (
                  <EyeOff width={20} height={20} fill="#EB9E4C" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <View className="mt-5">
            <ThemeText className="text-sm font-medium mb-1">
              Confirm New Password
            </ThemeText>
            <View className="relative justify-center md:justify-start">
              <Controller
                control={control}
                rules={{
                  required: true,
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <ThemeInput
                    onBlur={onBlur}
                    onChangeText={(text) => {
                      onChange(text);
                      setConfirmPassword(text);
                      setError(false);
                    }}
                    value={value}
                    secureTextEntry={!showConfirmPassword}
                    className="pr-10 relative rounded-md border font-regular pl-2.5 py-2 outline-none focus:border-primary"
                    placeholderTextColor="gray"
                    placeholder="Confirm password"
                    autoComplete="off"
                  />
                )}
                name="confirmPassword"
              />

              <TouchableOpacity
                className={`absolute p-2.5 ${
                  Platform.OS === "web" ? " right-5" : " right-1"
                }`}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <Eye width={20} height={20} fill="#EB9E4C" />
                ) : (
                  <EyeOff width={20} height={20} fill="#EB9E4C" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <BaseButton
          title="Save"
          theme={theme}
          onPress={handleSubmit(onSubmit)}
          style={`w-fit ml-auto px-[3.5rem] py-2 mt-8 ${
            !arePasswordsEqual() || emptyOrNot ? "pointer-events-none" : ""
          }`}
          disabled={!arePasswordsEqual() || emptyOrNot}
        />
      </View>
    </Modal>
  );
};

export default MasterDiscountModal;
