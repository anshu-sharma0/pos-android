import { View, Platform } from "react-native";
import { ThemeInput, ThemeText } from "@/custom-elements";
import Modal from "../organisms/modal";
import { BaseButton } from "../atoms/base-button";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { fetchTables, createMultiTables } from "@/services/table"; // Adjust import path if necessary
import Toast from "react-native-toast-message";
import TagsDropDown from "./tagsDropDown";
import { LogBox } from "react-native";

const formSchema = z.object({
  taxType: z.string().nonempty("Table number is required"),
});

interface FormData {
  taxType: string;
}

interface RestaurantSettingModalProps {
  visible: boolean;
  onClose: () => void;
  theme: string;
  setIsTableMasterVisible: (visible: boolean) => void;
}

const TableMaster: React.FC<RestaurantSettingModalProps> = ({
  visible,
  onClose,
  theme,
  setIsTableMasterVisible,
}) => {
  const [tableCode, setTableCode] = useState({
    tableData: [],
    hideTableData: [],
    unhideTableData: [],
  });
  const [hideFilteredData, setHideFilteredData] = useState([]);
  const [unhideFilteredData, setUnhideFilteredData] = useState([]);

  const { data: unsettleBillData, refetch: refetchTables } = useQuery({
    queryKey: ["tables"],
    queryFn: fetchTables,
    retry: 0,
  });

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      taxType: "",
    },
  });

  LogBox.ignoreLogs(["Warning: ..."]); // Ignore log notification by message
  LogBox.ignoreAllLogs();

  const mutation = useMutation({
    mutationFn: createMultiTables, // API call to create or update tables
    onSuccess: () => {
      setIsTableMasterVisible(false);
      Toast.show({
        type: "success",
        text1: "Table Created/Updated Successfully",
      });
      refetchTables();
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || "An error occurred";
      Toast.show({
        type: "error",
        text1: errorMessage,
      });
    },
  });

  const handleSave = () => {
    const payload = {
      toCreate: tableCode.tableData,
      toHide: tableCode.hideTableData,
      toUnhide: tableCode.unhideTableData,
    };

    if (
      tableCode.tableData.length === 0 &&
      tableCode.hideTableData.length === 0 &&
      tableCode.unhideTableData.length === 0
    ) {
      Toast.show({
        type: "error",
        text1: "Please fill in the details",
      });
    } else {
      mutation.mutate(payload);
      setTableCode({
        tableData: [],
        hideTableData: [],
        unhideTableData: [],
      });
    }
  };

  useEffect(() => {
    const filteredHideData = unsettleBillData?.data?.filter((item: any) => {
      return (
        item.isDeleted === false && !tableCode.hideTableData.includes(item.code)
      );
    });

    const filteredUnhideData = unsettleBillData?.data?.filter((item: any) => {
      return (
        item.isDeleted === true &&
        !tableCode.unhideTableData.includes(item.code)
      );
    });

    setHideFilteredData(filteredHideData);
    setUnhideFilteredData(filteredUnhideData);
  }, [unsettleBillData, tableCode.hideTableData, tableCode.unhideTableData]);

  return (
    <Modal
      isOpen={visible}
      onClose={() => {
        setValue("taxType", "");
        setTableCode({
          tableData: [],
          hideTableData: [],
          unhideTableData: [],
        });
        onClose();
      }}
      theme={theme}
      style="md:w-[60%] w-[90%]"
      title="Table Master"
    >
      <View className="mb-2 w-full">
        <View
          className={`rounded-md ${Platform.OS === "web" ? "p-5 border" : ""} ${
            theme === "dark" ? "border-border-dark" : "border-border"
          }`}
        >
          <View className="w-full mb-4">
            <ThemeText className="text-sm font-medium mb-1">
              Add Table Number
            </ThemeText>
            <Controller
              control={control}
              render={({ field: { onChange, value } }) => (
                <ThemeInput
                  onChangeText={(text) => {
                    if (/^\d*$/.test(text)) {
                      onChange(text);
                    }
                  }}
                  value={value}
                  className="mb-2 relative rounded-md border font-regular pl-2.5 py-2 outline-none focus:border-primary"
                  placeholder="Enter table number"
                  placeholderTextColor={"gray"}
                />
              )}
              name="taxType"
            />
          </View>

          <View className="w-full mb-4">
            <ThemeText className="text-sm font-medium mb-1">
              Hide Table
            </ThemeText>
            <TagsDropDown
              setTableData={setTableCode}
              tableData={tableCode?.hideTableData}
              title={"hideTableData"}
              data={hideFilteredData}
              theme={theme}
            />
          </View>

          <View className="w-full mb-4">
            <ThemeText className="text-sm font-medium mb-1">
              Unhide Table
            </ThemeText>
            <TagsDropDown
              setTableData={setTableCode}
              tableData={tableCode?.unhideTableData}
              title={"unhideTableData"}
              data={unhideFilteredData}
              theme={theme}
            />
          </View>
        </View>

        <BaseButton
          title="Save"
          theme={theme}
          onPress={handleSave}
          style="w-fit ml-auto px-[2.5rem] py-2 mt-8"
        />
      </View>
    </Modal>
  );
};

export default TableMaster;
