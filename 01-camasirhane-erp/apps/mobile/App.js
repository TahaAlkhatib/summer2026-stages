import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";

import HomeScreen from "./src/screens/HomeScreen";
import LoginScreen from "./src/screens/LoginScreen";
import CourierTasksScreen from "./src/screens/CourierTasksScreen";
import TaskDetailScreen from "./src/screens/TaskDetailScreen";
import TrackOrderScreen from "./src/screens/TrackOrderScreen";

import { RENKLER } from "./src/stil";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: RENKLER.ana },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "bold" },
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Login" component={LoginScreen} options={{ title: "Kurye Girişi" }} />
        <Stack.Screen
          name="CourierTasks"
          component={CourierTasksScreen}
          options={{ title: "Görevlerim", headerBackVisible: false }}
        />
        <Stack.Screen name="TaskDetail" component={TaskDetailScreen} options={{ title: "Görev Detayı" }} />
        <Stack.Screen name="TrackOrder" component={TrackOrderScreen} options={{ title: "Sipariş Takibi" }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
