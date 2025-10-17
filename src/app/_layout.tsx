import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

// Giữ màn hình chờ (splash screen) hiển thị, không để nó tự ẩn
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // Tải font chữ cho toàn bộ ứng dụng ở đây
  const [fontsLoaded, fontError] = useFonts({
    // THAY ĐỔI: Đổi tên key cho khớp với tên sử dụng trong style
    "Pacifico-Regular": require("../assets/fonts/Pacifico-Regular.ttf"),
  });

  useEffect(() => {
    // Khi font đã tải xong (hoặc có lỗi), hãy ẩn màn hình chờ đi
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Nếu font chưa tải xong, không render gì cả để tránh lỗi
  if (!fontsLoaded && !fontError) {
    return null;
  }

  // Khi font đã sẵn sàng, hiển thị ứng dụng
  return <Stack screenOptions={{ headerShown: false }} />;
}
