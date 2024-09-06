import {
  billingFormDefaultValues,
  billingFormSchema,
} from "@/constants/bill-form-schema";
import { generateBillReciept } from "@/services/billing";
import {
  Category,
  SelectedProduct,
  SelectedProductFormInfoType,
  Table,
} from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Controller, UseFormReturn, useForm } from "react-hook-form";
import {
  View,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
  Platform,
} from "react-native";
import { z } from "zod";
import { MyContext } from "@/context/context";
import { ThemeInput, ThemeText } from "@/custom-elements";
import Toast from "react-native-toast-message";
import DiscountModal from "./discount-modal";

type BillingFormProps = {
  billingId?: string;
  isLoading: boolean;
  handleBillAndKotInitiate: () => void;
  handlePrintBillSuccess: () => void;
  isKotButtonDisabled: boolean;
  isPrintBillButtonDisabled: boolean;
  productsList: SelectedProduct[];
  selectedProductFormRef: UseFormReturn<SelectedProductFormInfoType | any>;
  selectedTable: Table | null;
  setRefetchUnsettledBillData: (e: number) => void;
  refetchUnsettledBillData: number;
  customerId?: string;
  refetchKotsForTable: () => void;
  newProductsList: SelectedProduct[];
  theme: string;
  inputStewardNoRef: any;
  setIsTable: (e: boolean) => void;
  setIsTableDetails: (e: boolean) => void;
  setShowBillTable?: (e: boolean) => void;
};

type BillPrintPayload = {
  discount: number;
  id: string;
  netAmount?: number | null;
  tax: number;
  taxAmount?: number;
  subTotal: number;
  discountReason?: string | null;
  foodDiscount?: number | null;
  barDiscount?: number | null;
  isLoading?: boolean;
  customerId?: string | null;
  gst?: string | null;
  vat?: string | null;
};

