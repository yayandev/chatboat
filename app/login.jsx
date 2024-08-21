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
import ModalLoading from "../components/ModalLoading";
import { useAuth } from "../context/authContext";
import { ALERT_TYPE, Toast } from "react-native-alert-notification";

export default function LoginScreen() {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Toast.show({
        type: ALERT_TYPE.WARNING,
        title: "Warning",
        textBody: "Please fill in all the fields",
      });
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    if (!result.success) {
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: "Error",
        textBody: result.message,
      });
    }
    setLoading(false);
  };
  return (
    <>
      <LayoutView style={styles.container}>
        <View style={styles.header}>
          <Ionicons
            name="arrow-back"
            size={24}
            color="white"
            onPress={() => router.back()}
          />
          <Text style={styles.title}>Login</Text>
          <Text style={styles.subtitle}>Fill up your details to login.</Text>
          <Text style={[styles.subtitle, { fontStyle: "italic" }]}>
            forgot password click
            <Text
              style={{ color: Colors.secondary }}
              onPress={() => router.push("/forgot")}
            >
              {" "}
              Here
            </Text>
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
              inputMode="email"
              onChangeText={setEmail}
            />
          </View>
          <View>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                placeholder="Enter your password"
                autoComplete="off"
                autoCorrect={false}
                secureTextEntry={!isPasswordVisible}
                style={[{ flex: 1 }]}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                style={styles.iconContainer}
              >
                <Ionicons
                  name={isPasswordVisible ? "eye-off" : "eye"}
                  size={24}
                  color={Colors.primary}
                />
              </TouchableOpacity>
            </View>
          </View>

          <ButtonPrimary onPress={handleLogin}>Login</ButtonPrimary>
          <Text style={styles.text}>
            Don't have an account?
            <Text
              style={{ color: Colors.primary }}
              onPress={() => router.push("/register")}
            >
              Register
            </Text>
          </Text>
        </View>
      </LayoutView>
      <ModalLoading visible={loading} />
    </>
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
