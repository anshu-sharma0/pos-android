import React from "react";
import Modal from "../organisms/modal";
import { Text, TouchableOpacity, View } from "react-native";
import { BaseButton } from "../atoms/base-button";

interface confirmationModalProps {
  label?: String;
  showConfirmationModal: boolean;
  setShowConfirmationModal: (e: boolean) => void;
  handleDeleteConfirm: () => void;
  theme: string;
}

const ConfirmationModal: React.FC<confirmationModalProps> = ({
  label,
  showConfirmationModal,
  setShowConfirmationModal,
  handleDeleteConfirm,
  theme,
}) => {
  return (
    <Modal
      isOpen={showConfirmationModal}
      onClose={() => setShowConfirmationModal(false)}
      theme={theme}
      style="md:w-[50%] w-[90%]"
      title="Are you sure you want to delete Steward?"
    >
      <View className="">
        <View className="flex items-end">
          <View className="flex w-[50%s] flex-row items-center ">
            {/* <BaseButton
              title="Cancel"
              onPress={() => setShowConfirmationModal(false)}
              style="w-fit ml-auto px-[2.5rem] py-2 mt-8 mr-6"
            />
            <BaseButton
              title="Delete"
              onPress={() => {
                handleDeleteConfirm();
                setShowConfirmationModal(false);
              }}
              style="w-fit ml-auto px-[2.5rem] py-2 mt-8"
            /> */}
            <TouchableOpacity
              className="text-primary mr-8"
              onPress={() => setShowConfirmationModal(false)}
            >
              <Text className="font-[800] text-primary">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="text-primary"
              onPress={() => {
                handleDeleteConfirm();
                setShowConfirmationModal(false);
              }}
            >
              <Text className="font-[800] text-primary">Delete</Text>
              </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ConfirmationModal;