export default function BillForm(props: BillingFormProps) {
  const [isPrinting, setIsPrinting] = useState(false);
  const [foodListAmount, setFoodListAmount] = useState(0);
  const [barListAmount, setBarListAmount] = useState(0);
  const [isAuthenticate, setIsAuthenticate] = useState<boolean>(false);
  const [openDiscountModal, setOpenDiscountModal] = useState<boolean>(false);
  const [isFoodAdded, setIsFoodAdded] = useState(false);

  const {
    isLoading,
    billingId,
    handleBillAndKotInitiate,
    handlePrintBillSuccess,
    isKotButtonDisabled,
    isPrintBillButtonDisabled,
    productsList = [],
    selectedProductFormRef: selectedProductionform,
    selectedTable,
    setRefetchUnsettledBillData,
    refetchUnsettledBillData,
    customerId,
    refetchKotsForTable,
    newProductsList,
    theme,
    inputStewardNoRef,
    setIsTable,
    setIsTableDetails,
    setShowBillTable,
  } = props;

  useEffect(() => {
    if (newProductsList.length) {
      newProductsList.filter((item) =>
        item.category?.name === "food"
          ? setIsFoodAdded(true)
          : setIsFoodAdded(false)
      );
    } else {
      setIsFoodAdded(false);
    }
  }, [productsList]);

  console.log(newProductsList, "newProductsList");
  console.log(isFoodAdded, "is food");

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    defaultValues: {
      ...billingFormDefaultValues,
      netAmount: "",
    },
  });

  const selectProductionFormErrors = selectedProductionform?.formState?.errors;
  // const toast = useToast();
  const form = useForm<z.infer<typeof billingFormSchema>>({
    resolver: zodResolver(billingFormSchema),
    // @ts-ignore
    defaultValues: billingFormDefaultValues,
    mode: "onChange",
  });
  const { setName, setTableNo } = useContext(MyContext);
  const {
    subTotal,
    foodDiscountPercentage,
    barDiscountPercentage = 0,
    discount,
    taxAmount,
    netAmount,
    foodDiscountAmount,
    barDiscountAmount,
    discountReason,
    gst,
    vat,
  } = watch();

  const triggeredInputRef = useRef(null);

  const logTriggeredInput = (inputName: any) => {
    triggeredInputRef.current = inputName;
  };

  const { mutateAsync: printBill } = useMutation({
    mutationKey: ["print-bill"],
    mutationFn: (payload: BillPrintPayload) => generateBillReciept(payload),
    onSuccess: ({ data }) => {
      setRefetchUnsettledBillData(refetchUnsettledBillData + 1);
      handlePrintBillSuccess?.();
      form.reset();
      refetchKotsForTable();
      setName("");
      setTableNo("");
      //** */ parseInt Is used to solve the type error
      setValue("netAmount", "");
      setValue("foodDiscountPercentage", "");
      setValue("barDiscountPercentage", "");
      setValue("foodDiscountAmount", "");
      setValue("barDiscountAmount", "");
      setValue("subTotal", "");
      setValue("taxAmount", "");
      setValue("discount", "");
      selectedProductionform.setValue("modifier", "");
      setIsTable(true);
      setIsTableDetails(false);
      Platform.OS !== "web" && setShowBillTable && setShowBillTable(false);
      Toast.show({
        type: "success",
        text1: "Bill Printed Successfully",
      });
      setIsPrinting(false);
      return data;
    },
  });

  //** */ parseInt Is used to solve the type error
  useEffect(() => {
    if (!productsList?.length) {
      setValue("netAmount", "");
      setValue("foodDiscountPercentage", "");
      setValue("barDiscountPercentage", "");
      setValue("foodDiscountAmount", "");
      setValue("barDiscountAmount", "");
      setValue("subTotal", "");
      setValue("taxAmount", "");
      setValue("discount", "");
      form.reset();
      return;
    }
    let subTotal = 0,
      totalTax = 0;
    productsList.forEach((productItem: SelectedProduct) => {
      const totalProductValue =
        Number(productItem?.price) * productItem?.quantity;
      const productTaxValue =
        (totalProductValue * Number((productItem?.category as Category)?.tax)) /
        100;
      subTotal += totalProductValue;
      totalTax += productTaxValue;
    });
    if (subTotal) {
      const totalTaxValue = Number(totalTax?.toFixed(2));
      setValue("subTotal", `${Math.round(subTotal)}`);
      setValue("taxAmount", `${Math.round(totalTaxValue)}`);
      updateNetBillAmount(subTotal, totalTaxValue);
    }
  }, [productsList, foodDiscountPercentage, barDiscountPercentage]);

  const handleProductDiscount = (productItem: SelectedProduct, tax: number) => {
    const productDiscountValue = (Number(productItem?.price) * tax) / 100;
    return productDiscountValue * productItem?.quantity;
  };

  useEffect(() => {
    /**
     * For handling total discount and food/bar discount value
     */
    if (!foodDiscountPercentage) {
      setValue("foodDiscountAmount", "");
    }
    if (!barDiscountPercentage) {
      setValue("barDiscountAmount", "");
    }
    if (!foodDiscountPercentage && !barDiscountPercentage) {
      setValue("discount", "");
    }
  }, [foodDiscountPercentage, barDiscountPercentage, productsList]);

  /**
   * For Handling :
   *  Calculation for foodDiscountValue , barDiscountValue based on percentage values
   */

  const { foodDiscountValue = 0, barDiscountValue = 0 } = useMemo(() => {
    let foodDiscountValue = 0,
      barDiscountValue = 0;

    if (!productsList?.length) return { foodDiscountValue, barDiscountValue };
    productsList.forEach((productItem) => {
      const isCategoryFood = productItem?.category?.name === "food";
      if (isCategoryFood) {
        const discountValue = handleProductDiscount(
          productItem,
          Number(foodDiscountPercentage)
        );
        foodDiscountValue += discountValue;
      } else {
        const discountValue = handleProductDiscount(
          productItem,
          barDiscountPercentage as number
        );
        barDiscountValue += discountValue;
      }
    });

    return { foodDiscountValue, barDiscountValue };
  }, [foodDiscountPercentage, barDiscountPercentage]);

  useEffect(() => {
    let totalFoodAmount = 0;
    let totalBarAmount = 0;
    productsList?.map((item) => {
      if (item?.category?.name == "food") {
        totalFoodAmount += Number(item?.price);
      } else {
        totalBarAmount += Number(item?.price);
      }
    });
    setFoodListAmount(totalFoodAmount);
    setBarListAmount(totalBarAmount);
    if (barDiscountPercentage || foodDiscountPercentage) {
      const subTotalDiscount = Number(
        (foodDiscountValue + barDiscountValue).toFixed(2)
      );
      setValue("discount", `${subTotalDiscount}`);
      updateNetBillAmount(Number(subTotal), Number(taxAmount));
    }
    foodDiscountPercentage &&
      triggeredInputRef?.current == "foodPercentage" &&
      setValue(
        "foodDiscountAmount",
        `${parseInt(Number(foodDiscountValue).toString())}`
      );
    foodDiscountAmount &&
      triggeredInputRef?.current == "foodAmount" &&
      setValue(
        "foodDiscountPercentage",
        `${Math.round(
          (Number(foodDiscountAmount) / Number(totalFoodAmount)) * 100
        ).toString()}`
      );

    barDiscountPercentage &&
      triggeredInputRef?.current == "barPercentage" &&
      setValue("barDiscountAmount", `${Math.round(barDiscountValue)}`);

    barDiscountAmount &&
      triggeredInputRef?.current == "barAmount" &&
      setValue(
        "barDiscountPercentage",
        `${Math.round(
          (Number(barDiscountAmount) / Number(totalBarAmount)) * 100
        ).toString()}`
      );
  }, [
    barDiscountPercentage,
    foodDiscountPercentage,
    foodDiscountAmount,
    barDiscountAmount,
  ]);

  const isButtonDisable =
    productsList?.length <= 0 ||
    Object.keys(selectProductionFormErrors)?.length > 0;

  const errorNotExists = Object.keys(selectProductionFormErrors)?.length == 0;

  const handlePrint = (id: string) => {
    setIsPrinting(true);

    let payload: BillPrintPayload = {
      id,
      subTotal: Number(subTotal),
      netAmount: Number(netAmount),
      discount: Number(discount),
      discountReason,
      tax: Number(taxAmount),
      foodDiscount: (Number(foodDiscountAmount) || 0) as number,
      barDiscount: (Number(barDiscountAmount) || 0) as number,
      gst: gst || "",
      vat: vat || "",
    };

    return printBill(payload);
  };

  useEffect(() => {
    if (!selectedTable) {
      setValue("foodDiscountPercentage", "");
      setValue("barDiscountPercentage", "");
      setValue("foodDiscountAmount", "");
      setValue("barDiscountAmount", "");
      setValue("netAmount", "");
    }
  }, [selectedTable]);

  useEffect(() => {
    if (!subTotal) {
      setValue("netAmount", "");
    }
  }, [subTotal]);

  const updateNetBillAmount = (subTotal: number, totalTaxValue: number) => {
    const netBillAmountValue =
      (subTotal as number) -
      Number((Number(foodDiscountValue) || 0) + Number(barDiscountValue) || 0);
    const netAmount = Number((netBillAmountValue + totalTaxValue).toFixed(2));

    setValue("netAmount", `${Math.round(netAmount)}`);
  };

  useEffect(() => {
    if (newProductsList.length) {
      setValue("foodDiscountPercentage", "");
      setValue("barDiscountPercentage", "");
      setValue("foodDiscountAmount", "");
      setValue("barDiscountAmount", "");
      setValue("discount", "");
    }
  }, [newProductsList]);

  useEffect(() => {
    let foodTaxAmmount = 0;
    let barTaxAmmount = 0;
    if (productsList?.length) {
      productsList?.map((item) => {
        if (item?.category?.name === "food") {
          foodTaxAmmount =
            foodTaxAmmount +
            (Number(item?.price) *
              Number(item?.quantity) *
              Number(item?.category?.tax)) /
              100;
        } else {
          barTaxAmmount =
            barTaxAmmount +
            (Number(item?.price) *
              Number(item?.quantity) *
              Number(item?.category?.tax)) /
              100;
        }
      });
    }
    setValue("gst", `${foodTaxAmmount}`);
    setValue("vat", `${barTaxAmmount}`);
  }, [productsList]);

  return (
    <View className="min-h-[200px] flex w-full flex-row pt-4">
      <View className="flex w-1/2">
        <View className="flex w-full flex-row items-center justify-between">
          <ThemeText className="w-[40%] xl:w-[35%] font-semibold text-xs lg:text-sm">
            Food Dis:
          </ThemeText>
          <Pressable
            onPress={() => {
              setOpenDiscountModal(true);
              logTriggeredInput("foodPercentage");
            }}
            className="flex  w-[55%] xl:w-[60%] flex-row"
            disabled={isPrintBillButtonDisabled || isPrinting || !isFoodAdded}
          >
            <Controller
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <ThemeInput
                  value={value}
                  onBlur={onBlur}
                  onChangeText={(text) => {
                    const inputValue = text;
                    const sanitizedValue = inputValue.replace(/[+-]/g, "");

                    const numericValue = parseFloat(sanitizedValue);
                    const maxValue = 100;

                    if (!isNaN(numericValue) && numericValue > maxValue) {
                      text = maxValue.toString();
                    } else {
                      text = sanitizedValue;
                    }
                    onChange(text);
                  }}
                  className={`w-1/2 rounded-md border text-xs lg:text-sm font-regular px-2.5 py-2 outline-none ${
                    isPrintBillButtonDisabled || isPrinting || !isFoodAdded
                      ? "cursor-not-allowed"
                      : "focus:border-primary"
                  }`}
                  placeholderTextColor="gray"
                  placeholder="%"
                  editable={
                    !(isPrintBillButtonDisabled || isPrinting || !isFoodAdded)
                  }
                  onPress={() => {
                    logTriggeredInput("foodPercentage");
                    setOpenDiscountModal(true);
                  }}
                />
              )}
              name="foodDiscountPercentage"
            />

            <Controller
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <ThemeInput
                  value={value}
                  onBlur={onBlur}
                  onChangeText={(text) => {
                    const sanitizedValue = text.replace(/[^0-9\-+]/g, "");

                    const numericValue = parseInt(sanitizedValue, 10) || 0;
                    const cappedValue = Math.min(numericValue, foodListAmount);

                    onChange(cappedValue);
                  }}
                  className={`ml-2 w-1/2 rounded-md border text-xs lg:text-sm font-regular px-2.5 py-2 outline-none ${
                    isPrintBillButtonDisabled || isPrinting || !isFoodAdded
                      ? "cursor-not-allowed"
                      : "focus:border-primary"
                  }`}
                  placeholderTextColor="gray"
                  placeholder="Rs"
                  editable={
                    !(isPrintBillButtonDisabled || isPrinting || !isFoodAdded)
                  }
                  onPress={() => {
                    logTriggeredInput("foodPercentage");
                    setOpenDiscountModal(true);
                  }}
                />
              )}
              name="foodDiscountAmount"
            />
          </Pressable>
        </View>
        <View className="my-2 flex w-full flex-row items-center justify-between">
          <ThemeText className="w-[40%] xl:w-[35%] font-semibold text-xs lg:text-sm">
            Bar Dis:
          </ThemeText>
          <Pressable
            onPress={() => {
              setOpenDiscountModal(true);
              logTriggeredInput("barPercentage");
            }}
            className="flex  w-[55%] xl:w-[60%] flex-row"
            disabled={isPrintBillButtonDisabled || isPrinting}
          >
            <Controller
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <ThemeInput
                  onBlur={onBlur}
                  onChangeText={(text) => {
                    const inputValue = text;
                    const sanitizedValue = inputValue.replace(/[+-]/g, "");

                    const numericValue = parseFloat(sanitizedValue);
                    const maxValue = 100;

                    if (!isNaN(numericValue) && numericValue > maxValue) {
                      text = maxValue.toString();
                    } else {
                      text = sanitizedValue;
                    }

                    onChange(text);
                  }}
                  value={value}
                  className={`w-1/2 rounded-md border text-xs lg:text-sm font-regular px-2.5 py-2 outline-none ${
                    isPrintBillButtonDisabled || isPrinting
                      ? "cursor-not-allowed"
                      : "focus:border-primary"
                  }`}
                  placeholderTextColor="gray"
                  placeholder="%"
                  editable={!(isPrintBillButtonDisabled || isPrinting)}
                  onPress={() => {
                    logTriggeredInput("barPercentage");
                    setOpenDiscountModal(true);
                  }}
                />
              )}
              name="barDiscountPercentage"
            />
            <Controller
              control={control}
              render={({ field: { value, onBlur, onChange } }) => (
                <ThemeInput
                  value={value}
                  onBlur={onBlur}
                  onChangeText={(text) => {
                    const sanitizedValue = text.replace(/[^0-9\-+]/g, "");

                    const numericValue = parseInt(sanitizedValue, 10) || 0;
                    const cappedValue = Math.min(numericValue, barListAmount);

                    onChange(cappedValue);
                  }}
                  // {...field}
                  className={`ml-2 w-1/2 rounded-md border text-xs lg:text-sm font-regular px-2.5 py-2 outline-none ${
                    isPrintBillButtonDisabled || isPrinting
                      ? "cursor-not-allowed"
                      : "focus:border-primary"
                  }`}
                  placeholderTextColor="gray"
                  placeholder="Rs"
                  editable={!(isPrintBillButtonDisabled || isPrinting)}
                  onPress={() => {
                    logTriggeredInput("barPercentage");
                    setOpenDiscountModal(true);
                  }}
                />
              )}
              name="barDiscountAmount"
            />
          </Pressable>
        </View>
        <View className="mb-2 flex w-full flex-row items-center justify-between">
          <ThemeText className="w-[40%] xl:w-[35%] font-semibold text-xs lg:text-sm">
            Dis Reason:
          </ThemeText>
          <View className="flex  w-[55%] xl:w-[60%] flex-row">
            <Controller
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <ThemeInput
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  className={`w-full rounded-md border text-xs lg:text-sm font-regular px-2.5 py-2 outline-none ${
                    isPrintBillButtonDisabled || isPrinting
                      ? "cursor-not-allowed"
                      : "focus:border-primary"
                  }`}
                  placeholderTextColor="gray"
                  placeholder="Discount reason"
                  editable={!(isPrintBillButtonDisabled || isPrinting)}
                />
              )}
              name="discountReason"
            />
          </View>
        </View>
        <View className="flex flex-row w-full">
          <TouchableOpacity
            onPress={() => {
              inputStewardNoRef?.current?.textLength === 0 &&
                inputStewardNoRef.current.focus();
              handleBillAndKotInitiate();
            }}
            disabled={isKotButtonDisabled || isLoading}
            className={`mr-3 w-[48%] rounded-lg border-2 border-primary bg-primary px-2 py-2 text-center font-medium text-text-dark hover:text-primary ${
              isKotButtonDisabled || isLoading ? "opacity-60" : "opacity-100"
            }`}
          >
            {isLoading ? (
              <View className="flex-row justify-center items-center">
                <ActivityIndicator color="black" size={18} />
                <ThemeText className="text-center text-xs lg:text-sm font-semibold !text-text-dark ml-1 md:ml-2">
                  Print KOT
                </ThemeText>
              </View>
            ) : (
              <ThemeText className="text-center text-xs lg:text-sm font-semibold !text-text-dark">
                Print KOT
              </ThemeText>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            disabled={isPrintBillButtonDisabled || isPrinting}
            onPress={() => {
              handlePrint(billingId as string);
            }}
            className={`w-[48%] rounded-lg border-2 border-primary bg-primary px-2 py-2 text-center font-medium text-text-dark hover:text-primary ${
              isPrintBillButtonDisabled || isPrinting
                ? "opacity-60"
                : "opacity-100"
            }`}
          >
            {isPrinting ? (
              <View className="flex-row justify-center items-center">
                <ActivityIndicator color="black" size={18} />
                <ThemeText className="text-center text-xs lg:text-sm font-semibold !text-text-dark ml-2">
                  Print Bill
                </ThemeText>
              </View>
            ) : (
              <ThemeText className="text-center text-xs lg:text-sm font-semibold !text-text-dark">
                Print Bill
              </ThemeText>
            )}
          </TouchableOpacity>
        </View>
      </View>
      <View className="w-1/2 pl-5">
        <View className="mb-2 flex w-full flex-row items-center justify-between">
          <ThemeText className="w-[40%] xl:w-[35%] font-semibold text-xs lg:text-sm">
            Sub Total:
          </ThemeText>
          <View className="flex w-[55%] xl:w-[60%] flex-row">
            <Controller
              control={control}
              render={({ field }) => {
                return (
                  <ThemeInput
                    {...field}
                    readOnly={true}
                    className="w-full rounded-md border text-xs lg:text-sm px-2.5 py-2 outline-none focus:border-primary"
                    placeholderTextColor="gray"
                    placeholder="Sub Total"
                  />
                );
              }}
              name="subTotal"
            />
          </View>
        </View>
        <View className="mb-2 flex w-full flex-row items-center justify-between">
          <ThemeText className="w-[40%] xl:w-[35%] font-semibold text-xs lg:text-sm">
            Discount:
          </ThemeText>
          <View className="flex w-[55%] xl:w-[60%] flex-row">
            <Controller
              control={control}
              render={({ field }) => (
                <ThemeInput
                  {...field}
                  readOnly={true}
                  className="w-full rounded-md border text-xs lg:text-sm px-2.5 py-2 outline-none focus:border-primary"
                  placeholderTextColor="gray"
                  placeholder="Discount"
                />
              )}
              name="discount"
            />
          </View>
        </View>
        <View className="mb-2 flex w-full flex-row items-center justify-between">
          <ThemeText className="w-[40%] xl:w-[35%] font-semibold text-xs lg:text-sm">
            Gst + Vat:
          </ThemeText>
          <View className="flex w-[55%] xl:w-[60%] flex-row">
            <Controller
              control={control}
              render={({ field }) => (
                <ThemeInput
                  {...field}
                  readOnly={true}
                  className="w-full rounded-md border text-xs lg:text-sm px-2.5 py-2 outline-none focus:border-primary"
                  placeholderTextColor="gray"
                  placeholder="Gst + Vat"
                />
              )}
              name="taxAmount"
            />
          </View>
        </View>
        <View className="mb-2 flex w-full flex-row items-center justify-between">
          <ThemeText className="w-[40%] xl:w-[35%] font-semibold text-xs lg:text-sm">
            Net Amount:
          </ThemeText>
          <View className="flex w-[55%] xl:w-[60%] flex-row">
            <Controller
              control={control}
              render={({ field }) => (
                <ThemeInput
                  readOnly={true}
                  {...field}
                  className="w-full rounded-md border text-xs lg:text-sm px-2.5 py-2 outline-none focus:border-primary"
                  placeholderTextColor="gray"
                  placeholder="Net Amount"
                />
              )}
              name="netAmount"
            />
          </View>
        </View>
      </View>
      {/* Discount Password Modal */}
      {!isAuthenticate && (
        <DiscountModal
          openDiscountModal={openDiscountModal}
          setOpenDiscountModal={setOpenDiscountModal}
          setIsAuthenticate={setIsAuthenticate}
          theme={theme}
        />
      )}
    </View>
  );
}
