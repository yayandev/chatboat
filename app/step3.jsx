import { Animated, Image, StyleSheet, Text, View } from "react-native";
import ButtonPrimary from "../components/ButtonPrimary";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";

export default function WelcomeScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handlePress = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      router.push("/register");
    });
  };
  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Image
        source={require("../assets/images/welcome.png")}
        style={styles.welcomeImage}
      />
      <Text style={styles.text}>
        Chatboat will be ready to chat & make you happy
      </Text>
      <ButtonPrimary onPress={handlePress}>Get Started</ButtonPrimary>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: 20,
    justifyContent: "center",
    gap: 20,
  },
  welcomeImage: {
    height: 200,
    marginBottom: 10,
    resizeMode: "contain",
  },
  text: {
    fontSize: 24,
    fontWeight: "medium",
    textAlign: "center",
  },
});
