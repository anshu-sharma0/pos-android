import React, { useState } from "react";
import { View, Text, TouchableOpacity, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Select } from "./select";

const TagsDropDown = ({ tableData, setTableData, title, data, theme }) => {
  const [tagValue, setTagValue] = useState("");

  const removeTag = (index) => {
    if (
      tableData &&
      tableData.length >= 2 &&
      Number(tableData[index]) === Number(tableData[tableData.length - 1])
    ) {
      setTagValue(tableData[tableData.length - 2]);
    }
    if (tableData.length === 1) {
      setTagValue("");
    }
    setTableData((prevTableData) => {
      const updatedTableData = {
        ...prevTableData,
        [title]: prevTableData[title].filter((_: any, i: any) => i !== index),
      };
      return updatedTableData;
    });
  };

  const renderTag = ({ item, index }: any) => (
    <View className="flex items-center bg-[#EB9E4C] rounded-md px-2 py-2 m-1  !flex-row "
    >
      <Text style={{ color: "black", marginRight: 8 }}>{item}</Text>
      <TouchableOpacity onPress={() => removeTag(index)} className="mt-[1px]">
        <Ionicons name="close" size={16} color="black" />
      </TouchableOpacity>
      </View>
  );

  return (
    <View style={{ borderRadius: 8 }}>
      <View>
        <Select
          placeholder="Select Table No"
          value={tagValue}
          onValueChange={(event) => {
            setTagValue(event);
            setTableData((prevTableData) => ({
              ...prevTableData,
              [title]: [...prevTableData[title], event],
            }));
          }}
          items={
            data
              ? data.map((item) => ({ label: item.code, value: item.code }))
              : []
          }
        />
      </View>
        <FlatList
          data={tableData}
          renderItem={renderTag}
          keyExtractor={(item, index) => index.toString()}
          numColumns={3}
          style={{ marginTop: 8 }}
          contentContainerStyle={{
            flexWrap: "wrap",
            width: "100%",
            flexDirection: "row"
          }}
        />
    </View>
  );
};

export default TagsDropDown;
