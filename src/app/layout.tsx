import { Slot, Stack } from "expo-router";
import { View, Text } from "react-native";

const RootLayout = () => {
    return (
        <Stack>
           <Stack.Screen name="index"
            options={{headerShown: false}} 
            />

            <Stack.Screen name="product"
            options={{headerTitle: "San pham"}} 
            />

            <Stack.Screen name="index"
            options={{headerTitle: "Welcome"}} 
            />
        </Stack>
    );
};

export default RootLayout;
