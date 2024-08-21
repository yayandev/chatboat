import { Slot, useRouter, useSegments } from "expo-router";
import { AuthProvider, useAuth } from "@/context/authContext";
import { useEffect } from "react";
import { AlertNotificationRoot } from "react-native-alert-notification";
const MainLayout = () => {
  const segments = useSegments();
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const inApp = segments[0] === "(tabs)";

  useEffect(() => {
    if (typeof user === "undefined") return;

    if (user && !inApp) {
      router.replace("(tabs)"); // Gunakan replace jika ingin mencegah history stack bertambah
    } else if (!isAuthenticated) {
      router.replace("step1");
    }
  }, [isAuthenticated, user, router]);

  return <Slot />;
};

export default function RootLayout() {
  return (
    <AuthProvider>
      <AlertNotificationRoot>
        <MainLayout />
      </AlertNotificationRoot>
    </AuthProvider>
  );
}
