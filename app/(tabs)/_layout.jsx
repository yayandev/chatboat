import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Redirect, Tabs } from "expo-router";
import Colors from "../../constants/Colors";
import HeaderTabs from "../../components/HeaderTabs";
import { useAuth } from "../../context/authContext";

export default function TabLayout() {
  const { user, isAuthenticated } = useAuth();

  if (!user && !isAuthenticated) {
    return <Redirect href={"step1"} />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          header: () => <HeaderTabs children="Chats" />,
          title: "Chats",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="comments" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          header: () => <HeaderTabs children="Settings" />,

          title: "Settings",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="gear" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          header: () => <HeaderTabs children="Edit Profile" />,
          tabBarButton: () => null, // Ini akan menyembunyikan tab profile
        }}
      />
      <Tabs.Screen
        name="createRoom"
        options={{
          header: () => <HeaderTabs children="Search friends" />,
          tabBarButton: () => null, // Ini akan menyembunyikan tab profile
        }}
      />
      <Tabs.Screen
        name="room/[id]"
        options={{
          header: () => null,
          tabBarButton: () => null, // Ini akan menyembunyikan tab profile
          tabBarStyle: {
            display: "none",
          },
        }}
        // Ini akan menyembunyikan tab profile
      />
    </Tabs>
  );
}
