import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import React, { useEffect, useState } from "react";
import LayoutView from "../../components/LayoutView";
import Colors from "@/constants/Colors";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/authContext";
import { db } from "./../../utils/firebase";
import {
  collection,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";

import * as Notifications from "expo-notifications";

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

const RoomCard = ({ room }) => {
  const router = useRouter();
  const [friend, setFriend] = useState({});
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [lastMessage, setLastMessage] = useState({});

  useEffect(() => {
    const fetchFriend = async () => {
      if (room) {
        const emailFriend = room?.participants.find(
          (email) => email !== user?.email
        );
        const q = query(
          collection(db, "users"),
          where("email", "==", emailFriend)
        );

        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          setFriend(doc.data());
        });

        setLoading(false);
      }
    };

    fetchFriend();
  }, [room]);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(
        collection(db, `rooms/${room.id}/messages`),
        where("timestamp", "!=", null),
        orderBy("timestamp", "desc")
      ),
      (querySnapshot) => {
        if (!querySnapshot.empty) {
          setLastMessage(querySnapshot.docs[0]?.data());
          const sender = querySnapshot.docs[0]?.data()?.email;
          const read = querySnapshot.docs[0]?.data()?.read;

          if (sender !== user?.email && !read) {
            Notifications.scheduleNotificationAsync({
              content: {
                title:
                  "New message from " + querySnapshot.docs[0]?.data()?.email,
                body: querySnapshot.docs[0]?.data()?.message || "Photo",
              },
              trigger: null,
            });
          }
        }
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  return (
    <>
      {loading ? (
        <View style={styles.skeletonCard}>
          <View style={styles.skeletonImage} />
          <View>
            <View style={styles.skeletonText} />
            <View style={styles.skeletonText} />
          </View>
        </View>
      ) : (
        <TouchableOpacity
          onPress={() => router.push(`room/${room.id}`)}
          style={styles.roomCard}
        >
          {friend?.image ? (
            <Image source={{ uri: friend?.image }} style={styles.image} />
          ) : (
            <Ionicons name="person" size={50} color="black" />
          )}
          <View>
            <Text style={styles.name}>{friend?.name}</Text>
            {lastMessage?.message && (
              <Text style={styles.lastMessage}>
                {lastMessage?.read ? (
                  <Ionicons name="checkmark-circle" size={14} color="blue" />
                ) : (
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={14}
                    color="gray"
                  />
                )}{" "}
                {lastMessage?.message.length > 20
                  ? lastMessage?.message.slice(0, 20) + "..."
                  : lastMessage?.message}
              </Text>
            )}
            {lastMessage?.image && (
              <Text style={styles.lastMessage}>
                <Ionicons name="image" size={16} color="black" />
                {" " + "Photo"}
              </Text>
            )}
            {lastMessage?.audio && (
              <Text style={styles.lastMessage}>
                <Ionicons name="play" size={16} color="black" />
                {" " + "Audio"}
              </Text>
            )}
          </View>
        </TouchableOpacity>
      )}
    </>
  );
};

export default function HomeScreen() {
  const router = useRouter();
  const [rooms, setRooms] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const q = query(
      collection(db, "rooms"),
      where("participants", "array-contains", user?.email)
    );
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      setRooms(
        querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
    });

    return () => unsubscribe();
  }, []);
  return (
    <View style={styles.container}>
      <LayoutView>
        {rooms.map((room) => (
          <RoomCard key={room.id} room={room} />
        ))}
      </LayoutView>
      <TouchableOpacity
        onPress={() => router.push("createRoom")}
        style={styles.buttonAddChat}
      >
        <MaterialCommunityIcons name="chat-plus" size={30} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  buttonAddChat: {
    backgroundColor: Colors.primary,
    padding: 18,
    borderRadius: 50,
    position: "absolute",
    bottom: 20,
    right: 20,
  },
  roomCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    marginBottom: 10,
    // hover
    "&:hover": {
      backgroundColor: "#f5f5f5",
    },
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 50,
  },
  skeletonCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  skeletonImage: {
    width: 50,
    height: 50,
    borderRadius: 50,
    backgroundColor: "#ccc",
  },
  skeletonText: {
    width: 200,
    height: 15,
    borderRadius: 10,
    backgroundColor: "#ccc",
    marginBottom: 5,
  },
  name: {
    fontSize: 18,
    fontWeight: "500",
  },
  lastMessage: {
    fontSize: 14,
    color: "#666",
  },
});
