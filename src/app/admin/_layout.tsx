import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function AdminLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: "#27c16b" },
        headerTintColor: "#fff",
        tabBarActiveTintColor: "#27c16b",
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="speedometer" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="delivery"
        options={{
          title: "Delivery",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bicycle" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="flower"
        options={{
          title: "Flowers",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="flower" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="order"
        options={{
          title: "Orders",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="receipt" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="payment"
        options={{
          title: "Payments",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="card" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
