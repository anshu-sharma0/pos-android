import { View, Text, TouchableWithoutFeedback } from "react-native";
import React, { useState } from "react";
import { ThemeText, ThemeView } from "@/custom-elements";
import CategoryCard from "@/components/molecules/cards/category-card";
import { useTheme } from "@/hooks/useTheme";
import { router } from "expo-router";
import MasterDiscountModal from "@/components/modal/master-discount-modal";
import RestaurantSettingModal from "@/components/modal/restaurant-setting-modal";
import TaxMaster from "@/components/modal/tax-master";
import TableMaster from "@/components/modal/table-master";
import StewardMaster from "@/components/modal/steward-master";

const Master = () => {
  const { theme } = useTheme();
  const [isDiscountModalVisible, setIsDiscountModalVisible] = useState(false);
  const [isRestaurantModalVisible, setIsRestaurantModalVisible] = useState(false);
  const [isTaxMasterVisible, setIsTaxMasterVisible] = useState(false);
  const [isTableMasterVisible, setIsTableMasterVisible] = useState(false);
  const [isStewardMasterVisible, setIsStewardMasterVisible] = useState(false);

  const masterData = [
    {
      name: "Stock Master",
      onPress: () => router.push("/master/stock-master"),
    },
    {
      name: "Employee Master",
      onPress: () => {},
    },
    {
      name: "Discount Password",
      onPress: () => setIsDiscountModalVisible(true), 
    },
    {
      name: "Restaurant Setting",
      onPress: () => setIsRestaurantModalVisible(true),
    },
    {
      name: "Tax Master",
      onPress: () => {setIsTaxMasterVisible(true)},
    },
    {
      name: "Steward Master",
      onPress: () => {setIsStewardMasterVisible(true)},
    },
    {
      name: "Table Master",
      onPress: () => {setIsTableMasterVisible(true)},
    },
  ];

  return (
    <ThemeView className="flex-row   items-center justify-center xl:items-start xl:justify-start flex-wrap overflow-hidden w-[95vw] xl:w-[calc(100vw-150px)]">
      {masterData.map((item, index) => (
        <CategoryCard
          key={index}
          name={item.name}
          onPress={item.onPress}
          theme={theme}
          styleText="!capitalize"
        />
      ))}
        <MasterDiscountModal
          visible={isDiscountModalVisible}
          theme={theme}
          onClose={() => setIsDiscountModalVisible(false)} 
          setIsDiscountModalVisible={setIsDiscountModalVisible}
        />

        <RestaurantSettingModal
          visible={isRestaurantModalVisible}
          theme={theme}
          onClose={() => setIsRestaurantModalVisible(false)} 
          setIsRestaurantModalVisible={setIsRestaurantModalVisible}
        />

        <TaxMaster
          visible={isTaxMasterVisible}
          theme={theme}
          onClose={() => setIsTaxMasterVisible(false)} 
          setIsTaxMasterVisible={setIsTaxMasterVisible}
        />

        <TableMaster
          visible={isTableMasterVisible}
          theme={theme}
          onClose={() => setIsTableMasterVisible(false)} 
          setIsTableMasterVisible={setIsTableMasterVisible}
        />

        <StewardMaster
          visible={isStewardMasterVisible}
          theme={theme}
          onClose={() => setIsStewardMasterVisible(false)} 
          setIsStewardMasterVisible={setIsStewardMasterVisible}
        />
    </ThemeView>
  );
};

export default Master;
