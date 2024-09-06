import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { ThemeText } from "@/custom-elements"; // Assuming this is the correct import
import { useQuery } from "@tanstack/react-query";
import { TaxTypeProps } from "@/types";
import { getAllTax } from "@/services/restaurant";

type TaxMasterTableProps = {
  theme: string;
  getAllTax: any;
};

const TaxMasterTable = (props: TaxMasterTableProps) => {
  const { theme, getAllTax } = props;

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
            <Text className={`text-center font-medium w-1/4  ${theme === "dark" ? "text-white" : "text-black"}`}>
              S No.
            </Text>
            <Text className={`text-center font-medium w-1/4  ${theme === "dark" ? "text-white" : "text-black"}`}>
              Tax Type
            </Text>
            <Text className={`text-center font-medium w-1/2  ${theme === "dark" ? "text-white" : "text-black"}`}>
              Tax Percentage
            </Text>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={true}
            contentContainerStyle={{ flexGrow: 1, zIndex: 100 }}
            nestedScrollEnabled={true}
            scrollEnabled={true}
          >
            {getAllTax.map((item: any, index: number) => (
              <View
                key={index}
                className={`flex flex-row border-b px-2 py-1.5 ${
                  theme === "dark"
                    ? "hover:bg-background-table-card-dark border-border-dark"
                    : "hover:bg-background-table-card border-border"
                }`}
              >
                <ThemeText className="text-center font-medium w-1/4">
                  {index + 1}
                </ThemeText>
                  <ThemeText className="text-center w-1/4">
                    {item.type}
                  </ThemeText>
                <ThemeText className="flex items-center justify-center text-center font-medium w-1/2">
                  {item.percentage || ""}
                </ThemeText>
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
};

export default TaxMasterTable;
