import { View, Platform } from "react-native";
import { ThemeInput, ThemeText } from "@/custom-elements";
import Modal from "../organisms/modal";
import { BaseButton } from "../atoms/base-button";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getAllTax, createTax } from "@/services/restaurant";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import TaxMasterTable from "./tax-master-table";

const formSchema = z.object({
  taxType: z.string().nonempty("Tax type is required"),
  taxPercent: z.string().nonempty("Tax percentage is required"),
});

interface FormData {
  taxType: string;
  taxPercent: string;
}

interface RestaurantSettingModalProps {
  visible: boolean;
  onClose: () => void;
  theme: string;
  setIsTaxMasterVisible: (visible: boolean) => void;
}

const TaxMaster: React.FC<RestaurantSettingModalProps> = ({
  visible,
  onClose,
  theme,
  setIsTaxMasterVisible,
}) => {
  const [userId, setUserId] = useState<string>("");

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isValid },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      taxType: "",
      taxPercent: "",
    },
  });

  // Fetch user ID from AsyncStorage
  useEffect(() => {
    const fetchUserId = async () => {
      if (Platform.OS === "web") {
        const storedUserId = localStorage.getItem("userId");
        if (storedUserId) setUserId(storedUserId);
      } else {
        const storedUserId = await AsyncStorage.getItem("userId");
        if (storedUserId) setUserId(storedUserId);
      }
    };
    fetchUserId();
  }, []);

  const { data: getAllTaxes, refetch: refetchAllTax } = useQuery({
    queryKey: ["all-taxes", userId],
    queryFn: () => getAllTax(userId),
    enabled: !!userId, // Only fetch if userId is available
  });

  const { mutateAsync: createTaxMaster } = useMutation({
    mutationFn: createTax,
    onSuccess: () => {
      refetchAllTax();
      Toast.show({
        type: "success",
        text1: "Tax created successfully",
      });
      setValue("taxType", "");
      setValue("taxPercent", "");
    },
    onError: (error) => {
      console.error("Error creating tax:", error);
      Toast.show({
        type: "error",
        text1: "Error creating tax",
        text2: error.message,
      });
    },
  });

  const onSubmit = (values: FormData) => {
    const payload = {
      userId,
      type: values.taxType,
      percentage: Number(values.taxPercent),
    };
    createTaxMaster(payload);
  };

  return (
    <Modal
      isOpen={visible}
      onClose={() => {
        setValue("taxType", "");
        setValue("taxPercent", "");
        onClose();
      }}
      theme={theme}
      style="md:w-[60%] w-[90%]"
      title="Tax Master"
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
                Tax Type
              </ThemeText>
              <Controller
                control={control}
                name="taxType"
                render={({ field: { onChange, onBlur, value } }) => (
                  <ThemeInput
                    onBlur={onBlur}
                    onChangeText={(text) => {
                      onChange(text);
                    }}
                    value={value}
                    className="md:pr-10 relative rounded-md border font-regular pl-2.5 py-2 outline-none focus:border-primary"
                    placeholderTextColor="gray"
                    placeholder="Enter tax type"
                  />
                )}
              />
            </View>
            <View className="md:w-1/2 w-full md:pl-2 mt-4 md:mt-0">
              <ThemeText className="text-sm font-medium mb-1">
                Tax Percentage
              </ThemeText>
              <Controller
                control={control}
                name="taxPercent"
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
                    placeholder="Enter tax percentage"
                  />
                )}
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

        <View
          className={`rounded-lg ${
            Platform.OS === "web" ? "mt-4 border" : ""
          } ${theme === "dark" ? "border-border-dark" : "border-border"}`}
        >
          <View className="p-3">
            <ThemeText className="text-md font-medium mb-3 capitalize text-center">
              TAX MASTER DETAIL
            </ThemeText>
            <TaxMasterTable theme={theme} getAllTax={getAllTaxes} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default TaxMaster;
