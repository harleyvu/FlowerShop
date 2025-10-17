import { Tabs } from 'expo-router';
import React from 'react';
import { Image, StyleSheet } from 'react-native';

// ============ ĐƯỜNG DẪN ĐẾN CÁC ICON CỦA BẠN ============
// Hãy thay thế các đường dẫn require() này bằng đường dẫn chính xác đến file PNG của bạn.
// Tôi giả định bạn đặt chúng trong thư mục src/assets/icons/
const ICONS = {
  home: require('../../assets/home.png'),
  shop: require('../../assets/shop.png'),
  favorites: require('../../assets/favorites.png'),
  cart: require('../../assets/cart.png'),
  account: require('../../assets/account.png'),
};

// Component Icon tùy chỉnh để có thể thay đổi màu sắc
const TabBarIcon = ({ name, focused }: { name: keyof typeof ICONS; focused: boolean }) => {
  return (
    <Image
      source={ICONS[name]}
      style={[styles.icon, { tintColor: focused ? '#27c16b' : '#6b8f80' }]}
    />
  );
};

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false, // Ẩn header mặc định của tab
        tabBarShowLabel: true, // Hiện tên của tab
        tabBarActiveTintColor: '#27c16b', // Màu chữ của tab đang được chọn
        tabBarInactiveTintColor: '#6b8f80', // Màu chữ của tab không được chọn
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e6eee9',
          height: 60, // Tăng chiều cao để có không gian
          paddingBottom: 5, // Padding cho chữ bên dưới icon
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => <TabBarIcon name="home" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          title: 'Shop',
          tabBarIcon: ({ focused }) => <TabBarIcon name="shop" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favorites',
          tabBarIcon: ({ focused }) => <TabBarIcon name="favorites" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          tabBarIcon: ({ focused }) => <TabBarIcon name="cart" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
          tabBarIcon: ({ focused }) => <TabBarIcon name="account" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  icon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
});