import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useState } from "react";
import { ALERT_TYPE, Toast } from "react-native-alert-notification";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
} from "firebase/firestore"; // Import Firestore functions
import { useAuth } from "../../context/authContext";
import { db } from "../../utils/firebase";
import Colors from "../../constants/Colors";
import { useRouter } from "expo-router";

export default function CreateRoom() {
  const [friendEmail, setFriendEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const handleSubmit = async () => {
    setIsLoading(true);

    if (!friendEmail) {
      Toast.show({
        type: ALERT_TYPE.WARNING,
        title: "Warning",
        textBody: "Please enter your friend's email",
      });
      setIsLoading(false);
      return;
    }

    if (friendEmail === user?.email) {
      Toast.show({
        type: ALERT_TYPE.WARNING,
        title: "Warning",
        textBody: "You cannot add yourself as a friend",
      });
      setIsLoading(false);
      return;
    }

    const checkEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!checkEmail.test(friendEmail)) {
      Toast.show({
        type: ALERT_TYPE.WARNING,
        title: "Warning",
        textBody: "Please enter a valid email address",
      });
      setIsLoading(false);
      return;
    }

    try {
      const currentUserEmail = user?.email;

      if (!currentUserEmail) {
        Toast.show({
          type: ALERT_TYPE.WARNING,
          title: "Warning",
          textBody: "User is not logged in",
        });
        setIsLoading(false);
        return;
      }

      // Cek apakah pengguna teman ada di database
      const userQuery = query(
        collection(db, "users"),
        where("email", "==", friendEmail)
      );
      const querySnapshotUser = await getDocs(userQuery);

      if (querySnapshotUser.empty) {
        Toast.show({
          type: ALERT_TYPE.DANGER,
          title: "Error",
          textBody: "User not found",
        });
        setIsLoading(false);
        return;
      }

      // Cek apakah room sudah ada berdasarkan kombinasi dua email
      const roomQuery = query(
        collection(db, "rooms"),
        where("participants", "array-contains", currentUserEmail)
      );
      const querySnapshot = await getDocs(roomQuery);

      let roomExists = false;
      let roomId = "";

      roomExists = querySnapshot.docs.some((doc) => {
        const participants = doc.data().participants;
        if (participants.includes(friendEmail)) {
          roomId = doc.id;
          return true;
        }
        return false;
      });

      if (roomExists) {
        router.push(`/room/${roomId}`);
      } else {
        // Buat room baru jika belum ada
        const docRef = await addDoc(collection(db, "rooms"), {
          participants: [currentUserEmail, friendEmail],
          timestamp: serverTimestamp(),
        });

        router.push(`/room/${docRef.id}`);
      }
    } catch (error) {
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: "Error",
        textBody: "Failed to create room. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Enter your friend's email"
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        style={styles.input}
        value={friendEmail}
        onChangeText={setFriendEmail}
      />
      <TouchableOpacity
        style={styles.button}
        onPress={handleSubmit}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Create Room</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    width: "80%",
    marginBottom: 10,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 5,
    padding: 10,
    width: "80%",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
  },
});
