import { StatusBar } from "expo-status-bar";
import { ScrollView, View } from "react-native";

export default function LayoutView({ children, ...props }) {
  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <StatusBar style="dark" backgroundColor="white" />
      <View {...props} style={{ ...props.style }}>
        {children}
      </View>
    </ScrollView>
  );
}
