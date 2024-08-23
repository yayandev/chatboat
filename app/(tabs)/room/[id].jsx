import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  Platform,
  Pressable,
  Modal,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import Colors from "../../../constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { db, storage } from "../../../utils/firebase";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { useAuth } from "../../../context/authContext";
import * as ImagePicker from "expo-image-picker";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { ALERT_TYPE, Toast } from "react-native-alert-notification";
import { Audio } from "expo-av";
import { findNodeHandle } from "react-native";

// context reply chat
import { createContext, useContext } from "react";

const replyContext = createContext({
  reply: null,
  setReply: () => {},
});

const ReplyContextProvider = ({ children }) => {
  const [reply, setReply] = useState(null);

  return (
    <replyContext.Provider value={{ reply, setReply }}>
      {children}
    </replyContext.Provider>
  );
};

const useReply = () => {
  return useContext(replyContext);
};

const Header = ({ friend, loading }) => {
  const router = useRouter();

  return (
    <View style={styles.header}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
          }}
        >
          <TouchableOpacity onPress={() => router.back()} style={styles.text}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          {loading ? (
            <View style={styles.skeleton}>
              <View style={styles.skeletonImage} />
              <View style={styles.skeletonText} />
            </View>
          ) : (
            <>
              {friend?.image ? (
                <Image source={{ uri: friend?.image }} style={styles.image} />
              ) : (
                <Ionicons name="person" size={40} color="white" />
              )}
              <Text style={styles.text}>{friend?.name}</Text>
            </>
          )}
        </View>
      </View>
    </View>
  );
};

