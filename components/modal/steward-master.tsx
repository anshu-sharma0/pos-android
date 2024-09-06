import { View, Platform } from "react-native";
import { ThemeInput, ThemeText } from "@/custom-elements";
import Modal from "../organisms/modal";
import { BaseButton } from "../atoms/base-button";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import Toast from "react-native-toast-message";
import { updateUser, getSteward, createUser } from "@/services/user";
import StewardMasterTable from "./steward-master-table";

const formSchema = z.object({
  stewardName: z.string(),
  stewardNo: z.string(),
});

interface FormData {
  stewardName: string;
  stewardNo: string;
}

interface RestaurantSettingModalProps {
  visible: boolean;
  onClose: () => void;
  theme: string;
  setIsStewardMasterVisible: (visible: boolean) => void;
}

const StewardMaster: React.FC<RestaurantSettingModalProps> = ({
  visible,
  onClose,
  theme,
  setIsStewardMasterVisible,
}) => {
  const [error, setError] = useState<boolean>(false);
  const [itemId, setItemId] = useState("");
  const [isUpdate, setIsUpdate] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      stewardName: "",
      stewardNo: "",
    },
  });

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isValid },
  } = form;

  const { mutateAsync: createSteward } = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      Toast.show({
        type: "success",
        text1: "Steward created successfully",
      });
      form.reset(); // Reset the form on success
      refetchStewardData();
    },
    onError: (error) => {
      console.error("Error creating steward:", error);
      Toast.show({
        type: "error",
        text1: "Failed to create steward",
      });
    },
  });

  const { mutateAsync: updateSteward } = useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      Toast.show({
        type: "success",
        text1: "Steward updated successfully",
      });
      form.reset(); // Reset the form on success
      refetchStewardData();
      setIsUpdate(false); // Reset the update state
    },
    onError: (error) => {
      console.error("Error updating steward:", error);
      Toast.show({
        type: "error",
        text1: "Failed to update steward",
      });
    },
  });

  const {
    data: stewardData,
    isFetching,
    refetch: refetchStewardData,
  } = useQuery({
    queryKey: ["unBill"],
    queryFn: getSteward,
    retry: 0,
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const payload = {
      stewardNo: values.stewardNo,
      name: values.stewardName,
      role: "steward",
    };

    if (isUpdate) {
      if (itemId) {
        // Ensure the ID is valid before attempting to update
        updateSteward({ ...payload, id: itemId });
      } else {
        Toast.show({
          type: "error",
          text1: "Invalid operation",
          text2: "No valid ID provided for update",
        });
      }
    } else {
      createSteward(payload as any);
    }
  };

  return (
    <Modal
      isOpen={visible}
      onClose={() => {
        setError(false);
        setIsUpdate(false);
        onClose();
        form.reset();
      }}
      theme={theme}
      style="md:w-[60%] w-[90%]"
      title="Steward Master"
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
                Steward Name
              </ThemeText>
              <Controller
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <ThemeInput
                  onChangeText={(text) => {
                    onChange(text);
                  }}
                  value={value}
                    className="md:pr-10 relative rounded-md border font-regular pl-2.5 py-2 outline-none focus:border-primary"
                    placeholderTextColor="gray"
                    placeholder="Enter steward name"
                  />
                )}
                name="stewardName"
              />
            </View>
            <View className="md:w-1/2 w-full md:pl-2 mt-4 md:mt-0">
              <ThemeText className="text-sm font-medium mb-1">
                Steward Number
              </ThemeText>
              <Controller
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <ThemeInput
                    onChangeText={(text) => {
                      if (/^\d*$/.test(text)) {
                        onChange(text);
                      }
                    }}
                    value={value}
                    className="pr-10 relative rounded-md border font-regular pl-2.5 py-2 outline-none focus:border-primary"
                    placeholderTextColor="gray"
                    placeholder="Enter steward number"
                  />
                )}
                name="stewardNo"
              />
            </View>
          </View>

          <BaseButton
            title={!isUpdate ? `Save` : `Edit`}
            theme={theme}
            onPress={handleSubmit(onSubmit)}
            disabled={
              !(
                form.watch("stewardNo") &&
                form.watch("stewardName")
              )
            }
            style="w-fit ml-auto px-[2.5rem] py-2 mt-8"
          />
        </View>

        <View
          className={`rounded-lg ${
            Platform.OS === "web" ? "mt-4 border" : ""
          } ${theme === "dark" ? "border-border-dark" : "border-border"}`}
        >
          <View className="p-2">
            <StewardMasterTable
              setItemId={setItemId}
              setIsUpdate={setIsUpdate}
              form={form}
              theme={theme}
              refetchStewardData={refetchStewardData}
              stewardData={stewardData}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default StewardMaster;
