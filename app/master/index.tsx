import { View, Text, Platform, StatusBar, ScrollView } from "react-native";
import React, { useState } from "react";
import Header from "@/components/molecules/header";
import Sidebar from "@/components/molecules/sidebar";
import { useTheme } from "@/hooks/useTheme";
import { ThemeSafeAreaView, ThemeText, ThemeView } from "@/custom-elements";
import Master from "@/pages/master";

const MasterScreen = () => {
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
      <ThemeView className="flex min-h-[calc(100vh-64px)] w-full flex-col sm:mt-16 sm:flex-row md:overflow-hidden">
        <Sidebar
          setOpenSidebar={setOpenSidebar}
          openSidebar={openSidebar}
          theme={theme}
        />
        <ThemeView className="flex-grow justify-center overflow-hidden xl:pl-[100px] pt-0 h-[80vh] md:pt-5">
          <View
            className={`flex-grow overflow-hidden xl:pl-[50px] pt-0 h-[83vh] md:h-[85vh] md:pt-5`}
          >
            <ScrollView
              className={`h-[80vh] w-full overflow-hidden ${
                theme === "dark" ? "bg-background-dark" : "bg-background"
              }`}
              showsVerticalScrollIndicator
            >
              <View className={`overflow-hidden xl:pr-[15px] justify-center items-center mt-6`}>
                <Master />
              </View>
            </ScrollView>
          </View>
        </ThemeView>
      </ThemeView>
    </ThemeSafeAreaView>
  );
};

export default MasterScreen;