const formatDate = (timestamp) => {
  const date = new Date(timestamp.seconds * 1000);
  const today = new Date();

  // Set waktu untuk perbandingan hari
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  if (date.getTime() === today.getTime()) {
    // Jika tanggal sama dengan hari ini, tampilkan jam saja
    return new Date(timestamp.seconds * 1000).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } else {
    // Jika tanggal berbeda dari hari ini, tampilkan tanggal dan jam
    return (
      new Date(timestamp.seconds * 1000).toLocaleDateString("id-ID", {
        year: "numeric",
        month: "numeric",
        day: "numeric",
      }) +
      " " +
      new Date(timestamp.seconds * 1000).toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  }
};

const MessageAudio = ({ url, duration }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState(null);
  const [status, setStatus] = useState({});

  async function playSound() {
    console.log("Loading Sound");
    const { sound, status } = await Audio.Sound.createAsync({ uri: url });
    setSound(sound);
    setStatus(status);

    console.log("Playing Sound");
    await sound.playAsync();

    setTimeout(() => {
      setIsPlaying(false);
    }, duration);
  }

  useEffect(() => {
    return sound
      ? () => {
          console.log("Unloading Sound");
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  function formatDuration(duration) {
    const seconds = Math.ceil(duration / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  }

  return (
    <View>
      <TouchableOpacity
        onPress={async () => {
          if (!isPlaying) {
            setIsPlaying(true);
            playSound();
          } else {
            await sound.unloadAsync();
            setIsPlaying(false);
          }
        }}
        style={{
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        {isPlaying ? (
          <Ionicons name="pause" size={24} color="black" />
        ) : (
          <Ionicons name="play" size={24} color="black" />
        )}
        <Text style={{ marginLeft: 5, fontSize: 12 }}>
          {duration && formatDuration(duration)}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const MessageList = ({ id }) => {
  const [messages, setMessages] = useState([]);
  const { user } = useAuth();
  const scrollRef = useRef(null);
  const [showImage, setShowImage] = useState(null);
  const { setReply } = useReply();

  const onClose = () => {
    setShowImage(null);
  };

  const messageRefs = useRef({});

  useEffect(() => {
    const messagesRef = collection(db, `rooms/${id}/messages`);
    const q = query(messagesRef, orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      setMessages(
        querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
    });

    return () => unsubscribe();
  }, [id]);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const scrollToMessage = (messageId) => {
    const node = messageRefs.current[messageId];
    if (node) {
      const nodeHandle = findNodeHandle(node);
      node.measureLayout(
        scrollRef.current.getScrollResponder(),
        (x, y) => {
          scrollRef.current.scrollTo({ y: y, animated: true });
        },
        () => {
          console.log("Measurement failed");
        }
      );
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        style={styles.messageList}
        contentContainerStyle={{ flexGrow: 1, justifyContent: "flex-end" }}
      >
        {messages?.map((item, index) => (
          <Pressable
            style={{ width: "auto" }}
            key={index}
            onLongPress={() => {
              setReply(item);
            }}
            ref={(ref) => (messageRefs.current[item.id] = ref)} // Assign ref to each message
          >
            <View
              style={[
                styles.messageCard,
                {
                  alignSelf:
                    item.email === user?.email ? "flex-end" : "flex-start",
                },
              ]}
            >
              {item?.reply?.message && (
                <TouchableOpacity
                  onPress={() => {
                    scrollToMessage(item?.reply?.messageId); // Scroll to the replied message
                  }}
                  style={styles.messageReplyCard}
                >
                  <Text style={styles.messageReplyText}>
                    {item?.reply?.message}
                  </Text>
                </TouchableOpacity>
              )}
              {item?.reply?.audio && (
                <TouchableOpacity
                  onPress={() => {
                    scrollToMessage(item?.reply?.messageId); // Scroll to the replied message
                  }}
                  style={styles.messageReplyCard}
                >
                  <Text style={styles.messageReplyText}>
                    <Ionicons name="play" size={24} color="black" />
                  </Text>
                </TouchableOpacity>
              )}
              {item?.reply?.image && (
                <TouchableOpacity
                  onPress={() => {
                    scrollToMessage(item?.reply?.messageId); // Scroll to the replied message
                  }}
                  style={styles.messageReplyCard}
                >
                  <Image
                    source={{ uri: item?.reply?.image }}
                    style={{
                      width: 100,
                      height: 100,
                      borderRadius: 10,
                      objectFit: "contain",
                    }}
                  />
                </TouchableOpacity>
              )}
              {item?.audio && (
                <MessageAudio url={item.audio} duration={item?.duration} />
              )}
              {item?.message && (
                <Text style={styles.messageText}>{item.message}</Text>
              )}
              {item?.image && (
                <TouchableOpacity onPress={() => setShowImage(item.image)}>
                  <Image
                    source={{ uri: item.image }}
                    style={styles.imageMessage}
                  />
                </TouchableOpacity>
              )}
              <View style={styles.messageFooter}>
                {item?.email === user?.email && (
                  <Text style={styles.messageRead}>
                    {item?.read ? (
                      <Ionicons
                        name="checkmark-circle"
                        size={16}
                        color="blue"
                      />
                    ) : (
                      <Ionicons
                        name="checkmark-circle-outline"
                        size={16}
                        color="gray"
                      />
                    )}
                  </Text>
                )}
                <Text style={styles.timeText}>
                  {item?.timestamp && formatDate(item.timestamp)}
                </Text>
              </View>
            </View>
          </Pressable>
        ))}
      </ScrollView>
      <Modal
        visible={showImage ? true : false}
        animationType="slide"
        transparent
      >
        <View style={styles.modalContainer}>
          <Image source={{ uri: showImage }} style={styles.modalImage} />
          <Pressable onPress={onClose} style={styles.modalButton}>
            <Ionicons
              name="close"
              size={24}
              color="black"
              style={styles.modalButtonText}
            />
          </Pressable>
        </View>
      </Modal>
    </View>
  );
};

const FormSendMessage = ({ id }) => {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [recording, setRecording] = useState();
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  const [onRecording, setOnRecording] = useState(false);
  const { reply, setReply } = useReply();

  const handleSubmit = async () => {
    if (!message) return;

    await addDoc(collection(db, `rooms/${id}/messages`), {
      message,
      email: user?.email,
      timestamp: serverTimestamp(),
      read: false,
      reply: reply ? reply : null,
    });
    setReply(null);
    setMessage("");
  };

  const handleSendMessageImage = async () => {
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

      if (
        libraryStatus.status === "granted" &&
        cameraStatus.status === "granted"
      ) {
        let result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          quality: 1,
          selectionLimit: 1,
        });

        if (!result.canceled) {
          try {
            const response = await fetch(result.assets[0].uri);
            const blob = await response.blob();

            const refUpload = ref(
              storage,
              `messages/${result.assets[0].fileName}`
            );

            const uploadTask = uploadBytesResumable(refUpload, blob);

            uploadTask.on(
              "state_changed",
              (snapshot) => {
                // Handle progress bar or other UI updates if needed
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

                await addDoc(collection(db, `rooms/${id}/messages`), {
                  email: user?.email,
                  timestamp: serverTimestamp(),
                  image: url,
                  read: false,
                  reply: reply ? reply : null,
                });

                setReply(null);

                Toast.show({
                  type: ALERT_TYPE.SUCCESS,
                  title: "Success",
                  textBody: "Image sent successfully",
                });
              }
            );
          } catch (error) {
            Toast.show({
              type: ALERT_TYPE.ERROR,
              title: "Error",
              textBody: error.message,
            });
          }
        }
      }
    }
  };

  async function startRecording() {
    try {
      if (permissionResponse.status !== "granted") {
        console.log("Requesting permission..");
        await requestPermission();
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      setOnRecording(true);

      console.log("Starting recording..");
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      console.log("Recording started");
      Toast.show({
        type: ALERT_TYPE.SUCCESS,
        title: "Success",
        textBody: "Recording started",
        autoClose: false,
      });
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  }

  async function stopRecording() {
    console.log("Stopping recording..");
    setRecording(undefined);
    await recording.stopAndUnloadAsync();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });
    const uri = await recording.getURI();
    console.log("Recording stopped and stored at", uri);
    setOnRecording(false);
    // putar audio
    const { sound, status } = await Audio.Sound.createAsync({ uri });

    // upload audio and send message

    try {
      const response = await fetch(uri);
      const blob = await response.blob();

      const refUpload = ref(storage, `audios/${uri.split("/").pop()}`);

      const uploadTask = uploadBytesResumable(refUpload, blob);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          // Handle progress bar or other UI updates if needed
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

          await addDoc(collection(db, `rooms/${id}/messages`), {
            email: user?.email,
            timestamp: serverTimestamp(),
            audio: url,
            read: false,
            duration: status.durationMillis,
            reply: reply ? reply : null,
          });
          setReply(null);
          Toast.hide();
        }
      );
    } catch (error) {
      Toast.show({
        type: ALERT_TYPE.ERROR,
        title: "Error",
        textBody: error.message,
      });
    }
  }

  async function cancelRecording() {
    if (recording) {
      console.log("Cancelling recording..");
      await recording.stopAndUnloadAsync();
      setRecording(undefined);
      setOnRecording(false);
    }
  }

  return (
    <View>
      {reply && (
        <View style={{ paddingHorizontal: 10 }}>
          <View style={styles.replyContainer}>
            <Text style={styles.replyText}>
              <Ionicons name="arrow-back" size={24} color={Colors.primary} />
            </Text>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                width: "90%",
              }}
            >
              <View>
                {reply?.message && (
                  <Text style={styles.replyText}>
                    {reply?.message.length > 40
                      ? reply?.message.slice(0, 40) + "..."
                      : reply?.message}
                  </Text>
                )}
                {reply?.audio && (
                  <MessageAudio url={reply?.audio} duration={reply?.duration} />
                )}
                {reply?.image && (
                  <Image
                    source={{ uri: reply?.image }}
                    style={styles.replyImage}
                  />
                )}
                {reply?.email === user?.email && (
                  <Text style={{ fontSize: 14, color: Colors.light }}>You</Text>
                )}
              </View>
              <Pressable
                onPress={() => {
                  setReply(null);
                }}
              >
                <Ionicons name="close" size={24} color={"red"} />
              </Pressable>
            </View>
          </View>
        </View>
      )}
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={message}
          onChangeText={setMessage}
        />
        <View style={styles.buttonContainer}>
          {onRecording ? (
            <TouchableOpacity
              style={styles.buttonCancel}
              onPress={cancelRecording}
            >
              <Text style={styles.buttonCancelText}>
                <Ionicons name="close" size={24} color={"red"} />
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.buttonMedia}
              onPress={handleSendMessageImage}
            >
              <Text style={styles.buttonTextMedia}>
                <Ionicons name="image" size={24} color={Colors.primary} />
              </Text>
            </TouchableOpacity>
          )}
          {message.length > 0 ? (
            <TouchableOpacity
              style={styles.buttonMessage}
              onPress={handleSubmit}
            >
              <Text style={styles.buttonTextMessage}>
                <Ionicons name="send" size={24} color="white" />
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.buttonMedia}
              onPress={onRecording ? stopRecording : startRecording}
            >
              <Text style={styles.buttonTextMedia}>
                <Ionicons
                  name={onRecording ? "mic-off" : "mic"}
                  size={24}
                  color={Colors.primary}
                />
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

export default function RoomDetailScreen() {
  const { id } = useLocalSearchParams();
  const [room, setRoom] = useState(null);
  const [friend, setFriend] = useState(null);
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoom = async () => {
      // setLoading(true);
      const docRef = doc(db, "rooms", id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setRoom(docSnap.data());
        const emailFriend = docSnap
          .data()
          ?.participants.find((email) => email !== user?.email);

        const q = query(
          collection(db, "users"),
          where("email", "==", emailFriend)
        );

        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          setFriend(doc.data());
          setLoading(false);
        });
      }
    };
    fetchRoom();
  }, [id]);

  // read chat

  useEffect(() => {
    if (!id || !user?.email) return;

    const q = query(
      collection(db, `rooms/${id}/messages`),
      where("email", "!=", user?.email)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      querySnapshot.forEach(async (doc) => {
        if (doc.data().read === false) {
          await updateDoc(doc.ref, {
            read: true,
          });
        }
      });
    });

    return () => unsubscribe();
  }, [id, user?.email]);

  return (
    <ReplyContextProvider>
      <View style={styles.container}>
        <ImageBackground
          source={require("../../../assets/images/bg-room.png")}
          style={styles.backgroundImage}
          resizeMode="cover"
        />
        <View style={styles.innerContainer}>
          <Header friend={friend} loading={loading} />
          <View style={styles.messageContainer}>
            <MessageList id={id} />
          </View>
          <FormSendMessage id={id} />
        </View>
      </View>
    </ReplyContextProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background, // Optional
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  },
  innerContainer: {
    flex: 1,
    paddingTop: 25,
    flexDirection: "column",
  },
  header: {
    width: "100%",
    padding: 15,
    backgroundColor: Colors.primary,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 1,
    gap: 10,
  },
  image: {
    width: 45,
    height: 45,
    borderRadius: 50,
  },
  messageList: {
    flex: 1,
    padding: 10,
  },
  messageContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  messageCard: {
    backgroundColor: "#B5E2E2",
    borderRadius: 20,
    padding: 15,
    gap: 5,
    maxWidth: "80%",
    minWidth: 100,
    flexDirection: "column",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  messageText: {
    fontSize: 16,
  },
  timeText: {
    fontSize: 12,
    color: "#777",
    alignSelf: "flex-end",
  },
  form: {
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 50,
    padding: 15,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  buttonMessage: {
    backgroundColor: Colors.primary,
    borderRadius: 50,
    padding: 15,
    marginLeft: 10,
  },
  buttonTextMessage: {
    fontSize: 16,
    color: "#fff",
  },
  text: {
    fontSize: 16,
    color: "#fff",
  },
  buttonMedia: {
    backgroundColor: "white",
    borderRadius: 50,
    padding: 15,
    marginLeft: 10,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  buttonTextMedia: {
    fontSize: 16,
    color: Colors.primary,
  },
  imageMessage: {
    width: 200,
    height: 200,
    objectFit: "cover",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    gap: 10,
  },
  modalText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  modalButton: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
    marginTop: 10,
  },
  modalButtonText: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  modalImage: {
    width: "100%",
    height: 300,
    maxWidth: "90%",
    maxHeight: "50%",
    objectFit: "contain",
  },
  messageFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  messageRead: {
    fontSize: 12,
  },
  skeleton: {
    gap: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  skeletonText: {
    width: 100,
    height: 15,
    borderRadius: 10,
    backgroundColor: Colors.light,
  },
  skeletonImage: {
    width: 50,
    height: 50,
    borderRadius: 50,
    backgroundColor: Colors.light,
  },
  buttonCancel: {
    backgroundColor: "white",
    borderRadius: 50,
    padding: 15,
    marginLeft: 10,
    borderWidth: 1,
    borderColor: "red",
  },
  buttonCancelText: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  replyContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 10,
    backgroundColor: "#B5E2E2",
    borderRadius: 10,
  },
  replyText: {
    fontSize: 16,
  },
  replyButton: {
    backgroundColor: Colors.primary,
    borderRadius: 50,
    padding: 15,
    marginLeft: 10,
  },
  replyButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  messageReplyCard: {
    backgroundColor: Colors.light,
    padding: 10,
    gap: 5,
    maxWidth: "80%",
    minWidth: 100,
    flexDirection: "column",
    alignItems: "flex-start",
    borderRadius: 10,
    borderLeftWidth: 5,
    borderLeftColor: Colors.primary,
    opacity: 0.5,
  },
  messageReplyText: {
    fontSize: 16,
  },
  replyImage: {
    width: 100,
    height: 100,
    borderRadius: 5,
  },
});
