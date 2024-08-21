import { View, Text, StyleSheet } from "react-native";
import LayoutView from "./../components/LayoutView";
import Colors from "@/constants/Colors";
import ButtonPrimary from "./../components/ButtonPrimary";
import { useRouter } from "expo-router";
import { useState } from "react";
import ModalLoading from "../components/ModalLoading";
import { sendEmailVerification } from "firebase/auth";
import { ALERT_TYPE, Toast } from "react-native-alert-notification";

export default function VerifyScreen({ user }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleVerify = async () => {
    setIsLoading(true);

    const result = await sendEmailVerification(user);

    if (!result.success) {
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: "Error",
        textBody: result.message,
      });
    } else {
      Toast.show({
        type: ALERT_TYPE.SUCCESS,
        title: "Success",
        textBody: "Check your email to verify your account.",
      });
    }
  };
  return (
    <LayoutView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>OTP Verification</Text>
        <Text style={styles.subtitle}>Please verify your account.</Text>
      </View>
      <View style={styles.form}>
        <Text
          style={{
            fontSize: 16,
            color: Colors.secondary,
            marginBottom: 30,
            alignSelf: "center",
          }}
        >
          {user?.email}.
        </Text>

        <ButtonPrimary onPress={handleVerify}>Send Verification</ButtonPrimary>
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
    paddingHorizontal: 30,
    paddingVertical: 45,
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
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  input: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: Colors.primary,
    textAlign: "center",
    fontSize: 20,
    color: Colors.primary,
  },
  text: {
    textAlign: "center",
    marginTop: 20,
  },
});
