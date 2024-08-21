import {
  Text,
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Platform,
  Image,
} from "react-native";
import React, { useEffect, useState } from "react";
import LayoutView from "../../components/LayoutView";
import { Ionicons } from "@expo/vector-icons";
import ButtonPrimary from "../../components/ButtonPrimary";
import Colors from "../../constants/Colors";
import { useAuth } from "../../context/authContext";
import { ALERT_TYPE, Toast } from "react-native-alert-notification";
import { doc, setDoc, updateDoc } from "firebase/firestore"; // Tambahkan updateDoc
import { db, storage } from "../../utils/firebase"; // Gabungkan db dan storage
import ModalLoading from "../../components/ModalLoading";
import * as ImagePicker from "expo-image-picker";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";

export default function ProfileScreen() {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.name);
  const [email, setEmail] = useState(user?.email);
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(user?.image || null);

  useEffect(() => {
    (async () => {
      if (Platform.OS !== "web") {
        const libraryStatus =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (libraryStatus.status !== "granted") {
          alert("Sorry, we need camera roll permissions to make this work!");
        }

        const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
        if (cameraStatus.status !== "granted") {
          alert("Sorry, we need camera permissions to make this work!");
        }
      }
    })();
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 4],
      quality: 1,
      selectionLimit: 1,
    });

    if (!result.canceled) {
      try {
        const response = await fetch(result.assets[0].uri);
        const blob = await response.blob();

        const refUpload = ref(storage, `images/${user.uid}`);
        const uploadTask = uploadBytesResumable(refUpload, blob);

        uploadTask.on(
          "state_changed",
          (snapshot) => {
            setLoading(true);
          },
          (error) => {
            Toast.show({
              type: ALERT_TYPE.ERROR,
              title: "Error",
              textBody: error.message,
            });
          },
          async () => {
            const url = await getDownloadURL(uploadTask.snapshot.ref);

            setImage(url);

            const userRef = doc(db, "users", user.uid);

            setDoc(userRef, { image: url }, { merge: true }).then(() => {
              setUser({ ...user, image: url });
              Toast.show({
                type: ALERT_TYPE.SUCCESS,
                title: "Success",
                textBody: "Profile picture updated successfully",
              });
            });

            setLoading(false);
          }
        );
      } catch (error) {
        Toast.show({
          type: ALERT_TYPE.ERROR,
          title: "Error",
          textBody: error.message,
        });
        setLoading(false);
      }
    }
  };

  const updateProfile = async () => {
    if (!name) {
      Toast.show({
        type: ALERT_TYPE.WARNING,
        title: "Warning",
        textBody: "Please fill in all the fields",
      });
      return;
    }

    if (name === user?.name) {
      return;
    }

    setLoading(true);
    const userRef = doc(db, "users", user.uid);

    try {
      await updateDoc(userRef, { name });

      Toast.show({
        type: ALERT_TYPE.SUCCESS,
        title: "Success",
        textBody: "Profile updated successfully",
      });

      setUser({ ...user, name });
    } catch (error) {
      Toast.show({
        type: ALERT_TYPE.ERROR,
        title: "Error",
        textBody: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <LayoutView style={styles.container}>
      <View style={styles.imgContainer}>
        {image ? (
          <Image
            source={{ uri: image }}
            style={{ width: 150, height: 150, borderRadius: 100 }}
          />
        ) : (
          <Ionicons name="person-circle" size={100} color="black" />
        )}
        <TouchableOpacity style={styles.editBtn} onPress={pickImage}>
          <Text style={styles.text}>
            Edit Profile <Ionicons name="pencil" size={20} color="black" />
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.form}>
        <View>
          <Text style={styles.label}>Name</Text>
          <TextInput
            placeholder="Enter your name"
            autoComplete="off"
            autoCorrect={false}
            style={styles.input}
            value={name}
            onChangeText={setName}
          />
        </View>
        <View>
          <Text style={styles.label}>Email</Text>
          <TextInput
            placeholder="Enter your email"
            autoComplete="off"
            autoCorrect={false}
            style={styles.input}
            value={email}
            editable={false} // Ubah readOnly menjadi editable={false}
          />
        </View>

        <ButtonPrimary onPress={updateProfile}>Update Profile</ButtonPrimary>
      </View>
      <ModalLoading visible={loading} />
    </LayoutView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 20,
  },

  imgContainer: {
    alignItems: "center",
  },
  form: {
    flex: 1,
    padding: 20,
    marginTop: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 50,
    padding: 20,
    marginBottom: 20,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 50,
    padding: 20,
    marginBottom: 20,
  },
  iconContainer: {
    paddingHorizontal: 5,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.primary,
    marginLeft: 30,
    zIndex: 50,
    marginTop: -14,
    width: "auto",
    position: "absolute",
  },
  text: {
    textAlign: "center",
    marginTop: 20,
  },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
});
