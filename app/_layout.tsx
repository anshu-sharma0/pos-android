import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "react-native-reanimated";
import "../global.css";
import {
  useFonts,
  Poppins_100Thin,
  Poppins_100Thin_Italic,
  Poppins_200ExtraLight,
  Poppins_200ExtraLight_Italic,
  Poppins_300Light,
  Poppins_300Light_Italic,
  Poppins_400Regular,
  Poppins_400Regular_Italic,
  Poppins_500Medium,
  Poppins_500Medium_Italic,
  Poppins_600SemiBold,
  Poppins_600SemiBold_Italic,
  Poppins_700Bold,
  Poppins_700Bold_Italic,
  Poppins_800ExtraBold,
  Poppins_800ExtraBold_Italic,
  Poppins_900Black,
  Poppins_900Black_Italic,
} from "@expo-google-fonts/poppins";
import { MyContext } from "@/context/context";
import { useState } from "react";
import { ThemeProvider } from "@/context/theme-context";
import Toast, { BaseToast } from "react-native-toast-message";

const toastConfig = {
  success: (props: any) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: "#4b5563", backgroundColor: "#4b5563" }}
      contentContainerStyle={{
        paddingHorizontal: 15,
        backgroundColor: "#4b5563",
        borderRadius: 10,
      }}
      text1Style={{
        fontSize: 15,
        fontWeight: "700",
        color: "#fff",
      }}
      text2Style={{
        fontSize: 12,
        color: "#fff",
      }}
    />
  ),
  error: (props: any) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: "#770605", backgroundColor: "#770605" }}
      contentContainerStyle={{
        paddingHorizontal: 18,
        backgroundColor: "#770605",
        borderRadius: 10,
      }}
      text1Style={{
        fontSize: 15,
        fontWeight: "700",
        color: "#fff",
      }}
      text2Style={{
        fontSize: 12,
        color: "#fff",
      }}
    />
  ),
};

export default function RootLayout() {
  const [name, setName] = useState("");
  const [tableNo, setTableNo] = useState("");

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
      },
    },
  });

  let [fontsLoaded] = useFonts({
    Poppins_100Thin,
    Poppins_100Thin_Italic,
    Poppins_200ExtraLight,
    Poppins_200ExtraLight_Italic,
    Poppins_300Light,
    Poppins_300Light_Italic,
    Poppins_400Regular,
    Poppins_400Regular_Italic,
    Poppins_500Medium,
    Poppins_500Medium_Italic,
    Poppins_600SemiBold,
    Poppins_600SemiBold_Italic,
    Poppins_700Bold,
    Poppins_700Bold_Italic,
    Poppins_800ExtraBold,
    Poppins_800ExtraBold_Italic,
    Poppins_900Black,
    Poppins_900Black_Italic,
  });

  if (!fontsLoaded) {
    return null; // or a loading screen
  }

  return (
    <ThemeProvider>
      <MyContext.Provider value={{ name, setName, tableNo, setTableNo }}>
        <QueryClientProvider client={queryClient}>
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen
              name="dashboard/index"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="master/index"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="report/index"
              options={{ headerShown: false }}
            />
            <Stack.Screen name="host/index" options={{ headerShown: false }} />
            <Stack.Screen
              name="master/stock-master/index"
              options={{ headerShown: false }}
            />
          </Stack>
        </QueryClientProvider>
      </MyContext.Provider>
      <Toast visibilityTime={1000} config={toastConfig} />
    </ThemeProvider>
  );
}
