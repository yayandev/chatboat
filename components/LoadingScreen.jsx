import { View, StyleSheet, ActivityIndicator } from "react-native";
import React from "react";
import Colors from "../constants/Colors";

export default function LoadingScreen() {
  return (
    <View style={styles.container}>
      <ActivityIndicator
        size="large"
        color={Colors.primary}
        style={{
          transform: [{ scale: 1.5 }],
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
});
