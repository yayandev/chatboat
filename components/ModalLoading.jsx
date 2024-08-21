import { View, Modal, ActivityIndicator, StyleSheet } from "react-native";
import React from "react";
import Colors from "../constants/Colors";

export default function ModalLoading({ visible }) {
  return (
    <Modal transparent={true} animationType="fade" visible={visible}>
      <View style={styles.container}>
        <View style={styles.modal}>
          <ActivityIndicator
            size="large"
            color={Colors.primary}
            style={{
              transform: [{ scale: 1.5 }],
            }}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modal: {
    width: 200,
    paddingHorizontal: 20,
    paddingVertical: 30,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 10,
  },
});
