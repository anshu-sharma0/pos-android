import { View, TouchableOpacity, Platform } from "react-native";
import { ThemeInput, ThemeText } from "@/custom-elements";
import Modal from "./modal";
import { BaseButton } from "../atoms/base-button";
import Eye from "@/assets/icons/eye";
import EyeOff from "@/assets/icons/eye-off";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
import { restaurantAuthenticate } from "@/services/restaurant";
import AsyncStorage from "@react-native-async-storage/async-storage";

const formSchema = z.object({
  password: z.string(),
});

interface IDiscountModalProps {
  openDiscountModal: boolean;
  setOpenDiscountModal: (e: boolean) => void;
  setIsAuthenticate: (e: boolean) => void;
  theme: string;
}

const DiscountModal: React.FC<IDiscountModalProps> = ({
  openDiscountModal,
  setOpenDiscountModal,
  setIsAuthenticate,
  theme,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<boolean>(false);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
    },
  });

  const mutation = useMutation({
    mutationFn: restaurantAuthenticate,
    onSuccess: ({ data }) => {
      setIsAuthenticate(data?.isAuthenticate);
      if (!data.isAuthenticate) {
        setError(true);
      }
    },
    onError: (error: any) => {
      setOpenDiscountModal(false);
      console.log(error, "error");
    },
  });

  const onSubmit = async () => {
    if (password) {
      if (Platform.OS === "web") {
        const userId: string = localStorage.getItem("userId") as string;
        mutation.mutate({
          discountPassword: password,
          userId: userId,
        });
        if (error) {
          setOpenDiscountModal(false);
        }
      } else {
        const userId = (await AsyncStorage.getItem("userId")) as string;
        mutation.mutate({
          discountPassword: password,
          userId: userId,
        });
        if (error) {
          setOpenDiscountModal(false);
        }
      }
    }
  };

  return (
    <Modal
      isOpen={openDiscountModal}
      onClose={() => {
        setValue("password", "");
        setPassword("");
        setError(false);
        setOpenDiscountModal(false);
      }}
      theme={theme}
      style="max-h-[90vh] w-[80vw] md:w-[50vw] xl:w-[30vw] 2xl:w-[25vw]"
      title="Discount Password"
    >
      <View className="mb-2">
        <View
          className={`rounded-md ${Platform.OS === "web" ? "p-5 border" : ""} ${
            theme === "dark" ? "border-border-dark" : "border-border"
          }`}
        >
          <ThemeText className="text-sm font-medium mb-1">
            Discount Password:
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
                    setPassword(text);
                    setError(false);
                  }}
                  value={value}
                  secureTextEntry={!showPassword}
                  className={`pr-10 relative rounded-md border font-regular pl-2.5 py-2 outline-none focus:border-primary`}
                  placeholderTextColor="gray"
                  placeholder="Enter your discount password"
                  autoComplete="off"
                />
              )}
              name="password"
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
          {error && (
            <ThemeText
              className={`text-sm text-left block !text-text-error mt-1`}
            >
              Please enter the correct Password
            </ThemeText>
          )}
        </View>
        <BaseButton
          title="Submit"
          theme={theme}
          onPress={handleSubmit(onSubmit)}
          style="w-fit ml-auto px-12 mt-8"
        />
      </View>
    </Modal>
  );
};

export default DiscountModal;
