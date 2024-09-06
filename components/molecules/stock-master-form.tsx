import { Pressable, View } from "react-native";
import React, { useEffect, useMemo, useState } from "react";
import { BaseButton } from "../atoms/base-button";
import { Controller, useForm } from "react-hook-form";
import { ThemeInput } from "@/custom-elements";
import DropdownInput from "./dropdown-input";
import {
  Category,
  Product,
  Restaurant,
  stockMasterPayloadType,
  Subcategory,
  TaxTypes,
} from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  createProduct,
  updateProduct,
  fetchProducts,
} from "@/services/products";

const formSchema = z.object({
  code: z.string().nullable(),
  price: z.string(),
  name: z.string(),
});

interface prop {
  selectedProduct: Product | null;
  categoryList: Category[];
  refetchProducts: () => void;
  getAllTax: Restaurant | undefined;
  largestCode: string;
  theme: string;
  showDropdown?: boolean;
  setShowDropdown?: boolean;
}

const StockMasterForm: React.FC<prop> = ({
  selectedProduct,
  categoryList,
  refetchProducts,
  getAllTax,
  largestCode,
  theme,
  showDropdown,
  setShowDropdown,
}) => {
  const [category, setCategory] = useState<Category | null>(null); // Initialize as null
  const [subcategory, setSubcategory] = useState<Subcategory | null>(null); // Initialize as null
  const [taxType, setTaxType] = useState<TaxTypes | null>(null); // Initialize as null
  const [updateData, setUpdateData] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      price: "",
      name: "",
      code: "",
    },
  });

  const resetStateInfo = () => {
    form.reset({
      price: "",
      name: "",
      code: "",
    });
    setCategory(null); // Reset category to null
    setSubcategory(null); // Reset subcategory to null
    setTaxType(null);
  };

  useEffect(() => {
    if (selectedProduct?.id) {
      const foundCategory = categoryList.find(
        (category: Category) =>
          category?.name === selectedProduct?.category?.name
      );

      setCategory(foundCategory || null); // Set to foundCategory or null
      setSubcategory(selectedProduct?.subcategory || null);
      form.reset({
        code: selectedProduct?.code || "",
        price: selectedProduct?.price || "",
        name: selectedProduct?.name || "",
      });
      setTaxType(`${selectedProduct?.taxType} ${selectedProduct?.tax}` as any);
    }
  }, [selectedProduct]);

  const { mutateAsync: createProducts, isPending: isProductCreating } =
    useMutation({
      mutationKey: ["product"],
      mutationFn: createProduct,
      onSuccess: () => {
        // setCategory(null);
        resetStateInfo();
        refetchProducts?.();
      },
    });

  const { mutateAsync: updateProducts, isPending: isProductUpdating } =
    useMutation({
      mutationKey: ["update-product"],
      mutationFn: updateProduct,
      onSuccess: () => {
        resetStateInfo();
        // setCategory(null);
        setUpdateData(prevState => !prevState);
        refetchProducts?.();
      },
    });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const payload: any | stockMasterPayloadType = {
      ...values,
      categoryId: category?.id,
      subcategoryId: subcategory?.id,
      taxType: (taxType as TaxTypes).type,
      tax: JSON.stringify((taxType as TaxTypes).percentage),
      productId: selectedProduct?.id,
    };

    const actionToTake = selectedProduct?.id ? updateProducts : createProducts;
    actionToTake(payload);
  };

  const subCategoryForSelectedCategory = useMemo(() => {
    return category?.subcategory || []; // Return empty array if no category
  }, [category]);

  const isLoading = isProductCreating || isProductUpdating;
  useEffect(() => {
    if (largestCode) {
      form.setValue("code", largestCode);
    }
  }, [largestCode, updateData]);

  return (
    <View className="z-10">
      <View className="flex-row">
        <Controller
          name="code"
          control={form?.control}
          render={({ field: { onChange, value } }) => (
            <ThemeInput
              onChangeText={(text) => onChange(text)}
              value={value}
              className="w-1/2 rounded-md border cursor-not-allowed text-xs lg:text-sm font-regular px-2.5 py-2 outline-none focus:border-primary"
              placeholderTextColor="gray"
              readOnly={true}
            />
          )}
        />
        <Controller
          name="name"
          control={form?.control}
          render={({ field: { onChange, value } }) => (
            <ThemeInput
              onChangeText={(text) => onChange(text)}
              value={value}
              className="ml-4 w-1/2 rounded-md border text-xs lg:text-sm font-regular px-2.5 py-2 outline-none focus:border-primary"
              placeholder="Enter item description"
              placeholderTextColor="gray"
            />
          )}
        />
      </View>
      <Pressable className="flex-row mt-5 z-30 " onPress={()=>console.log("first")}>
        <Controller
          name="price"
          control={form?.control}
          render={({ field: { onChange, value } }) => (
            <ThemeInput
              // onChangeText={(text) => onChange(text)}
              value={value}
              className="w-1/2 rounded-md border text-xs lg:text-sm font-regular px-2.5 py-2 outline-none focus:border-primary"
              placeholder="Enter item rate"
              onChangeText={(text) => {
                if (/^\d*$/.test(text)) {
                  onChange(text);
                }
              }}
              placeholderTextColor="gray"
            />
          )}
        />
        <DropdownInput
          availableValue={category?.name || ""}
          dataList={categoryList}
          selectName="Select category"
          onSelectChange={(data: Category) => setCategory(data as Category)}
          name="Select category"
          theme={theme}
          style="ml-4 "
          showDropdown={showDropdown}
          setShowDropdown={setShowDropdown}
        />
      </Pressable>
      <View className="flex-row mt-5 z-20">
        <DropdownInput
          availableValue={subcategory?.name || ""}
          dataList={subCategoryForSelectedCategory}
          selectName="Select sub-category"
          onSelectChange={(data: Subcategory) =>
            setSubcategory(data as Subcategory)
          }
          name="Select sub-category"
          theme={theme}
        />
        <DropdownInput
          taxType={taxType}
          availableValue={taxType ?
            taxType?.type || taxType?.percentage
              ? `${taxType?.type as string} ${taxType?.percentage}`
              : `${taxType}` : ""
          }
          dataList={getAllTax}
          selectName="Select tax type"
          onSelectChange={(data: TaxTypes) => setTaxType(data as TaxTypes)}
          type="tax"
          name="Select tax type"
          theme={theme}
          style="ml-3.5"
        />
      </View>
      <BaseButton
        title="Save"
        theme={theme}
        onPress={form.handleSubmit(onSubmit)}
        disabled={
          isLoading ||
          !(
            taxType &&
            subcategory &&
            category &&
            form.watch("code") &&
            form.watch("name") &&
            form.watch("price")
          )
        }
        style="w-fit ml-auto !px-10 !py-2 mt-4 !mb-5 md:!mb-0"
      />
    </View>
  );
};

export default StockMasterForm;
