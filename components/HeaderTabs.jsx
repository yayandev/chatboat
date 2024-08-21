import { View, Text, StyleSheet } from "react-native";
import Colors from "../constants/Colors";

export default function HeaderTabs({ children }) {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    width: "100%",
    padding: 15,
    marginTop: 30,
    backgroundColor: Colors.primary,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    gap: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
});
