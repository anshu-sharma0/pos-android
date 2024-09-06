import { View, Text, TouchableOpacity, ScrollView, Button } from "react-native";
import { ThemeText } from "@/custom-elements"; // Assuming this is the correct import
import { useMutation, useQuery } from "@tanstack/react-query";
import { TaxTypeProps } from "@/types";
import { getAllTax } from "@/services/restaurant";
import { Pencil, Trash2 } from "lucide-react";
import EditIcon from "@/assets/icons/edit";
import DeleteIcon from "@/assets/icons/delete";
import { deleteUser } from "@/services/user";
import { BaseButton } from "../atoms/base-button";
import { useState } from "react";
import ConfirmationModal from "./confirmationModal";
import Toast from "react-native-toast-message";

type TaxMasterTableProps = {
  theme: string;
  stewardData: any;
  form: any;
  setIsUpdate: (e: boolean) => void;
  setItemId: (e: string) => void;
  refetchStewardData: any;
};

const StewardMasterTable = (props: TaxMasterTableProps) => {
  const {
    theme,
    stewardData,
    form,
    setIsUpdate,
    setItemId,
    refetchStewardData,
  } = props;
  const [selectedStewardId, setSelectedStewardId] = useState<string>("");
  const [showConfirmationModal, setShowConfirmationModal] =
    useState<boolean>(false);
  const mutation = useMutation({
    mutationKey: ["delete"],
    mutationFn: deleteUser,
    onSuccess: ({ data }) => {
      refetchStewardData();
      return data;
    },
  });

  const handleEdit = (item: any) => {
    form.setValue("stewardNo", item?.stewardNo);
    form.setValue("stewardName", item?.name);
    setIsUpdate(true);
    setItemId(item?.id);
  };
  const handleDelete = (id: string) => {
    mutation.mutate(id);
    Toast.show({
      type: "success",
      text1: "Item Deleted Successfully",
      visibilityTime: 3000,
    });
  };

  return (
    <View
      className={`relative z-[300] mb-2 h-[30vh] w-full rounded-md border ${
        theme === "dark" ? "border-border-dark" : "border-border"
      }`}
    >
      <ScrollView
        horizontal={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
        nestedScrollEnabled={true}
      >
        <View className="w-full">
          <View
            className={`sticky top-0 z-10 flex flex-row border-b p-2 ${
              theme === "dark"
                ? "border-border-dark bg-background-dark"
                : "border-border bg-background"
            }`}
          >
            <Text className={`text-center font-medium w-1/4 ${theme === "dark" ? "text-white" : "text-black"}`}>
              Steward Name
            </Text>
            <Text className={`text-center font-medium w-1/4 ${theme === "dark" ? "text-white" : "text-black"}`}>
              Steward Number
            </Text>
            <Text className={`text-center font-medium w-1/2 ${theme === "dark" ? "text-white" : "text-black"}`}>
              Action
            </Text>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={true}
            contentContainerStyle={{ flexGrow: 1, zIndex: 100 }}
            nestedScrollEnabled={true}
            scrollEnabled={true}
          >
            {stewardData.map((item: any, index: number) => (
              <View
                key={item.id}
                className={`flex flex-row border-b px-2 py-1.5 ${
                  theme === "dark"
                    ? "hover:bg-background-table-card-dark border-border-dark"
                    : "hover:bg-background-table-card border-border"
                }`}
              >
                <ThemeText className="text-center font-medium w-1/4">
                  {item.name}
                </ThemeText>

                <TouchableOpacity className="flex justify-center w-1/4">
                  <ThemeText className="text-center uppercase">
                    {item.stewardNo}
                  </ThemeText>
                </TouchableOpacity>

                <ThemeText className="flex items-center  justify-center text-center font-medium w-1/2 h-full">
                  <View className="flex flex-row justify-between items-center h-full ">
                    <TouchableOpacity onPress={() => handleEdit(item)} className="flex justify-center">
                      <EditIcon width={18} height={18} fill={theme === "dark" ? "white" : "black"} />
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => {
                        setSelectedStewardId(item.id);
                        setShowConfirmationModal(true);
                      }}
                      className="ml-5 md:ml-0 flex justify-center items-center "
                    >
                      <DeleteIcon width={18} height={18} fill={theme === "dark" ? "white" : "black"} />
                    </TouchableOpacity>
                  </View>
                </ThemeText>
              </View>
            ))}
          </ScrollView>
          {showConfirmationModal && (
            <ConfirmationModal
              theme={theme}
              showConfirmationModal={showConfirmationModal}
              setShowConfirmationModal={setShowConfirmationModal}
              handleDeleteConfirm={() => {
                handleDelete(selectedStewardId);
              }}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default StewardMasterTable;
