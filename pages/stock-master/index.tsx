import { Platform, Pressable, View } from "react-native";
import React, { useEffect, useMemo, useState } from "react";
import * as DocumentPicker from 'expo-document-picker';
import { ThemeInput, ThemeText, ThemeView } from "@/custom-elements";
import { useTheme } from "@/hooks/useTheme";
import BackBtn from "@/components/atoms/back-btn";
import { router } from "expo-router";
import { BaseButton } from "@/components/atoms/base-button";
import SearchBar from "@/components/atoms/search-bar";
import {
  createBulkProduct,
  deleteProduct,
  fetchProducts,
} from "@/services/products";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Product, Restaurant } from "@/types";
import StockMasterTable from "@/components/organisms/stock-master-table";
import StockMasterForm from "@/components/molecules/stock-master-form";
import { getAllTax } from "@/services/restaurant";
import { fetchCategory } from "@/services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { productTaxType } from "@/utils/products";
import { exportCSVFile } from "@/utils/jsonToCSV";
import Toast from "react-native-toast-message";

const StockMaster = () => {
  const { theme } = useTheme();
  const [search, setSearch] = useState<string>("");
  const [largestCode, setLargestCode] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [userId, setUserId] = useState<string>("");
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const getUserId = async () => {
      if (Platform.OS === "web") {
        const userId: string = localStorage.getItem("userId") as string;
        if (userId) {
          setUserId(userId);
        }
      } else {
        const userId = (await AsyncStorage.getItem("userId")) as string;
        if (userId) {
          setUserId(userId);
        }
      }
    };
    getUserId();
  }, []);

  const { data: products, refetch: refetchProducts } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  const { data: category } = useQuery({
    queryKey: ["category"],
    queryFn: fetchCategory,
  });

  const { data: getAllTaxes } = useQuery({
    queryKey: ["users-list", userId],
    queryFn: (): Promise<Restaurant> => getAllTax(userId as string),
  });

  useEffect(() => {
    if (products?.data) {
      const largestNumber = Math.max(
        ...products?.data?.map((item: any) => Number(item.code))
      );
      setLargestCode(`${largestNumber + 1}`);
    }
  }, [products]);

  const { mutateAsync: createBulkProducts } = useMutation({
    mutationKey: ["product-bulk"],
    mutationFn: createBulkProduct,
    onSuccess: ({ data }) => {
      refetchProducts();
      return data;
    },
  });

  const { mutateAsync: handleDeleteProduct } = useMutation({
    mutationKey: ["product-delete"],
    mutationFn: deleteProduct,
    onSuccess: () => {
      refetchProducts();
      Toast.show({
        type: "success",
        text1: "Item Deleted Successfully",
        visibilityTime: 3000,
      });
    },
  });

  const handleProductsSearch = (search: string) => {
    const filteredProducts = products?.data.filter((product: Product) => {
      const productName = product?.name?.toLowerCase();
      return productName?.includes(search.toLowerCase());
    });
    return filteredProducts;
  };

  const productsLength = products?.data?.length;

  const handleDownloadProducts = () => {
    if (productsLength) {
      const csvHeaders = {
        code: "Item Code",
        category: "Category",
        subcategory: "Sub category",
        name: "Product",
        price: "Rate",
        tax: "Tax Type",
      };

      const productsDataForCSV = products?.data.map((product: Product) => {
        const taxValueWithType = productTaxType(
          product?.category?.name as string,
          product?.category?.tax as string
        );

        return {
          code: product?.code,
          category: product?.category?.name,
          subcategory: product?.subcategory?.name,
          name: product?.name,
          price: product?.price,
          tax: product?.category?.tax + " " + (product?.taxType || ""),
        };
      });

      return exportCSVFile(csvHeaders, productsDataForCSV, "products");
    }
  };

  const handleCsvImport = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: "text/csv" });
    if (result.type === 'success') {
      handleCsvUpload(result.uri);
    }
  };

  const handleCsvUpload = (fileUri: string) => {
    const formData = new FormData();
    formData.append("products", {
      uri: fileUri,
      name: "products.csv",
      type: "text/csv",
    });
    createBulkProducts(formData);
  };

  const searchedValues = useMemo(() => {
    return handleProductsSearch(search);
  }, [search]);

  return (
    <ThemeView className="flex-row items-center justify-center xl:items-start xl:justify-start flex-wrap overflow-hidden w-full xl:w-[calc(100vw-150px)] mt-5">
      <Pressable className="relative flex items-center justify-center w-full h-full" onPress={()=>setShowDropdown(!showDropdown)}>
        <View className="w-full items-center">
          <BackBtn onPress={() => router.push("/master")} style="!top-2" />
          <ThemeText className="text-4xl font-medium uppercase">
            Stock Master
          </ThemeText>
        </View>
        <View className="w-full justify-center items-center">
          <View className="w-[99%] 2xl:w-[75%] mt-8">
            <StockMasterForm
              largestCode={largestCode}
              selectedProduct={selectedProduct}
              categoryList={category}
              refetchProducts={refetchProducts}
              getAllTax={getAllTaxes}
              theme={theme}
              showDropdown={showDropdown}
              setShowDropdown={setShowDropdown}
            />

            <View className="w-full flex-row items-center justify-between mt-8">
              <View className="w-1/3 z-0">
                <SearchBar
                  search={search}
                  setSearch={setSearch}
                  searchResult={searchedValues}
                  showSuggestions={false}
                  theme={theme}
                />
              </View>
              <View className="flex-row">
                <BaseButton
                  title="Download"
                  theme={theme}
                  onPress={handleDownloadProducts}
                  // onPress={()=>console.log("first")}
                  style="w-fit ml-auto !px-8 !py-2 !mb-5 md:!mb-0"
                />
                <BaseButton
                  title="Upload"
                  theme={theme}
                  onPress={() => handleCsvImport}
                  // onPress={()=>console.log("first")}
                  style="w-fit ml-2 !px-8 !py-2 !mb-5 md:!mb-0"
                />
              </View>
            </View>

            <View className="h-[50vh]">
              <StockMasterTable
                productsData={products?.data}
                search={search}
                filterData={searchedValues}
                handleDelete={handleDeleteProduct}
                setSelectedProduct={setSelectedProduct}
                theme={theme}
              />
            </View>
          </View>
        </View>
      </Pressable>
    </ThemeView>
  );
};

export default StockMaster;
