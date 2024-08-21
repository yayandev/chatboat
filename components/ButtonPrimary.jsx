import { StyleSheet, Text, TouchableOpacity } from "react-native";
import Colors from "../constants/Colors";
export default function ButtonPrimary({ children, ...props }) {
  return (
    <>
      <TouchableOpacity style={{ ...styles.button, ...props.style }} {...props}>
        <Text style={styles.text}>{children}</Text>
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.primary,
    padding: 18,
    borderRadius: 50,
    alignItems: "center",
    width: "100%",
  },
  text: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
});
