import { View, Platform } from "react-native";
import { ThemeInput, ThemeText } from "@/custom-elements";
import Modal from "../organisms/modal";
import { BaseButton } from "../atoms/base-button";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { fetchRestaurant, updateRestaurant } from "@/services/restaurant";
import { Restaurant } from "@/types";
import Toast from "react-native-toast-message";
import { hostFormDefaultValues, hostFormSchema } from "./constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

const formSchema = z.object({
  firmName: z.string().nonempty("Firm name is required"),
  outletName: z.string().nonempty("Outlet name is required"),
  address: z.string().nonempty("Address is required"),
  phone: z.string().nonempty("Mobile number is required"),
  taxId: z.string().nonempty("GST TIN number is required"),
});

interface FormData {
  firmName: string;
  outletName: string;
  address: string;
  phone: string;
  taxId: string;
}

interface RestaurantSettingModalProps {
  visible: boolean;
  onClose: () => void;
  theme: string;
  setIsRestaurantModalVisible: (visible: boolean) => void;
}

const RestaurantSettingModal: React.FC<RestaurantSettingModalProps> = ({
  visible,
  onClose,
  theme,
  setIsRestaurantModalVisible,
}) => {
  const [restaurantSetting, setRestaurantSetting] = useState<FormData>({
    firmName: "",
    outletName: "",
    address: "",
    phone: "",
    taxId: "",
  });
  const [userId, setUserId] = useState("");

  useEffect(() => {
    const fetchUserId = async () => {
      const userIdLocalStorage =
        Platform.OS === "web"
          ? localStorage.getItem("userId")
          : await AsyncStorage.getItem("userId");

      if (userIdLocalStorage !== null) {
        setUserId(userIdLocalStorage);
      }
    };

    fetchUserId();
  }, []);

  const { data: Restaurant, refetch: handleRefreshRestaurant } = useQuery({
    queryKey: ["fetch-kots-for-table", userId],
    queryFn: () => fetchRestaurant(userId),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firmName: "",
      outletName: "",
      address: "",
      phone: "",
      taxId: "",
    },
  });

  console.log({ Restaurant });

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isValid },
  } = form;

  const { mutateAsync: restaurantUpdate } = useMutation({
    // mutationKey: ["update-restaurant"],
    mutationFn: updateRestaurant,
    onSuccess: ({ data }) => {
      setIsRestaurantModalVisible(false);
      handleRefreshRestaurant();
      console.log({ data });
      Toast.show({
        type: "success",
        text1: "Restaurant Updated Successfully",
        visibilityTime: 3000,
      });
    },
    onError: (error) => {
      console.error("Error occurred:", error);
    },
  });

  const onSubmit = async (formData: FormData) => {
    const payloadData = {
      address: formData.address,
      firmName: formData.firmName,
      outletName: formData.outletName,
      phone: formData.phone,
      taxId: formData.taxId,
    };
    const userId =
      Platform.OS === "web"
        ? localStorage.getItem("userId")
        : await AsyncStorage.getItem("userId");

    const payload: Restaurant = { ...payloadData, userId };
    restaurantUpdate(payload);
  };

  useEffect(() => {
    if (visible && Restaurant) {
      form.reset({
        firmName: Restaurant.restaurant.firmName || "",
        outletName: Restaurant.restaurant.outletName || "",
        address: Restaurant.restaurant.address || "",
        phone: Restaurant.restaurant.phone || "",
        taxId: Restaurant.restaurant.taxId || "",
      });
    }
  }, [visible, Restaurant, form]);

  return (
    <Modal
      isOpen={visible}
      onClose={() => {
        setValue("firmName", "");
        setRestaurantSetting({
          firmName: "",
          outletName: "",
          address: "",
          phone: "",
          taxId: "",
        });
        onClose();
      }}
      theme={theme}
      style="w-[80%]"
      title="Restaurant Setting"
    >
      <View className="mb-2 w-full">
        <View
          className={`rounded-md ${Platform.OS === "web" ? "p-5 border" : ""} ${
            theme === "dark" ? "border-border-dark" : "border-border"
          }`}
        >
          <View className="w-full mr-2 flex md:flex-row flex-col flex-wrap items-center justify-between mobileMax:flex-wrap">
            <View className="md:w-1/2 w-full md:pr-2">
              <ThemeText className="text-sm font-medium mb-1">
                Firm Name
              </ThemeText>
              <Controller
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <ThemeInput
                    onBlur={onBlur}
                    onChangeText={(text) => {
                      onChange(text);
                    }}
                    value={value}
                    className="md:pr-10 relative rounded-md border font-regular pl-2.5 py-2 outline-none focus:border-primary"
                    placeholderTextColor="gray"
                    placeholder="Enter firm name"
                  />
                )}
                name="firmName"
              />
            </View>
            <View className="md:w-1/2 w-full md:pl-2 mt-4 md:mt-0">
              <ThemeText className="text-sm font-medium mb-1">
                Outlet Name
              </ThemeText>
              <Controller
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <ThemeInput
                    onBlur={onBlur}
                    onChangeText={(text) => {
                      onChange(text);
                    }}
                    value={value}
                    className="pr-10 relative rounded-md border font-regular pl-2.5 py-2 outline-none focus:border-primary"
                    placeholderTextColor="gray"
                    placeholder="Enter outlet name"
                  />
                )}
                name="outletName"
              />
            </View>
          </View>

          <View className="mt-4">
            <ThemeText className="text-sm font-medium mb-1">Address</ThemeText>
            <Controller
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <ThemeInput
                  onBlur={onBlur}
                  onChangeText={(text) => {
                    onChange(text);
                  }}
                  value={value}
                  className="pr-10 relative rounded-md border font-regular pl-2.5 py-2 outline-none focus:border-primary"
                  placeholderTextColor="gray"
                  placeholder="Enter address"
                />
              )}
              name="address"
            />
          </View>

          <View className="w-full mt-4 mr-2 flex md:flex-row flex-col flex-wrap items-center justify-between mobileMax:flex-wrap">
            <View className="md:w-1/2 w-full md:pr-2">
              <ThemeText className="text-sm font-medium mb-1">
                Mobile Number
              </ThemeText>
              <Controller
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <ThemeInput
                    onBlur={onBlur}
                    onChangeText={(text) => {
                      if (/^\d*$/.test(text)) {
                        onChange(text);
                      }
                    }}
                    value={value}
                    className="pr-10 relative rounded-md border font-regular pl-2.5 py-2 outline-none focus:border-primary"
                    placeholderTextColor="gray"
                    placeholder="Enter mobile number"
                  />
                )}
                name="phone"
              />
            </View>
            <View className="md:w-1/2 w-full md:pl-2 mt-4 md:mt-0">
              <ThemeText className="text-sm font-medium mb-1">
                GST TIN Number
              </ThemeText>
              <Controller
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <ThemeInput
                    onBlur={onBlur}
                    onChangeText={(text) => {
                      onChange(text);
                    }}
                    value={value}
                    className="pr-10 relative rounded-md border font-regular pl-2.5 py-2 outline-none focus:border-primary"
                    placeholderTextColor="gray"
                    placeholder="Enter GST TIN number"
                  />
                )}
                name="taxId"
              />
            </View>
          </View>

          <BaseButton
            title="Save"
            theme={theme}
            onPress={handleSubmit(onSubmit)}
            disabled={!isValid}
            style="w-fit ml-auto px-[2.5rem] py-2 mt-8"
          />
        </View>
      </View>
    </Modal>
  );
};

export default RestaurantSettingModal;
