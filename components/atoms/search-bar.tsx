import React, { useState, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Product, SelectedProduct, Table } from "@/types";
import {
  Platform,
  FlatList,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";
import SearchIcon from "@/assets/icons/search";
import { ThemeInput, ThemeText } from "@/custom-elements";

const formSchema = z.object({
  search: z.string(),
});

interface SearchBarProps {
  search: string;
  setSearch: (search: string) => void;
  searchResult: Product[];
  setSelectedProduct?: (product: SelectedProduct) => void;
  selectedTable?: Table | null;
  productsList?: SelectedProduct[];
  showSuggestions: boolean;
  theme: string;
  style?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  search,
  setSearch,
  searchResult = [],
  setSelectedProduct,
  productsList,
  showSuggestions,
  theme,
  style,
}) => {
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(-1);

  const { control, setValue } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      search: "",
    },
  });

  const shouldShowSuggestions = search && showSuggestions;

  useEffect(() => {
    if (search) {
      setSelectedOptionIndex(-1);
    }
  }, [search]);

  const renderItem = ({ item, index }: { item: Product; index: number }) => (
    <TouchableOpacity
      className={`p-2 ${selectedOptionIndex === index ? "bg-orange" : ""}`}
      onPress={() => {
        const sameItem = productsList?.filter(
          (listItem) => listItem.id === item.id
        );
        if (sameItem?.length) {
          setValue("search", "");
          setSearch("");
        } else {
          setValue("search", "");
          setSearch("");
          setSelectedProduct?.({
            ...item,
            quantity: 1,
          });
        }
      }}
    >
      <ThemeText className="font-regular">{item.name}</ThemeText>
    </TouchableOpacity>
  );

  return (
    <View
      className={`z-10 w-full ${
        Platform.OS === "web" ? "relative" : "absolute h-[200px]"
      }`}
    >
      <View className="absolute right-2 md:right-8 md:top-2.5 top-3">
        <SearchIcon width={20} height={20} fill="#fb923c" />
      </View>

      <Controller
        control={control}
        rules={{
          required: true,
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <View className="relative">
            <ThemeInput
              onBlur={onBlur}
              onChangeText={(text) => {
                onChange(text);
                setSearch(text);
              }}
              value={value}
              className={`${style} w-full rounded-md border pl-2.5 pr-8 outline-none focus:border-primary ${
                Platform.OS === "web" ? "py-2.5" : "py-1.5"
              }`}
              placeholderTextColor="gray"
              placeholder="Search items"
            />
          </View>
        )}
        name="search"
      />

      {shouldShowSuggestions && Platform.OS !== "web" ? (
        <ScrollView
          horizontal
          contentContainerStyle={{ width: "100%", marginBottom: 5 }}
        >
          <FlatList
            data={searchResult}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            ListEmptyComponent={
              <View className="p-4 w-full items-center justify-center">
                <ThemeText className="font-regular text-center">
                  No data found.
                </ThemeText>
              </View>
            }
            className={`p-2 top- rounded-md shadow border ${
              theme === "dark"
                ? "border-border-dark bg-background-dark"
                : "border-border bg-background"
            }`}
            contentContainerStyle={{
              zIndex: 500,
              position: "absolute",
              width: "100%",
              maxHeight: 200,
            }}
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}
          />
        </ScrollView>
      ) : null}
      {shouldShowSuggestions && Platform.OS === "web" ? (
        <ScrollView
          className={`absolute min-h-max z-20 right-0 p-5 w-full rounded-md shadow border overflow-y-auto ${
            theme === "dark"
              ? "border-border-dark bg-background-dark"
              : "border-border bg-background"
          } ${Platform.OS === "web" ? "top-[40px]" : "top-[45px]"}`}
          style={{ maxHeight: 160 }}
        >
          {searchResult?.length ? (
            searchResult?.map((list: Product, index: number) => (
              <TouchableOpacity
                key={index}
                className={`text-primary my-1 text-xsmall cursor-pointer ${
                  selectedOptionIndex === index ? "bg-orange text-primary" : ""
                }`}
                onPress={() => {
                  const sameItem = productsList?.filter(
                    (item) => item.id === list.id
                  );
                  if (sameItem?.length) {
                    setValue("search", "");
                    setSearch("");
                  } else {
                    setValue("search", "");
                    setSearch("");
                    setSelectedProduct &&
                      setSelectedProduct({
                        ...list,
                        quantity: 1,
                      });
                  }
                }}
              >
                <ThemeText className="font-regular">{list.name}</ThemeText>
              </TouchableOpacity>
            ))
          ) : (
            <View className="p-1 w-full h-full">
              <View className="flex items-center justify-center w-full h-full rounded-md">
                <ThemeText className="font-regular">No data found.</ThemeText>
              </View>
            </View>
          )}
        </ScrollView>
      ) : null}
    </View>
  );
};

export default SearchBar;
