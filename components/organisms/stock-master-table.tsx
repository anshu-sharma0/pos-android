import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  ScrollView,
  FlatList,
  Pressable,
} from "react-native";
import { Product } from "@/types";
import { ThemeText } from "@/custom-elements";
import DeleteIcon from "@/assets/icons/delete";
import EditIcon from "@/assets/icons/edit";
import Modal from "./modal";

interface StockMasterTableProps {
  productsData: Product[];
  search: string;
  filterData: Product[] | undefined;
  handleDelete: (id: string) => void;
  setSelectedProduct: (product: Product) => void;
  theme: string;
}

const StockMasterTable: React.FC<StockMasterTableProps> = ({
  productsData,
  search,
  filterData,
  handleDelete,
  setSelectedProduct,
  theme,
}) => {
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [productId, setProductId] = useState("");
  const [tableData, setTableData] = useState<Product[] | undefined>(filterData);

  const renderTableRows = ({
    item: product,
    index,
  }: {
    item: Product;
    index: number;
  }) => {
    return (
      <View
        key={product?.id || index}
        className={`flex w-full flex-row border-b px-2 py-1.5 ${
          theme === "dark"
            ? product?.id
              ? "hover:bg-background-table-card-dark border-border-dark"
              : "hover:bg-transparent border-border-dark"
            : product?.id
            ? "hover:bg-background-table-card border-border"
            : "hover:bg-transparent border-border"
        }
      `}
      >
        <ThemeText className="w-[80px] lg:w-[10%] text-center font-medium">
          {index + 1}
        </ThemeText>
        <View className="w-[100px] lg:w-[12%] flex justify-center">
          <ThemeText className="text-center uppercase font-regular">
            {product.code}
          </ThemeText>
        </View>
        <View className="flex w-[120px] lg:w-[12%] flex-row items-center justify-center text-center font-medium">
          <ThemeText className="px-2 text-center leading-4 font-regular">
            {product.category?.name}
          </ThemeText>
        </View>
        <ThemeText className="flex w-[180px] lg:w-[18%] items-center justify-center text-center font-regular">
          {product?.subcategory?.name}
        </ThemeText>
        <ThemeText className="flex w-[180px] lg:w-[18%] items-center justify-center text-center font-regular">
          {product.name}
        </ThemeText>
        <ThemeText className="flex w-[80px] lg:w-[10%] items-center justify-center text-center font-regular">
          {product.price}
        </ThemeText>
        <View className="flex w-[80px] lg:w-[10%] items-center justify-center text-center">
          <ThemeText className="text-center font-regular">
            {product.taxType && `${product.taxType} :`} {product.tax}
          </ThemeText>
        </View>
        <View className="flex flex-row w-[80px] lg:w-[10%] justify-center text-center">
          <TouchableOpacity
            onPress={() => {
              setSelectedProduct(product);
            }}
            className="mr-4 md:mr-0 flex justify-center"
          >
            <EditIcon
              width={18}
              height={18}
              fill={theme === "dark" ? "white" : "black"}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setProductId(product.id);
              setOpenDeleteModal(true);
            }}
            className="flex justify-center md:ml-2"
          >
            <DeleteIcon
              width={18}
              height={18}
              fill={theme === "dark" ? "white" : "black"}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  useEffect(() => {
    if (search === "" && filterData?.length === undefined) {
      setTableData(productsData);
    } else {
      filterData && setTableData(filterData);
    }
  }, [search, productsData]);

  return (
    <View
      className={`relative z-[300] mt-5 mb-2 h-full w-full rounded-md shadow ${
        theme === "dark" ? "border-border-dark" : "border-border"
      }`}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={Platform.OS === "web" ? true : false}
        contentContainerStyle={{ flexGrow: 1 }}
        nestedScrollEnabled={true}
      >
        <View
          className={`w-full rounded-md border-t ${
            theme === "dark" ? "border-border-dark" : "border-border"
          }`}
        >
          <View
            className={`sticky top-0 z-10 flex w-full flex-row border-x rounded-t-md overflow-hidden p-2 ${
              theme === "dark"
                ? "bg-background-dark border-border-dark"
                : "bg-background border-border"
            }`}
          >
            <Text className="w-[80px] lg:w-[10%] text-center font-medium text-text-grey">
              S.NO
            </Text>
            <Text className="w-[100px] lg:w-[12%] text-center font-medium text-text-grey">
              Item Code
            </Text>
            <Text className="w-[120px] lg:w-[12%] text-center font-medium text-text-grey">
              Category
            </Text>
            <Text className="w-[180px] lg:w-[18%] text-center font-medium text-text-grey">
              Sub Category
            </Text>
            <Text className="w-[180px] lg:w-[18%] text-center font-medium text-text-grey">
              Product
            </Text>
            <Text className="w-[80px] lg:w-[10%] text-center font-medium text-text-grey">
              Rate
            </Text>
            <Text className="w-[80px] lg:w-[10%] text-center font-medium text-text-grey">
              Tax type
            </Text>
            <Text className="w-[80px] lg:w-[10%] text-center font-medium text-text-grey">
              Actions
            </Text>
          </View>

          <View
            className={`min-h-[100px] h-[40vh] rounded-b-md border ${
              theme === "dark" ? "border-border-dark" : "border-border"
            }`}
          >
            {tableData?.length ? (
              <FlatList
                data={tableData}
                keyExtractor={(item, index) => `${item?.id}${index}`}
                renderItem={renderTableRows}
                contentContainerStyle={{ flexGrow: 1 }}
                nestedScrollEnabled={true}
              />
            ) : (
              <View className="p-1 w-full h-full">
                <View className="flex items-center justify-center w-full h-full rounded-md">
                  <ThemeText className="font-regular">No data found.</ThemeText>
                </View>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
      {/* Delete Product Modal */}
      <Modal
        isOpen={openDeleteModal}
        onClose={() => setOpenDeleteModal(false)}
        theme={theme}
        style="max-h-[90vh] w-[80vw] md:w-[50%]"
        title="Are you sure you want to delete the Item?"
      >
        <View className="mt-8 mb-3">
          <View className="flex-row justify-end items-center">
            <Pressable onPress={() => setOpenDeleteModal(false)} >
              <ThemeText className="!text-primary !p-0 text-[17px] font-[600] text-orange mx-3">Cancel</ThemeText>
            </Pressable>
            <Pressable
              onPress={() => {
                if (productId) {
                  handleDelete(productId);
                  setOpenDeleteModal(false);
                }
              }}
            >
              <ThemeText className="!text-primary !p-0 text-[17px] font-[600] text-orange mx-3">Delete</ThemeText>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default StockMasterTable;
