import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@/context/authContext";
import * as Notifications from "expo-notifications";

export const NotifContext = createContext({
  setNotif: () => {},
  notif: [],
});

// Konfigurasi notifikasi
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const requestNotificationPermission = async () => {
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== "granted") {
    await Notifications.requestPermissionsAsync();
  }
};

export const useNotif = () => useContext(NotifContext);

const NotifProvider = ({ children }) => {
  const [notif, setNotif] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
    }
  }, [user]);

  return (
    <NotifContext.Provider
      value={{
        notif,
        setNotif,
      }}
    >
      {children}
    </NotifContext.Provider>
  );
};

export default NotifProvider;
