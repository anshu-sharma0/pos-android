import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, Dimensions } from 'react-native';
import { useTheme } from "@/hooks/useTheme";

export const Select = ({ placeholder, value, onValueChange, items }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalLayout, setModalLayout] = useState({ top: 0, left: 0, width: 0 });
  const inputRef = useRef(null);
  const { theme } = useTheme();

  const toggleModal = () => setModalVisible(!modalVisible);

  const selectItem = (item) => {
    onValueChange(item.value);
    toggleModal();
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      className={`p-3 border-gray-300 rounded ${theme === "dark" ? "hover:bg-gray-700" : "hover:bg-slate-100"}`}
      onPress={() => selectItem(item)}
    >
      <Text className={`${theme === 'dark' ? "text-white " : "text-black "}`}>{item.label}</Text>
    </TouchableOpacity>
  );

  useEffect(() => {
    if (modalVisible && inputRef.current) {
      inputRef.current.measure((x, y, width, height, pageX, pageY) => {
        setModalLayout({
          top: pageY + height,
          left: pageX,
          width: width,
        });
      });
    }
  }, [modalVisible]);

  return (
    <View className="relative">
      <TouchableOpacity
        className={`${theme === "dark" ? "bg-black border-border-dark" : "bg-white border-border"} border rounded-md p-2.5`}
        onPress={toggleModal}
        ref={inputRef}
      >
        <Text className={`${theme === "dark" ? "text-white" : "text-black"}`}>{value || placeholder}</Text>
      </TouchableOpacity>

      <Modal
        transparent
        visible={modalVisible}
        onRequestClose={toggleModal}
      >
        <TouchableOpacity
          style={{ flex: 1 }}
          onPress={toggleModal}
          activeOpacity={1}
        >
          <View
            style={{
              position: 'absolute',
              top: modalLayout.top,
              left: modalLayout.left,
              width: modalLayout.width,
              maxHeight: Dimensions.get('window').height * 0.3,
              backgroundColor: theme === "dark" ? "black" : "white",
              borderBottomLeftRadius: 8,
              borderBottomRightRadius: 8,
              borderColor: theme === "dark" ? "#333" : "#ccc",
              borderWidth: 1,
              borderTopWidth: 0,
            }}
          >
            <FlatList
              data={items}
              renderItem={renderItem}
              keyExtractor={(item) => item.value}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};