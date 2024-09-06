import React, { useEffect, useRef, useState, useMemo } from "react";
import { View, Pressable, Text, TextInput, Platform } from "react-native";
import SearchIcon from "@/assets/icons/search";
import ChevronDownIcon from "@/assets/icons/chevron-down";
import CheckIcon from "@/assets/icons/check";
import { ThemeInput, ThemeText, ThemeView } from "@/custom-elements";
import { Category, Subcategory, selectedProductFormRefType, taxType } from "@/types";

interface DropdownInputProps {
  name?: string;
  theme?: string;
  style?: string;
  availableValue?: string;
  selectName?: string;
  dataList?: Category[] | Subcategory[] | any;
  onSelectChange?: (data: any) => void;
  type?: string;
  taxType?: any | null;
  showDropdown?: boolean;
  setShowDropdown?: boolean;
}

const DropdownInput: React.FC<DropdownInputProps> = ({
  name,
  theme,
  style,
  availableValue,
  selectName,
  dataList = [],
  onSelectChange,
  type,
  taxType,
  showDropdown,
  setShowDropdown,
}) => {
  const inputRef = useRef<TextInput>(null);
  // const [showDropdown, setShowDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [value, setValue] = useState(availableValue || "");
  const dropdownRef = useRef<View>(null);

  const filteredData = useMemo(() => {
    if (!searchTerm) return dataList;
    return dataList.filter((item: any) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, dataList]);

  useEffect(() => {
    if (showDropdown && Platform.OS === 'web') {
      inputRef.current?.focus();
    }
  }, [showDropdown]);

  useEffect(() => {
    if (availableValue !== undefined) {
      setValue(availableValue);
    }
  }, [availableValue]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);


  const handleItemPress = (info: selectedProductFormRefType) => {
    setValue(info?.name);
    onSelectChange?.(info);
    setShowDropdown(false);
  };

  const handleTaxItemPress = (tax: any) => {
    setValue(`${tax?.type} ${tax?.percentage}`);
    onSelectChange?.(tax);
    setShowDropdown(false);
  };

  return (
    <View className={`w-[49.4%] z-20 relative ${style}`}>
      <Pressable
        className={`rounded-md flex-row items-center border h-10 justify-between px-2.5 outline-none ${theme === "dark" ? "text-text border-border-dark hover:bg-gray-700" : "text-text-dark border-border hover:bg-slate-100"
          }`}
        onPress={() => setShowDropdown(!showDropdown)}
      >
        <Text
          className={`text-sm font-regular ${value ? (theme === "light" ? "!text-black" : "!text-white") : "text-text-billed"}`}
        >

          {value || selectName || name}
        </Text>
        <ChevronDownIcon width={16} height={16} />
      </Pressable>

      {showDropdown && (
        <ThemeView
          className={`absolute w-full rounded-md overflow-hidden top-11 z-20 border  ${theme === "dark" ? "border-border-dark bg-background-dark" : "border-border bg-background"
            }`}
          style={{ maxHeight: 300 }}
        >
          <View
            className={`border-b  ${theme === "dark" ? "border-border-dark bg-background-dark" : "border-border bg-background"
              }`}
          >
            <View className="absolute left-3 top-2.5">
              <SearchIcon width={20} height={20} fill="#a2a3a1" />
            </View>
            <ThemeInput
              ref={inputRef}
              value={searchTerm}
              onChangeText={setSearchTerm}
              className="rounded-md text-xs !bg-transparent lg:text-sm font-regular pl-10 pr-2.5 py-2 outline-none focus:border-primary"
              placeholder="Search..."
              placeholderTextColor="gray"
            // onFocus={() => setShowDropdown(true)}
            // onBlur={() => setShowDropdown(false)}
            />
          </View>
          <View className="overflow-auto max-h-40">
            {filteredData.length ? (
              filteredData.map((item: any, index: number) => (
                <Pressable
                  onPress={() => {
                    if (type !== "tax") {
                      handleItemPress(item);
                    } else {
                      handleTaxItemPress(item);
                    }
                  }}
                  className="flex-row items-center px-2 py-1.5"
                  key={index}
                >
                  <View
                    className={`${value === (type !== "tax" ? item?.name : `${item?.type} ${item?.percentage}`) ? "opacity-100" : "opacity-0"
                      }`}
                  >
                    <CheckIcon width={16} height={16} stroke={theme === "dark" ? "#fff" : "#000"} />
                  </View>
                  <ThemeText className="ml-2 font-regular">
                    {type !== "tax" ? item?.name : `${item?.type} ${item?.percentage}`}
                  </ThemeText>
                </Pressable>
              ))
            ) : (
              <View className="p-4 w-full items-center justify-center">
                <ThemeText className="font-regular text-center">
                  No data found
                </ThemeText>
              </View>
            )}
          </View>
        </ThemeView>
      )}
    </View>
  );
};

export default DropdownInput;
