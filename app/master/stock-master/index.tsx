import { View, Text, Platform, StatusBar, ScrollView } from "react-native";
import React, { useState } from "react";
import Header from "@/components/molecules/header";
import Sidebar from "@/components/molecules/sidebar";
import { useTheme } from "@/hooks/useTheme";
import { ThemeSafeAreaView, ThemeText, ThemeView } from "@/custom-elements";
import Master from "@/pages/master";
import StockMaster from "@/pages/stock-master";

const StockMasterScreen = () => {
  const { theme } = useTheme();
  const [openSidebar, setOpenSidebar] = useState(false);

  return (
    <ThemeSafeAreaView
      style={{
        flex: Platform.OS !== "web" ? 0 : 1,
      }}
      className="relative h-full w-full"
    >
      <Header setOpenSidebar={setOpenSidebar} openSidebar={openSidebar} />
      <ThemeView className="flex min-h-[calc(100vh-64px)] w-full flex-col sm:mt-16 sm:flex-row">
        <Sidebar
          setOpenSidebar={setOpenSidebar}
          openSidebar={openSidebar}
          theme={theme}
        />
        <ThemeView className="flex-grow justify-center overflow-hidden xl:pl-[100px]">
          <View
            className={`flex-grow overflow-hidden xl:pl-[30px] pt-0`}
          >
            <ScrollView
              className={`w-full overflow-hidden ${
                theme === "dark" ? "bg-background-dark" : "bg-background"
              }`}
              showsVerticalScrollIndicator
            >
              <StockMaster />
            </ScrollView>
          </View>
        </ThemeView>
      </ThemeView>
    </ThemeSafeAreaView>
  );
};

export default StockMasterScreen;
