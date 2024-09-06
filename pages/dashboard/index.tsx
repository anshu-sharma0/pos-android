import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  Platform,
  ScrollView,
} from "react-native";
import { useMutation, useQuery } from "@tanstack/react-query";
import { fetchCategory, fetchTables } from "@/services/api";
import { createBilling, getBillingForTableCode } from "@/services/billing";
import { createKot, fetchAllKots } from "@/services/kot";
import {
  Category,
  Product,
  SelectedProduct,
  Subcategory,
  Table,
  billForTableCodeType,
  complimentaryBillType,
} from "@/types";
import { ITableItem } from "./type";
import Footer from "@/components/molecules/footer";
import Header from "@/components/molecules/header";
import Sidebar from "@/components/molecules/sidebar";
import TableCard from "@/components/molecules/cards/table-card";
import BackBtn from "@/components/atoms/back-btn";
import TabBarHeader from "@/components/molecules/tab-bar-header";
import CategoryCard from "@/components/molecules/cards/category-card";
import BillTable from "@/components/organisms/bill-table";
import BillForm from "@/components/organisms/bill-form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { SelectedProductFormInfoSchema } from "@/constants/home-form-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { createHost, fetchHostTable } from "@/services/host";
import SearchBar from "@/components/atoms/search-bar";
import { fetchProducts } from "@/services/products";
import Modal from "@/components/organisms/modal";
import KotCancelTable from "@/components/organisms/kot-cancel-table";
import { ThemeInput, ThemeSafeAreaView, ThemeText } from "@/custom-elements";
import { useTheme } from "@/hooks/useTheme";
import StewardNumberForm from "@/components/organisms/steward-number-form";
import { BaseButton } from "@/components/atoms/base-button";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Dashboard = () => {
  const { theme } = useTheme();
  const inputStewardNoRef = useRef(null);
  const [openSidebar, setOpenSidebar] = useState(false);
  const [isTable, setIsTable] = useState(true);
  const [isTableDetails, setIsTableDetails] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedTypeData, setSelectedTypeData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [tableData, setTableData] = useState<ITableItem[]>([]);
  const [selectedSubCategory, setSelectedSubCategory] =
    useState<Subcategory | null>(null);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [productsList, setProductsList] = useState<SelectedProduct[]>([]);
  const [selectedProduct, setSelectedProduct] =
    useState<SelectedProduct | null>(null);
  const [showBillTable, setShowBillTable] = useState(false);
  const [customerId, setCustomerId] = useState<string>("");
  const [refetchUnsettledBillData, setRefetchUnsettledBillData] =
    useState<number>(1);
  const [userId, setUserId] = useState("");
  const [refetchComplimentData, setRefetchComplimentData] = useState(1);
  const [tableNumber, setTableNumber] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [stewardNoError, setStewardNoError] = useState(false);

  const fetchTableData = () => {
    fetchTables()
      .then((res) => {
        const sortedData = res?.data.sort(
          (a: Table, b: Table) => Number(a.code) - Number(b.code)
        );
        setTableData(sortedData);
      })
      .catch((err) => {
        console.log(err, "err");
      });
  };

  const fetchCategoryData = () => {
    fetchCategory()
      .then((res) => {
        setCategoryData(res);
      })
      .catch((err) => {
        console.log(err, "err");
      });
  };

  useEffect(() => {
    fetchTableData();
    selectedProductFormRef.setValue("stewardNo", "");
  }, [isTable]);

  const handleQuantityUpdate = (
    selectedProduct: SelectedProduct,
    action: number
  ) => {
    const list = [...productsList];

    const targetIndex = productsList?.findIndex(
      (product) => selectedProduct?.id == product?.id
    );

    const quantity = selectedProduct?.quantity + action;

    if (targetIndex > -1) {
      list.splice(targetIndex, 1, { ...selectedProduct, quantity });
      setProductsList(list);
    }
  };

  const onCardClick = (info: Product) => {
    if (productsList.length) {
      const sameProduct = productsList.filter((item) => item.id === info.id);
      if (!sameProduct.length) {
        setProductsList((prev) => [
          { ...(info as Product), quantity: 1 },
          ...prev,
        ]);
      } else {
        handleQuantityUpdate(sameProduct[0], 1);
      }
    } else {
      setProductsList([{ ...(info as Product), quantity: 1 }]);
    }
  };

  const footerData = [
    { title: "Void Kot" },
    { title: "Complimentary" },
    { title: "Settlement" },
    { title: "Void Bill" },
    { title: "View Sale" },
    { title: "Shift Table" },
    { title: "Shift Item" },
  ];

  const tableCode: string = (selectedTable as Table | undefined)?.code || "";

  const { data: billForTableCode, refetch: refetchBillInfo } = useQuery({
    queryKey: ["billing-table-code", tableCode],
    queryFn: (): Promise<billForTableCodeType> =>
      getBillingForTableCode(tableCode),
    enabled: !!selectedTable?.code,
    retry: 0,
  });

  const billProductsForTable = useMemo(() => {
    let list: SelectedProduct[] = [];
    if (billForTableCode?.id) {
      list = billForTableCode.products.map(
        (data: complimentaryBillType | any) => {
          return {
            ...data.product,
            productId: data.productId,
            quantity: data?.quantity,
            isEditable: false,
            modifier: data?.modifier,
          };
        }
      );
    }
    return list;
  }, [billForTableCode]);

  const filteredProductList = useMemo(
    () => [...billProductsForTable, ...productsList],
    [productsList, billProductsForTable]
  );

  const isKotButtonDisabled = !Boolean(productsList?.length);
  const isPrintBillButtonDisabled = !Boolean(billProductsForTable?.length);

  const {
    data: kotsForTable,
    isFetching,
    refetch: refetchKotsForTable,
  }: any = useQuery({
    queryKey: ["all-kot"],
    queryFn: fetchAllKots,
    retry: 0,
  });

  const selectedProductFormRef = useForm<
    z.infer<typeof SelectedProductFormInfoSchema>
  >({
    mode: "all",
    resolver: zodResolver(SelectedProductFormInfoSchema),
    defaultValues: {
      name: "",
      mobileNo: "",
      tableNo: "",
      stewardNo: "",
      modifier: "",
      search: "",
    },
  });

  const { mutateAsync: createEntry } = useMutation({
    mutationKey: ["create-Entry"],
    mutationFn: createHost,
    onSuccess: (data) => {
      return data;
    },
  });

  const getUserId = async () => {
    const id = await AsyncStorage.getItem("userId");
    if (id) {
      setUserId(id);
    }
  };

  useEffect(() => {
    if (Platform.OS === "web") {
      const id = localStorage.getItem("userId");
      if (id) {
        setUserId(id);
      }
    } else {
      getUserId();
    }
  }, []);

  const initiateBill = useMutation({
    mutationFn: createBilling,
    onSuccess(data) {
      if (data.data === "") {
        setStewardNoError(false);
      }
      if (data?.data.message) {
        setStewardNoError(true);
        Toast.show({
          type: "error",
          text1: "Please enter correct steward number.",
        });
      }
    },
  });

  const kotApi = useMutation({
    mutationFn: createKot,
    onSuccess: ({ data }) => {
      if (data?.success) {
        Toast.show({
          type: "success",
          text1: data?.message,
        });

        setRefetchComplimentData(refetchComplimentData + 1);
        refetchBillInfo();
        refetchKotsForTable();
        setProductsList([]);
      } else {
        Toast.show({
          type: "error",
          text1: data?.message,
        });
      }
    },
  });

  const handleBillAndKotInitiate = async () => {
    let hasBillingData = null;
    try {
      const formValues = selectedProductFormRef.getValues();

      if (formValues?.stewardNo === "") {
        return Toast.show({
          type: "error",
          text1: "Please enter steward number.",
        });
      }

      const ongoingBillId = billForTableCode?.id;

      if (!ongoingBillId) {
        const payload = {
          phone: formValues?.mobileNo as string,
          name: formValues?.name as string,
          status: false,
          tableCode: formValues?.tableNo as string,
        };
        const entryResponse = await createEntry(payload as any);
        const entryId = await entryResponse?.data?.id;
        const createBillPayload = {
          customerId: entryId,
          name: formValues?.name,
          phone: formValues?.mobileNo as string,
          tableId: selectedTable?.id as string,
          stewardNo: formValues?.stewardNo as string,
          userId,
        };

        hasBillingData = await initiateBill.mutateAsync(createBillPayload);
      }

      if (ongoingBillId || hasBillingData?.data?.id) {
        const kotItemList = productsList?.map((product) => ({
          quantity: product?.quantity,
          productId: product?.id,
          modifier: product.modifier,
        }));

        const createKotPayload = {
          kotData: kotItemList,
          billingId: billForTableCode?.id || hasBillingData?.data?.id,
          tableId: selectedTable?.id as string,
          stewardNo: formValues?.stewardNo,
          userId,
        };

        await kotApi.mutateAsync(createKotPayload);

        selectedProductFormRef.setValue("modifier", "");
      }
    } catch (error: unknown) {
      Toast.show({
        type: "error",
        text1: (error as any)?.response?.statusText || "Something went wrong.",
      });
    }
  };

  const handleResetSelectedProductForm = () => {
    selectedProductFormRef.setValue("name", "");
    selectedProductFormRef.setValue("mobileNo", "");
    selectedProductFormRef.setValue("stewardNo", "");
  };

  const handlePrintBillSuccess = () => {
    handleResetSelectedProductForm();
    setSelectedTable(null);
    setProductsList([]);
  };

  const [search, setSearch] = useState<string>("");

  const { data: productsData } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  const handleProductsSearch = (search: string) => {
    const filteredProducts = productsData?.data.filter((product: Product) => {
      const productName = product?.name?.toLowerCase();
      return productName?.includes(search.toLowerCase());
    });
    return filteredProducts;
  };

  const searchedValues = useMemo(() => {
    return handleProductsSearch(search);
  }, [search]);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const formInfo: any = {
    billForTableCode,
    selectedTable,
    selectedCategory,
    selectedSubCategory,
    selectedProduct,
  };
  const { data: hostForTableCode, refetch: refetchhost } = useQuery({
    queryKey: ["host-table-code", selectedTable?.code],
    queryFn: (): Promise<any> => fetchHostTable(selectedTable?.code as string),
    enabled: !!selectedTable,
    retry: 0,
  });

  const handleProductListModifier = useCallback(
    (modifier: string) => {
      const newProductList = [...productsList].map(
        (product: SelectedProduct) => {
          if (product.id === selectedProduct?.id) {
            product.modifier = modifier;
          }
          return product;
        }
      );
      setProductsList(newProductList);
    },
    [productsList, selectedProduct]
  );

  const selectedItemModifier = useMemo(() => {
    return productsList.find((item) => item.id == selectedProduct?.id);
  }, [productsList, selectedProduct]);

  return (
    <ThemeSafeAreaView
      style={{
        flex: Platform.OS !== "web" ? 0 : 1,
      }}
      className="relative min-h-screen w-full"
    >
      <Header
        setOpenSidebar={setOpenSidebar}
        openSidebar={openSidebar}
        tableNumber={tableNumber}
      />
      <View className="flex min-h-[calc(100vh-64px)] overflow-hidden w-full flex-col sm:mt-16 sm:flex-row">
        <Sidebar
          setOpenSidebar={setOpenSidebar}
          openSidebar={openSidebar}
          theme={theme}
        />
        {Platform.OS !== "web" && isTableDetails ? (
          <View className="relative h-[82vh] flex items-center w-full">
            {isTableDetails && (
              <ScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                nestedScrollEnabled
              >
                {showBillTable ? (
                  <View className="flex w-full items-center px-5">
                    <View className="mt-5 w-full">
                      <View className="h-10">
                        <SearchBar
                          search={search}
                          setSearch={setSearch}
                          searchResult={searchedValues}
                          setSelectedProduct={setSelectedProduct}
                          selectedTable={selectedTable}
                          productsList={productsList}
                          showSuggestions={true}
                          theme={theme}
                        />
                      </View>
                      <StewardNumberForm
                        hostForTableCode={hostForTableCode}
                        setCustomerId={setCustomerId}
                        handleProductListModifier={handleProductListModifier}
                        productsList={productsList}
                        selectedProductFormRef={selectedProductFormRef}
                        formInfo={formInfo}
                        setSelectedProduct={setSelectedProduct}
                        setProductsList={setProductsList}
                        selectedItemModifier={selectedItemModifier}
                        inputStewardNoRef={inputStewardNoRef}
                        stewardNoError={stewardNoError}
                        setStewardNoError={setStewardNoError}
                      />
                    </View>

                    <BillTable
                      refetchBillInfo={refetchBillInfo}
                      productsList={productsList}
                      billProductsForTable={billProductsForTable}
                      setProductsList={setProductsList}
                      selectedProduct={selectedProduct}
                      setSelectedProduct={setSelectedProduct}
                      theme={theme}
                    />

                    <BillForm
                      newProductsList={productsList}
                      customerId={customerId}
                      refetchKotsForTable={refetchKotsForTable}
                      refetchUnsettledBillData={refetchUnsettledBillData}
                      setRefetchUnsettledBillData={setRefetchUnsettledBillData}
                      billingId={billForTableCode?.id}
                      selectedProductFormRef={selectedProductFormRef}
                      productsList={filteredProductList}
                      handleBillAndKotInitiate={handleBillAndKotInitiate}
                      handlePrintBillSuccess={handlePrintBillSuccess}
                      isKotButtonDisabled={isKotButtonDisabled}
                      isPrintBillButtonDisabled={isPrintBillButtonDisabled}
                      isLoading={kotApi?.isPending}
                      selectedTable={selectedTable}
                      theme={theme}
                      inputStewardNoRef={inputStewardNoRef}
                      setIsTable={setIsTable}
                      setIsTableDetails={setIsTableDetails}
                      setShowBillTable={setShowBillTable}
                    />
                  </View>
                ) : (
                  <View className="relative flex h-[calc(100vh-64px)] items-center px-5 pt-5">
                    <BackBtn
                      onPress={() => {
                        if (selectedTypeData.length) {
                          setSelectedTypeData([]);
                        } else {
                          setIsTable(true);
                          setIsTableDetails(false);
                          setProductsList([]);
                        }
                      }}
                    />
                    <TabBarHeader
                      data={categoryData}
                      activeTab={activeTab}
                      setActiveTab={setActiveTab}
                      setSelectedTypeData={setSelectedTypeData}
                      theme={theme}
                    />
                    <ScrollView
                      showsVerticalScrollIndicator={false}
                      className={`mt-5 w-full overflow-y-auto h-[70vh]`}
                    >
                      {categoryData.map((_, index) => (
                        <View
                          key={index}
                          className="flex w-full flex-row flex-wrap justify-center"
                        >
                          {activeTab === index &&
                            categoryData[index]?.subcategory.map(
                              (category: any) => {
                                return (
                                  !selectedTypeData.length && (
                                    <CategoryCard
                                      key={category?.id}
                                      onPress={() => {
                                        if (
                                          category?.products.length &&
                                          selectedTypeData
                                        ) {
                                          setSelectedTypeData(
                                            category?.products
                                          );
                                        }
                                      }}
                                      name={category?.name}
                                      theme={theme}
                                    />
                                  )
                                );
                              }
                            )}
                        </View>
                      ))}

                      {/* Sub Categories */}
                      <View className="flex w-full flex-row flex-wrap justify-center">
                        {selectedTypeData.length
                          ? selectedTypeData?.map((item) => (
                              <CategoryCard
                                key={item?.id}
                                onPress={() => onCardClick(item)}
                                name={item?.name}
                                theme={theme}
                              />
                            ))
                          : null}
                      </View>
                    </ScrollView>
                  </View>
                )}
              </ScrollView>
            )}

            {/* Footer bill details */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexDirection: "row",
                paddingRight: 220,
              }}
              className={`absolute flex -bottom-[10vh] right-0 z-[100] h-16 w-full px-2 shadow-sm ${
                theme === "dark"
                  ? "bg-background-table-card-dark"
                  : "bg-background-footer"
              }`}
            >
              {footerData.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  className="mx-1.5 w-full min-w-[120px] max-w-[145px] rounded-lg border-2 border-primary bg-primary px-1 py-2 text-center font-medium text-text-dark hover:text-primary "
                >
                  <Text className="text-center text-sm font-semibold md:text-base">
                    {item.title}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                onPress={() => setShowBillTable(!showBillTable)}
                className={`mx-1.5 w-full min-w-[120px] max-w-[145px] rounded-lg border-2 px-1 py-2 text-center font-medium text-text-dark hover:text-primary ${
                  showBillTable
                    ? theme === "dark"
                      ? "border-primary bg-background-dark"
                      : "border-primary bg-background"
                    : "border-primary bg-primary"
                }`}
              >
                <Text
                  className={`text-center text-sm font-semibold md:text-base ${
                    showBillTable
                      ? theme === "dark"
                        ? "text-text"
                        : "text-text-dark"
                      : "text-text-dark"
                  }`}
                >
                  Bill
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        ) : null}
        <View
          className={`flex-grow overflow-hidden xl:pl-[100px] ${
            isTable ? "pt-0 h-[83vh] md:h-[85vh] md:pt-5" : ""
          }`}
        >
          <ScrollView
            className={`h-[80vh] w-full overflow-y-auto ${
              theme === "dark" ? "bg-background-dark" : "bg-background"
            }`}
            showsVerticalScrollIndicator
          >
            <View
              className={`w-screen xl:w-[calc(100vw-100px)] overflow-hidden ${
                isTable ? "xl:pr-[20px]" : "flex flex-row"
              }`}
            >
              {isTable && (
                <View className="flex flex-row flex-wrap justify-center">
                  {tableData.length ? (
                    tableData?.map((item) => (
                      <TableCard
                        key={item?.id}
                        data={item}
                        onPress={() => {
                          if (!item?.isBillPrinted) {
                            fetchCategoryData();
                            setActiveTab(0);
                            setIsTable(false);
                            setIsTableDetails(true);
                            setTableNumber(item?.code);
                            setSelectedTable(item);
                          }
                        }}
                        theme={theme}
                      />
                    ))
                  ) : (
                    <ThemeText>No table data</ThemeText>
                  )}
                </View>
              )}

              {isTableDetails && Platform.OS === "web" && (
                <View className="flex w-full flex-row">
                  <View
                    className={`relative flex h-[calc(100vh-64px)] md:w-[40%] xl:w-[55%] 2xl:w-[65%] items-center border-r px-5 pt-5 ${
                      theme === "dark" ? "border-border-dark" : "border-border"
                    }`}
                  >
                    <BackBtn
                      onPress={() => {
                        if (selectedTypeData.length) {
                          setSelectedTypeData([]);
                        } else {
                          setIsTable(true);
                          setTableNumber("");
                          setIsTableDetails(false);
                          setProductsList([]);
                        }
                      }}
                    />
                    <TabBarHeader
                      data={categoryData}
                      activeTab={activeTab}
                      setActiveTab={setActiveTab}
                      setSelectedTypeData={setSelectedTypeData}
                      theme={theme}
                    />
                    <View className={`mt-5 w-full overflow-y-auto h-[75vh]`}>
                      {categoryData.map((_, index) => (
                        <View
                          key={index}
                          className="flex w-full flex-row flex-wrap justify-center"
                        >
                          {activeTab === index &&
                            categoryData[index]?.subcategory.map(
                              (category: any) => {
                                return (
                                  !selectedTypeData.length && (
                                    <CategoryCard
                                      key={category?.id}
                                      onPress={() => {
                                        if (
                                          category?.products.length &&
                                          setSelectedTypeData
                                        ) {
                                          setSelectedTypeData(
                                            category?.products
                                          );
                                        }
                                      }}
                                      name={category?.name}
                                      theme={theme}
                                    />
                                  )
                                );
                              }
                            )}
                        </View>
                      ))}

                      {/* Sub Categories */}
                      <View className="flex w-full flex-row flex-wrap justify-center">
                        {selectedTypeData.length
                          ? selectedTypeData?.map((item) => (
                              <CategoryCard
                                key={item?.id}
                                onPress={() => onCardClick(item)}
                                name={item?.name}
                                theme={theme}
                              />
                            ))
                          : null}
                      </View>
                    </View>

                    {/* Table Details Footer */}
                    <View
                      className={`absolute hidden md:flex bottom-0 z-[100] h-16 w-full flex-row items-center justify-between overflow-x-auto px-2 shadow-sm md:px-4 md:pr-2 xl:px-4 ${
                        theme === "dark"
                          ? "bg-background-table-card-dark"
                          : "bg-background-footer"
                      }`}
                    >
                      {footerData.map((item, index) => (
                        <TouchableOpacity
                          key={index}
                          className={`mx-1.5 w-full min-w-[120px] max-w-[145px] rounded-lg border-2 border-primary bg-primary px-1 py-2 text-center font-medium hover:text-primary ${
                            theme === "dark"
                              ? "hover:bg-background-hover"
                              : "hover:bg-background"
                          }`}
                        >
                          <span className="text-sm xl:text-base font-semibold">
                            {item.title}
                          </span>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View className="h-[calc(100vh-64px)] overflow-y-auto w-[60%] xl:w-[45%] 2xl:w-[35%]">
                    <View className="relative hidden md:flex w-full items-center px-5">
                      <View className="mt-5 w-full z-[400]">
                        <SearchBar
                          search={search}
                          setSearch={setSearch}
                          searchResult={searchedValues}
                          setSelectedProduct={setSelectedProduct}
                          selectedTable={selectedTable}
                          productsList={productsList}
                          showSuggestions={true}
                          theme={theme}
                        />
                        <StewardNumberForm
                          hostForTableCode={hostForTableCode}
                          setCustomerId={setCustomerId}
                          handleProductListModifier={handleProductListModifier}
                          productsList={productsList}
                          selectedProductFormRef={selectedProductFormRef}
                          formInfo={formInfo}
                          setSelectedProduct={setSelectedProduct}
                          setProductsList={setProductsList}
                          selectedItemModifier={selectedItemModifier}
                          inputStewardNoRef={inputStewardNoRef}
                          stewardNoError={stewardNoError}
                          setStewardNoError={setStewardNoError}
                        />
                      </View>

                      <BillTable
                        refetchBillInfo={refetchBillInfo}
                        productsList={productsList}
                        billProductsForTable={billProductsForTable}
                        setProductsList={setProductsList}
                        selectedProduct={selectedProduct}
                        setSelectedProduct={setSelectedProduct}
                        theme={theme}
                      />

                      <View>
                        <BillForm
                          newProductsList={productsList}
                          customerId={customerId}
                          refetchKotsForTable={refetchKotsForTable}
                          refetchUnsettledBillData={refetchUnsettledBillData}
                          setRefetchUnsettledBillData={
                            setRefetchUnsettledBillData
                          }
                          billingId={billForTableCode?.id}
                          selectedProductFormRef={selectedProductFormRef}
                          productsList={filteredProductList}
                          handleBillAndKotInitiate={handleBillAndKotInitiate}
                          handlePrintBillSuccess={handlePrintBillSuccess}
                          isKotButtonDisabled={isKotButtonDisabled}
                          isPrintBillButtonDisabled={isPrintBillButtonDisabled}
                          isLoading={kotApi?.isPending}
                          selectedTable={selectedTable}
                          theme={theme}
                          inputStewardNoRef={inputStewardNoRef}
                          setIsTable={setIsTable}
                          setIsTableDetails={setIsTableDetails}
                        />
                      </View>
                    </View>
                  </View>
                </View>
              )}
            </View>
          </ScrollView>
        </View>
        {isTable && <Footer voidKot={openModal} theme={theme} />}
      </View>
      {/* Cancel kot Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        theme={theme}
        style="max-h-[90vh] w-[80vw] xl:w-[65vw] 2xl:w-[55vw]"
        title="Cancel Kot"
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          className="w-full h-[80vh] md:h-fit"
        >
          <View
            className={`flex w-full flex-col rounded-lg border p-5 ${
              theme === "dark" ? "border-border-dark" : "border-border"
            }`}
          >
            <View className="flex w-full overflow-hidden md:flex-row md:items-center justify-between">
              <View className="flex md:w-[40%] md:flex-row md:items-center md:justify-center">
                <View>
                  <ThemeText className="mr-2 font-semibold mb-1 md:mb-0">
                    Select Table:
                  </ThemeText>
                </View>
                <ThemeInput
                  // onBlur={onBlur}
                  // onChangeText={onChange}
                  // value={value}
                  className="w-full rounded-md border px-2 py-1 md:px-2.5 md:py-2.5 outline-none focus:border-orange-400"
                  placeholderTextColor="gray"
                  placeholder="Enter mobile number"
                />
              </View>
              <View className="flex md:flex-row md:items-center justify-center md:ml-5 mt-2 md:mt-0">
                <View className="flex md:flex-row md:items-center justify-center">
                  <ThemeText className="mr-2 font-semibold mb-1 md:mb-0">
                    Item Name:
                  </ThemeText>
                  <ThemeInput
                    // onBlur={onBlur}
                    // onChangeText={onChange}
                    // value={value}
                    className="rounded-md border px-2 py-1 md:px-2.5 md:py-2.5 outline-none focus:border-orange-400"
                    placeholderTextColor="gray"
                    placeholder="Enter Item name"
                  />
                </View>
                <View className="flex md:flex-row md:items-center justify-center md:ml-5 mt-2 md:mt-0">
                  <ThemeText className="mr-2 font-semibold mb-1 md:mb-0">
                    Qty:
                  </ThemeText>
                  <ThemeInput
                    // onBlur={onBlur}
                    // onChangeText={onChange}
                    // value={value}
                    className="rounded-md border px-2 py-1 md:px-2.5 md:py-2.5 outline-none focus:border-orange-400"
                    placeholderTextColor="gray"
                    placeholder="Select Qty"
                  />
                </View>
              </View>
            </View>
            <View className="mt-2 md:mt-5 flex w-full md:flex-row md:items-center justify-center md:justify-between">
              <View className="flex md:w-[40%] md:flex-row md:items-center justify-center">
                <View>
                  <ThemeText className="mr-2 font-semibold mb-1 md:mb-0">
                    Canceled By:
                  </ThemeText>
                </View>
                <ThemeInput
                  // onBlur={onBlur}
                  // onChangeText={onChange}
                  // value={value}
                  className="w-full rounded-md border px-2 py-1 md:px-2.5 md:py-2.5 outline-none focus:border-orange-400"
                  placeholderTextColor="gray"
                  placeholder="Enter Canceled by"
                />
              </View>
              <View className="flex md:w-[57%] md:flex-row md:items-center justify-center mt-2 md:mt-0">
                <View>
                  <ThemeText className="mr-2 font-semibold mb-1 md:mb-0">
                    Type Reason:
                  </ThemeText>
                </View>
                <ThemeInput
                  // onBlur={onBlur}
                  // onChangeText={onChange}
                  // value={value}
                  className="w-full rounded-md border px-2 py-1 md:px-2.5 md:py-2.5 outline-none focus:border-orange-400"
                  placeholderTextColor="gray"
                  placeholder="Enter Type reason"
                />
              </View>
            </View>
          </View>
          <KotCancelTable
            refetchBillInfo={refetchBillInfo}
            productsList={productsList}
            billProductsForTable={billProductsForTable}
            setProductsList={setProductsList}
            selectedProduct={selectedProduct}
            setSelectedProduct={setSelectedProduct}
            theme={theme}
          />
          <BaseButton
            title="Cancel Kot"
            theme={theme}
            onPress={() => {}}
            style="w-fit ml-auto !px-10 !py-2 mt-4 !mb-5 md:!mb-0"
          />
        </ScrollView>
      </Modal>
    </ThemeSafeAreaView>
  );
};

export default Dashboard;
