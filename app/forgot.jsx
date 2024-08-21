import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import LayoutView from "./../components/LayoutView";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import ButtonPrimary from "./../components/ButtonPrimary";
import { useRouter } from "expo-router";
import { useAuth } from "../context/authContext";
import { ALERT_TYPE, Toast } from "react-native-alert-notification";
import ModalLoading from "../components/ModalLoading";

export default function ForgotScreen() {
  const router = useRouter();
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleForgotPassword = async () => {
    if (!email) {
      Toast.show({
        type: ALERT_TYPE.WARNING,
        title: "Warning",
        textBody: "Please enter your email",
      });
      return;
    }

    setIsLoading(true);
    const result = await resetPassword(email);
    if (!result.success) {
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: "Error",
        textBody: result.message,
      });
      setEmail("");
    } else {
      Toast.show({
        type: ALERT_TYPE.SUCCESS,
        title: "Success",
        textBody: result.message,
      });
    }
    setIsLoading(false);
  };

  return (
    <LayoutView style={styles.container}>
      <View style={styles.header}>
        <Ionicons
          name="arrow-back"
          size={24}
          color="white"
          onPress={() => router.back()}
        />
        <Text style={styles.title}>Forgot Password</Text>
        <Text style={styles.subtitle}>
          Enter your email and we will send you a link to reset your password
        </Text>
      </View>
      <View style={styles.form}>
        <View>
          <Text style={styles.label}>Email</Text>
          <TextInput
            placeholder="Enter your email"
            autoComplete="off"
            autoCorrect={false}
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            inputMode="email"
          />
        </View>

        <ButtonPrimary onPress={handleForgotPassword}>Login</ButtonPrimary>
        <Text style={styles.text}>
          Know your password?
          <Text
            style={{ color: Colors.primary }}
            onPress={() => router.push("/login")}
          >
            Login
          </Text>
        </Text>
      </View>
      <ModalLoading visible={isLoading} />
    </LayoutView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    width: "100%",
    paddingHorizontal: 20,
    paddingVertical: 40,
    backgroundColor: Colors.primary,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    gap: 10,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#fff",
  },
  form: {
    flex: 1,
    padding: 20,
    marginTop: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 50,
    padding: 20,
    marginBottom: 20,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 50,
    padding: 20,
    marginBottom: 20,
  },
  iconContainer: {
    paddingHorizontal: 5,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.primary,
    marginLeft: 30,
    zIndex: 50,
    marginTop: -12,
    backgroundColor: "#fff",
    width: "auto",
    position: "absolute",
  },
  text: {
    textAlign: "center",
    marginTop: 20,
  },
});
