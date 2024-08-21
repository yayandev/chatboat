import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import LayoutView from "../../components/LayoutView";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/authContext";
import { ALERT_TYPE, Dialog, Toast } from "react-native-alert-notification";

export default function SettingsScreen() {
  const router = useRouter();
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    Dialog.show({
      type: ALERT_TYPE.WARNING,
      textBody: "Are you sure you want to logout?",
      button: "Logout",
      autoClose: true,
      onPressButton: async () => {
        const result = await logout();

        if (result.success) {
          Dialog.hide();
          Toast.show({
            type: ALERT_TYPE.SUCCESS,
            title: "Success",
            textBody: "Logged out successfully",
          });
          router.push("login");
        } else {
          Toast.show({
            type: ALERT_TYPE.DANGER,
            title: "Error",
            textBody: result.message,
          });
        }
      },
    });
  };
  return (
    <LayoutView style={styles.container}>
      <View style={styles.imgContainer}>
        {user?.image ? (
          <Image
            source={{ uri: user?.image }}
            style={{
              width: 150,
              height: 150,
              borderRadius: 100,
              marginBottom: 10,
            }}
          />
        ) : (
          <Ionicons name="person-circle" size={100} color="black" />
        )}
        <Text style={styles.name}>{user?.name}</Text>
      </View>
      <TouchableOpacity
        style={styles.menu}
        onPress={() => router.push("/profile")}
      >
        <View style={styles.menuItem}>
          <Ionicons name="person" size={24} color="black" />
          <Text>Edit Profile</Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="black" />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.menu}
        onPress={() => {
          Toast.show({
            type: ALERT_TYPE.WARNING,
            title: "Coming soon",
            textBody: "Feature coming soon",
          });
        }}
      >
        <View style={styles.menuItem}>
          <Ionicons name="lock-closed" size={24} color="black" />
          <Text>Change Password</Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="black" />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.menu}
        onPress={() => {
          Toast.show({
            type: ALERT_TYPE.WARNING,
            title: "Coming soon",
            textBody: "Feature coming soon",
          });
        }}
      >
        <View style={styles.menuItem}>
          <Ionicons name="trash" size={24} color="black" />
          <Text>Delete account</Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="black" />
      </TouchableOpacity>
      <TouchableOpacity onPress={handleLogout} style={styles.menu}>
        <View style={styles.menuItem}>
          <Ionicons name="log-out" size={24} color="black" />
          <Text>Logout</Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="black" />
      </TouchableOpacity>
    </LayoutView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 20,
  },
  menu: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  imgContainer: {
    alignItems: "center",
  },
});
